export type Gig = {
  id: string;
  title: string;
  brandName: string;
  category: string;
  description: string;
  rate: number;
  rateUnit: "hr" | "flat" | "half_day" | "day";
  durationLabel: string;
  locationText: string;
  distanceKm: number | null;
  isRemote: boolean;
};

export type TalentProfile = {
  id: string;
  name: string;
  initials: string;
  tagline: string;
  bio: string;
  tags: string[];
  interests: string[];
  locationText: string;
  distanceKm: number | null;
  lat: number;
  lng: number;
  rateRangeLabel: string;
  rating: number;
  reviewCount: number;
  pastJobs: { title: string; brand: string; date: string }[];
  reviews: { brand: string; stars: number; quote: string }[];
};
