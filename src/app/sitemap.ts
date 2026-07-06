import type { MetadataRoute } from "next";
import { getAllRaces } from "@/lib/firebase/races";
import { SITE_URL } from "@/lib/utils/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/races`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  let races: Awaited<ReturnType<typeof getAllRaces>> = [];
  try {
    races = await getAllRaces(500);
  } catch (err) {
    console.error("[sitemap] Failed to load races:", err);
  }

  const raceRoutes: MetadataRoute.Sitemap = races.map((race) => ({
    url: `${SITE_URL}/races/${race.slug}`,
    lastModified: race.lastVerified ?? race.date,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...raceRoutes];
}
