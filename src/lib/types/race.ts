import type { Timestamp, GeoPoint } from "firebase/firestore";

export type RaceType =
  | "5K"
  | "10K"
  | "Half Marathon"
  | "Full Marathon"
  | "Ultra"
  | "Fun Run"
  | "Stadium Run";

export type RegistrationStatus =
  | "open"
  | "closed"
  | "not_yet_open"
  | "sold_out";

export type EventStatus = "upcoming" | "completed" | "cancelled";

export type TerrainType = "road" | "trail" | "mixed";

export type RaceSource =
  | "manual"
  | "scrape_townscript"
  | "scrape_indianmarathons"
  | "community";

export interface Race {
  id: string;
  slug: string;
  name: string;

  date: Timestamp;
  dateEnd?: Timestamp;

  city: string;
  state: string;
  venue?: string;
  location: GeoPoint;
  geohash: string;

  distances: RaceType[];
  terrain?: TerrainType;
  routeDescription?: string;
  elevationGain?: number;

  organizerName: string;
  organizerWebsite?: string;

  registrationUrl?: string;
  registrationStatus: RegistrationStatus;
  registrationOpens?: Timestamp;
  registrationCloses?: Timestamp;

  eventStatus: EventStatus;
  editionNumber?: number;
  photos?: string[];
  description?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  source: RaceSource;

  // Curation & Urgency
  sourceUrl?: string;
  notes?: string;
  lastVerified?: Timestamp;
  interestCount?: number;
}

export interface RaceSearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  types?: RaceType[];
  dateFrom?: string;
  dateTo?: string;
  sort?: "date" | "distance" | "type";
  query?: string;
}

export interface SerializedRace {
  id: string;
  slug: string;
  name: string;

  date: string;
  dateEnd?: string;

  city: string;
  state: string;
  venue?: string;
  lat: number;
  lng: number;

  distances: RaceType[];
  terrain?: TerrainType;
  routeDescription?: string;
  elevationGain?: number;

  organizerName: string;
  organizerWebsite?: string;

  registrationUrl?: string;
  registrationStatus: RegistrationStatus;
  registrationOpens?: string;
  registrationCloses?: string;

  eventStatus: EventStatus;
  editionNumber?: number;
  photos?: string[];
  description?: string;

  // Curation & Urgency
  sourceUrl?: string;
  notes?: string;
  lastVerified?: string;
  interestCount?: number;
}
