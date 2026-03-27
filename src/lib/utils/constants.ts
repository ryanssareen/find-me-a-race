import type { RaceType } from "@/lib/types/race";

export const RACE_TYPES: RaceType[] = [
  "5K",
  "10K",
  "Half Marathon",
  "Full Marathon",
  "Ultra",
  "Fun Run",
  "Stadium Run",
];

export const RACE_TYPE_COLORS: Record<RaceType, string> = {
  "5K": "bg-green-100 text-green-800",
  "10K": "bg-blue-100 text-blue-800",
  "Half Marathon": "bg-purple-100 text-purple-800",
  "Full Marathon": "bg-orange-100 text-orange-800",
  Ultra: "bg-red-100 text-red-800",
  "Fun Run": "bg-yellow-100 text-yellow-800",
  "Stadium Run": "bg-teal-100 text-teal-800",
};

export const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "distance", label: "Distance from you" },
  { value: "type", label: "Race type" },
] as const;

export const DATE_FILTER_PRESETS = [
  { value: "this-weekend", label: "This Weekend" },
  { value: "this-month", label: "This Month" },
  { value: "next-3-months", label: "Next 3 Months" },
  { value: "custom", label: "Custom Range" },
] as const;

export const DEFAULT_SEARCH_RADIUS_KM = 50;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;
