import type { Gig, TalentProfile } from "@/types/domain";

export const mockGigs: Gig[] = [
  {
    id: "gig-1",
    title: "Studio Product Shoot",
    brandName: "Nova Skincare",
    category: "Photoshoot",
    description:
      "Model a 6-piece skincare range for e-commerce photography. Studio lighting, no experience required.",
    rate: 180,
    rateUnit: "flat",
    durationLabel: "2 hrs",
    locationText: "Sydney CBD",
    distanceKm: 3.2,
    isRemote: false,
  },
  {
    id: "gig-2",
    title: "Pop-Up Brand Ambassador",
    brandName: "Bloom Coffee Co.",
    category: "Event Promo",
    description:
      "Hand out samples and chat to customers at a weekend pop-up. Friendly energy over experience.",
    rate: 35,
    rateUnit: "hr",
    durationLabel: "4 hrs",
    locationText: "Newtown",
    distanceKm: 6.0,
    isRemote: false,
  },
  {
    id: "gig-3",
    title: "UGC Testimonial Video",
    brandName: "FitGear Australia",
    category: "Content Video",
    description:
      "Film a 30-second honest reaction video with your phone at home. Script and product provided.",
    rate: 150,
    rateUnit: "flat",
    durationLabel: "~30 min",
    locationText: "Remote",
    distanceKm: null,
    isRemote: true,
  },
];

export const mockTalent: TalentProfile[] = [
  {
    id: "talent-1",
    name: "Maya Chen",
    initials: "MC",
    tagline:
      "Content creator & part-time model — loves testing skincare and fashion pieces on camera.",
    bio: "Third-year marketing student who fell into UGC work after posting skincare routines for fun. Comfortable both in front of a studio camera and filming casual phone content at home. Quick turnaround, always on brief.",
    tags: ["Photoshoot", "Content Video"],
    interests: ["Skincare", "Hiking", "Coffee", "Thrifting"],
    locationText: "Sydney CBD",
    distanceKm: 2.1,
    lat: -33.8688,
    lng: 151.2093,
    rateRangeLabel: "$40–90/hr",
    rating: 4.9,
    reviewCount: 12,
    pastJobs: [
      { title: "UGC Testimonial Video", brand: "FitGear Australia", date: "Jun 2026" },
      { title: "Instagram Reel Campaign", brand: "Sunset Eyewear", date: "May 2026" },
    ],
    reviews: [
      {
        brand: "Sunset Eyewear",
        stars: 5,
        quote: "Nailed the brief on the first take — super professional and easy to direct.",
      },
    ],
  },
];
