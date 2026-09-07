import { Listing, UserProfile } from '../types';

export function calculateScore(listing: Listing, prefs: UserProfile): number {
  let score = 0;

  // 1. Location match (Case insensitive)
  if (prefs.preferredLocation && listing.location.toLowerCase().includes(prefs.preferredLocation.toLowerCase())) {
    score += 40;
  }

  // 2. Budget match
  if (prefs.budgetMax > 0) {
    if (listing.price <= prefs.budgetMax) {
      score += 30;
    } else {
      // Penalty for being over budget
      const ratio = prefs.budgetMax / listing.price;
      score += Math.max(0, 30 * ratio); 
    }
  }

  // 3. BHK match
  if (prefs.preferredBhk > 0) {
    if (listing.bhk === prefs.preferredBhk) {
      score += 20;
    } else if (Math.abs(listing.bhk - prefs.preferredBhk) === 1) {
      score += 10;
    }
  }

  // 4. Amenities match
  if (prefs.requiredAmenities.length > 0) {
    const matched = prefs.requiredAmenities.filter(a => 
      listing.amenities.some(la => la.toLowerCase() === a.toLowerCase())
    );
    score += (matched.length / prefs.requiredAmenities.length) * 10;
  }

  return score;
}

export function getRecommendations(listings: Listing[], prefs: UserProfile): (Listing & { score: number })[] {
  let filteredListings = listings;

  if (prefs.preferredDistrict) {
    filteredListings = filteredListings.filter(l => l.district.toLowerCase() === prefs.preferredDistrict.toLowerCase());
  }

  if (prefs.preferredHouseType) {
    filteredListings = filteredListings.filter(l => l.houseType.toLowerCase() === prefs.preferredHouseType.toLowerCase());
  }

  // Actually, let's strictly filter out houses outside budget range
  if (prefs.budgetMax > 0) {
    filteredListings = filteredListings.filter(l => l.price <= prefs.budgetMax && l.price >= prefs.budgetMin);
  }

  // Filter out houses outside sqft range
  const sqftMin = prefs.sqftMin ?? 400;
  const sqftMax = prefs.sqftMax ?? 3000;
  filteredListings = filteredListings.filter(l => {
    const sizeMap: Record<number, number> = { 1: 680, 2: 1120, 3: 1650, 4: 2400 };
    const area = sizeMap[l.bhk] || (l.bhk * 480 + 150);
    return area >= sqftMin && area <= sqftMax;
  });

  return filteredListings
    .map(l => ({ ...l, score: calculateScore(l, prefs) }))
    .sort((a, b) => b.score - a.score);
}
