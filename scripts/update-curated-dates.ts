import * as fs from "fs";
import * as path from "path";

// A simple CSV parser that respects double quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => s.trim());
}

async function updateCuratedDates() {
  // 1. Get access token from config
  const configPath = "/Users/ryan/.config/configstore/firebase-tools.json";
  if (!fs.existsSync(configPath)) {
    console.error(`Error: firebase-tools config not found at ${configPath}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const accessToken = config.tokens?.access_token;
  if (!accessToken) {
    console.error("Error: Could not find access_token in firebase-tools config.");
    console.error("Please run `npx firebase projects:list` to log in and refresh credentials.");
    process.exit(1);
  }

  // 2. Read CSV file
  const csvPath = path.join(__dirname, "../backups/antigravity-enrichment-2026-05-25.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter(line => line.trim() !== "");
  if (lines.length < 2) {
    console.log("No rows to process.");
    process.exit(0);
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });

  console.log(`Starting Firestore curation update for ${rows.length} races using REST API...`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Set today's date for closing check (using the defined date 2026-05-26)
  const today = new Date("2026-05-26T00:00:00Z");

  // Helper to construct Firestore REST field values
  const toFirestoreField = (val: string | null, isTimestamp = false) => {
    if (!val || val === "null" || val.trim() === "") {
      return { nullValue: null };
    }
    if (isTimestamp) {
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) {
          return { nullValue: null };
        }
        return { timestampValue: d.toISOString() };
      } catch {
        return { nullValue: null };
      }
    }
    return { stringValue: val };
  };

  // We process in small concurrent batches to be efficient but polite
  const batchSize = 10;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (row) => {
      const raceId = row["id"];
      if (!raceId) return;

      // Determine fields to update
      const updateMaskPaths: string[] = [
        "registrationUrl",
        "registrationOpens",
        "registrationCloses",
        "sourceUrl",
        "notes",
        "lastVerified",
        "updatedAt",
        "registrationStatus"
      ];

      // Parse dates for check
      const opensStr = row["registrationOpens"];
      const closesStr = row["registrationCloses"];
      
      let finalStatus = row["registrationStatus"] || "open";

      // If registrationCloses date has passed today, override status to closed
      if (closesStr && closesStr !== "null" && closesStr.trim() !== "") {
        const closesDate = new Date(closesStr);
        if (!isNaN(closesDate.getTime()) && closesDate < today) {
          finalStatus = "closed";
        }
      }

      // If registrationOpens is in the future, set to not_yet_open
      if (opensStr && opensStr !== "null" && opensStr.trim() !== "") {
        const opensDate = new Date(opensStr);
        if (!isNaN(opensDate.getTime()) && opensDate > today && finalStatus !== "closed") {
          finalStatus = "not_yet_open";
        }
      }

      const fieldsPayload: Record<string, any> = {
        registrationUrl: toFirestoreField(row["registrationUrl"]),
        registrationOpens: toFirestoreField(opensStr, true),
        registrationCloses: toFirestoreField(closesStr, true),
        sourceUrl: toFirestoreField(row["sourceUrl"]),
        notes: toFirestoreField(row["notes"]),
        lastVerified: { timestampValue: new Date().toISOString() },
        updatedAt: { timestampValue: new Date().toISOString() },
        registrationStatus: { stringValue: finalStatus }
      };

      const urlParams = updateMaskPaths.map(p => `updateMask.fieldPaths=${p}`).join("&");
      const url = `https://firestore.googleapis.com/v1/projects/find-me-a-race/databases/(default)/documents/races/${raceId}?${urlParams}`;

      try {
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            fields: fieldsPayload
          })
        });

        const resData = await response.json() as any;
        if (response.ok) {
          successCount++;
          console.log(`[SUCCESS] Updated ${row["name"]} (${raceId}) -> Status: ${finalStatus}`);
        } else {
          failureCount++;
          console.error(`[ERROR] Failed to update ${row["name"]} (${raceId}):`, JSON.stringify(resData.error || resData));
        }
      } catch (err) {
        failureCount++;
        console.error(`[EXCEPT] Network error updating ${row["name"]} (${raceId}):`, err);
      }
    }));
  }

  console.log(`\nCuration seeding finished:`);
  console.log(`- Successfully updated: ${successCount}`);
  console.log(`- Failed: ${failureCount}`);

  if (failureCount > 0) {
    process.exit(1);
  }
}

updateCuratedDates().catch(err => {
  console.error("Curation update failed:", err);
  process.exit(1);
});
