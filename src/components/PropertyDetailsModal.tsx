import React, { useState, useMemo } from 'react';
import { Listing } from '../types';
import { 
  X, MapPin, IndianRupee, BedDouble, Check, Building, Info, 
  Map, Compass, Ruler, Flame, Shield, HelpCircle, Phone, 
  Mail, Calendar, School, Train, ShoppingBag, Hospital, 
  CornerRightDown, Landmark, Sparkles, Star, ThumbsUp, ThumbsDown, 
  MessageSquare, Smile, Meh, Frown
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

// Map real neighborhoods to specific highly realistic local landmarks to elevate the user experience
const NEIGHBORHOOD_LANDMARKS: Record<string, {
  schools: { name: string; dist: string }[];
  transit: { name: string; dist: string }[];
  shopping: { name: string; dist: string }[];
  medical: { name: string; dist: string }[];
}> = {
  'Adyar': {
    schools: [
      { name: 'The Hindu Senior Secondary School', dist: '0.4 km' },
      { name: 'Bala Vidya Mandir Global School', dist: '0.9 km' },
      { name: 'Kendriya Vidyalaya CLRI', dist: '1.2 km' }
    ],
    transit: [
      { name: 'Kasturba Nagar MRTS Station', dist: '0.5 km' },
      { name: 'Adyar Bus Depot & Junction', dist: '0.7 km' },
      { name: 'Thiruvanmiyur MRTS Terminal', dist: '1.8 km' }
    ],
    shopping: [
      { name: 'Nilgiri’s Premium Food Store', dist: '0.3 km' },
      { name: 'Grand Square Mall', dist: '2.0 km' },
      { name: 'Phoenix Marketcity Mall', dist: '4.2 km' }
    ],
    medical: [
      { name: 'Fortis Malar Multispecialty Hospital', dist: '0.8 km' },
      { name: 'Padmapriya Hospital', dist: '1.1 km' },
      { name: 'Aswene Treatment Center', dist: '1.6 km' }
    ]
  },
  'OMR': {
    schools: [
      { name: 'Gateway International School', dist: '1.1 km' },
      { name: 'Sishya School OMR Branch', dist: '1.8 km' },
      { name: 'Hindustan International School', dist: '2.5 km' }
    ],
    transit: [
      { name: 'Sholinganallur Junction Bus Hub', dist: '0.6 km' },
      { name: 'Karapakkam Bus Stop', dist: '1.2 km' },
      { name: 'Taramani MRTS Station', dist: '4.8 km' }
    ],
    shopping: [
      { name: 'Vivira Mall & Cinema Screen', dist: '1.9 km' },
      { name: 'The Marina Mall Sholinganallur', dist: '3.5 km' },
      { name: 'BSR Mall & Supermarket', dist: '4.1 km' }
    ],
    medical: [
      { name: 'Apollo Specialty Hospitals OMR', dist: '1.2 km' },
      { name: 'Gleneagles Global Health City', dist: '3.6 km' },
      { name: 'LifeLine General Hospital', dist: '4.0 km' }
    ]
  },
  'RS Puram': {
    schools: [
      { name: 'G.D. Matriculation Higher Sec School', dist: '0.7 km' },
      { name: 'Chandra Matriculation School', dist: '1.4 km' },
      { name: 'St. Francis Anglo-Indian School', dist: '2.0 km' }
    ],
    transit: [
      { name: 'RS Puram Post Office Bus Stop', dist: '0.3 km' },
      { name: 'Coimbatore Junction Railway Station', dist: '2.3 km' },
      { name: 'Gandhipuram Central Town Depot', dist: '3.5 km' }
    ],
    shopping: [
      { name: 'Brookefields Mall RS Puram', dist: '1.1 km' },
      { name: 'Nilgiri’s RS Puram Depot', dist: '0.4 km' },
      { name: 'D-Mart Coimbatore West', dist: '2.2 km' }
    ],
    medical: [
      { name: 'Lotus Eye Care Hospital', dist: '0.9 km' },
      { name: 'Kuppusamy Naidu Memorial Hospital', dist: '3.1 km' },
      { name: 'PSG Hospitals & Health Care', dist: '5.2 km' }
    ]
  },
  'Anna Nagar': {
    schools: [
      { name: 'Noyes Matriculation Higher Sec', dist: '0.9 km' },
      { name: 'TVS Academy Madurai', dist: '2.8 km' },
      { name: 'O.C.P.M. Girls Hr Sec School', dist: '2.1 km' }
    ],
    transit: [
      { name: 'Mattuthavani Integrated Bus Station', dist: '2.4 km' },
      { name: 'Madurai Central Railway Junction', dist: '3.8 km' },
      { name: 'Anna Nagar Circle Terminal', dist: '0.5 km' }
    ],
    shopping: [
      { name: 'Milanem Mall Anna Nagar', dist: '0.8 km' },
      { name: 'Reliance Smart Bazaar', dist: '0.4 km' },
      { name: 'Srinivasa Grocery Store', dist: '0.6 km' }
    ],
    medical: [
      { name: 'Apollo Speciality Hospitals Madurai', dist: '1.1 km' },
      { name: 'Vadamalayan Integrated Hospital', dist: '2.9 km' },
      { name: 'Meenakshi Mission Hospital', dist: '3.4 km' }
    ]
  }
};

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  pros: string[];
  cons: string[];
  safetyRating: number;
  valueRating: number;
  maintenanceRating: number;
  connectivityRating: number;
  helpfulCount: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
}

const getInitialReviews = (listingId: string, location: string): Review[] => {
  const reviewsSeed: Record<string, string[]> = {
    '0': [
      "Amazing structural quality and cross-ventilation. Quiet, upscale gated community with immediate maintenance support.",
      "The location connectivity is outstanding. Security and parking logistics run with absolute clockwork precision. Clean and spacious.",
      "Vastu-compliant layout that is highly welcoming. Beautiful wood-fittings and superb plumbing lines."
    ],
    '1': [
      "Excellent budget-friendly housing option! Extremely reliable utility support (water, high-speed fiber internet backup).",
      "Very neat security patrols. Maintenance responds within a couple of hours if you notify the building warden.",
      "Perfect spot for working professionals. Beautiful balcony views looking onto the neighborhood greenery."
    ],
    '2': [
      "Very large bedrooms compared to neighboring rentals. Clean modular kitchen utilities work flawlessly.",
      "Quiet and cozy environment perfect for families or study-from-home engineers. Solid security system.",
      "Superb neighborhood options with markets right around the corner. Safe streetlights and active community."
    ]
  };

  const seedNum = (listingId.charCodeAt(0) % 3);
  const templates = reviewsSeed[seedNum.toString()] || reviewsSeed['0'];
  
  const reviewers = [
    { name: "Abhishek Sharma", date: "April 12, 2026", rating: 5, safety: 5, value: 5, maintenance: 4, connectivity: 5 },
    { name: "Priya Krishnan", date: "March 20, 2026", rating: 4, safety: 5, value: 4, maintenance: 4, connectivity: 4 },
    { name: "Rahul Verma", date: "February 18, 2026", rating: 4, safety: 4, value: 5, maintenance: 3, connectivity: 5 }
  ];

  return reviewers.map((rev, index) => {
    return {
      id: `${listingId}-rev-${index}`,
      author: rev.name,
      rating: rev.rating,
      date: rev.date,
      comment: templates[index] || "Extremely spacious and matches listed photos perfectly. Peaceful atmosphere.",
      pros: index === 0 ? ["Ventilation", "Security"] : index === 1 ? ["Active Maintenance", "Quiet Surroundings"] : ["High-speed Internet"],
      cons: index === 2 ? ["Slightly distant parking spot"] : [],
      safetyRating: rev.safety,
      valueRating: rev.value,
      maintenanceRating: rev.maintenance,
      connectivityRating: rev.connectivity,
      helpfulCount: (listingId.charCodeAt(0) % 6) + 2 + (2 - index),
    };
  });
};

interface CommuteData {
  hub: string;
  transit: number;
  driving: number;
  walking: number;
}

const getCommuteData = (location: string, district: string): CommuteData[] => {
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = getHash(location + district);

  if (district?.toLowerCase() === 'chennai' || location === 'Adyar' || location === 'OMR') {
    const isOMR = location === 'OMR';
    return [
      {
        hub: "OMR IT Corridor",
        transit: isOMR ? 5 : 20 + (seed % 15),
        driving: isOMR ? 4 : 15 + (seed % 10),
        walking: isOMR ? 12 : 75 + (seed % 30),
      },
      {
        hub: "Central Railway",
        transit: 35 + (seed % 20),
        driving: 30 + (seed % 15),
        walking: 150 + (seed % 50),
      },
      {
        hub: "Chennai Airport",
        transit: 40 + (seed % 15),
        driving: 25 + (seed % 15),
        walking: 180 + (seed % 60),
      },
      {
        hub: "T. Nagar Shopping",
        transit: 25 + (seed % 15),
        driving: 20 + (seed % 10),
        walking: 90 + (seed % 40),
      }
    ];
  }

  if (district?.toLowerCase() === 'coimbatore' || location === 'RS Puram') {
    const isRS = location === 'RS Puram';
    return [
      {
        hub: "Gandhipuram Bus Hub",
        transit: isRS ? 10 : 15 + (seed % 10),
        driving: isRS ? 8 : 12 + (seed % 8),
        walking: isRS ? 30 : 50 + (seed % 20),
      },
      {
        hub: "Coimbatore Junction",
        transit: isRS ? 12 : 18 + (seed % 10),
        driving: isRS ? 10 : 15 + (seed % 8),
        walking: isRS ? 25 : 60 + (seed % 25),
      },
      {
        hub: "TIDEL Park",
        transit: 25 + (seed % 15),
        driving: 20 + (seed % 10),
        walking: 120 + (seed % 40),
      },
      {
        hub: "Coimbatore Airport",
        transit: 35 + (seed % 15),
        driving: 25 + (seed % 12),
        walking: 190 + (seed % 50),
      }
    ];
  }

  if (district?.toLowerCase() === 'madurai' || location === 'Anna Nagar') {
    const isAnna = location === 'Anna Nagar';
    return [
      {
        hub: "Mattuthavani Bus Hub",
        transit: isAnna ? 12 : 18 + (seed % 8),
        driving: isAnna ? 9 : 14 + (seed % 8),
        walking: isAnna ? 28 : 55 + (seed % 20),
      },
      {
        hub: "Railway Junction",
        transit: 18 + (seed % 10),
        driving: 15 + (seed % 8),
        walking: 65 + (seed % 25),
      },
      {
        hub: "Meenakshi Temple",
        transit: 15 + (seed % 8),
        driving: 12 + (seed % 8),
        walking: 45 + (seed % 20),
      },
      {
        hub: "Madurai Airport",
        transit: 40 + (seed % 15),
        driving: 30 + (seed % 10),
        walking: 210 + (seed % 60),
      }
    ];
  }

  return [
    {
      hub: "Central Transit Station",
      transit: 15 + (seed % 15),
      driving: 12 + (seed % 10),
      walking: 45 + (seed % 25),
    },
    {
      hub: "District Commercial Hub",
      transit: 20 + (seed % 20),
      driving: 15 + (seed % 15),
      walking: 60 + (seed % 30),
    },
    {
      hub: "Core Business Center",
      transit: 25 + (seed % 20),
      driving: 20 + (seed % 15),
      walking: 90 + (seed % 40),
    },
    {
      hub: "Nearest Airport",
      transit: 45 + (seed % 25),
      driving: 35 + (seed % 20),
      walking: 240 + (seed % 80),
    }
  ];
};

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ isOpen, onClose, listing }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'blueprint' | 'location' | 'reviews'>('overview');
  const [selectedPlanRoom, setSelectedPlanRoom] = useState<string>('Living');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Reviews System Local State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewPro, setNewReviewPro] = useState('');
  const [newReviewCon, setNewReviewCon] = useState('');
  const [newReviewPros, setNewReviewPros] = useState<string[]>([]);
  const [newReviewCons, setNewReviewCons] = useState<string[]>([]);
  const [newSafetyRating, setNewSafetyRating] = useState(5);
  const [newValueRating, setNewValueRating] = useState(5);
  const [newMaintenanceRating, setNewMaintenanceRating] = useState(5);
  const [newConnectivityRating, setNewConnectivityRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(`reviews-${listing.id}`);
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        const initial = getInitialReviews(listing.id, listing.location);
        setReviews(initial);
        localStorage.setItem(`reviews-${listing.id}`, JSON.stringify(initial));
      }
      // Reset form on open
      setNewReviewAuthor('');
      setNewReviewRating(5);
      setNewReviewComment('');
      setNewReviewPro('');
      setNewReviewCon('');
      setNewReviewPros([]);
      setNewReviewCons([]);
      setNewSafetyRating(5);
      setNewValueRating(5);
      setNewMaintenanceRating(5);
      setNewConnectivityRating(5);
      setSubmitSuccess(false);
    }
  }, [isOpen, listing.id, listing.location]);

  const handleAddPro = () => {
    if (newReviewPro.trim() && !newReviewPros.includes(newReviewPro.trim())) {
      setNewReviewPros([...newReviewPros, newReviewPro.trim()]);
      setNewReviewPro('');
    }
  };

  const handleAddCon = () => {
    if (newReviewCon.trim() && !newReviewCons.includes(newReviewCon.trim())) {
      setNewReviewCons([...newReviewCons, newReviewCon.trim()]);
      setNewReviewCon('');
    }
  };

  const handleRemovePro = (index: number) => {
    setNewReviewPros(newReviewPros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index: number) => {
    setNewReviewCons(newReviewCons.filter((_, i) => i !== index));
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    
    setTimeout(() => {
      const createdReview: Review = {
        id: `${listing.id}-rev-${Date.now()}`,
        author: newReviewAuthor.trim(),
        rating: newReviewRating,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        comment: newReviewComment.trim(),
        pros: [...newReviewPros],
        cons: [...newReviewCons],
        safetyRating: newSafetyRating,
        valueRating: newValueRating,
        maintenanceRating: newMaintenanceRating,
        connectivityRating: newConnectivityRating,
        helpfulCount: 0,
      };

      const updated = [createdReview, ...reviews];
      setReviews(updated);
      localStorage.setItem(`reviews-${listing.id}`, JSON.stringify(updated));

      setIsSubmittingReview(false);
      setSubmitSuccess(true);
      
      // Clear form
      setNewReviewAuthor('');
      setNewReviewComment('');
      setNewReviewPros([]);
      setNewReviewCons([]);
    }, 850);
  };

  const toggleHelpful = (reviewId: string) => {
    const updated = reviews.map(rev => {
      if (rev.id === reviewId) {
        if (rev.hasLiked) {
          return { ...rev, helpfulCount: rev.helpfulCount - 1, hasLiked: false };
        } else {
          return { 
            ...rev, 
            helpfulCount: rev.helpfulCount + 1, 
            hasLiked: true,
            hasDisliked: rev.hasDisliked ? false : undefined 
          };
        }
      }
      return rev;
    });
    setReviews(updated);
    localStorage.setItem(`reviews-${listing.id}`, JSON.stringify(updated));
  };

  // Generate highly plausible fallback neighborhood data if location isn't pre-configured
  const neighborhoodData = useMemo(() => {
    const matched = NEIGHBORHOOD_LANDMARKS[listing.location];
    if (matched) return matched;

    // Plausible fallback generator
    return {
      schools: [
        { name: `Saint Mary's High School, ${listing.location}`, dist: '0.8 km' },
        { name: `${listing.location} Public Academy`, dist: '1.4 km' },
        { name: `National Secondary School ${listing.district}`, dist: '2.9 km' }
      ],
      transit: [
        { name: `${listing.location} Junction Bus Terminal`, dist: '0.4 km' },
        { name: `${listing.district} Town Railway Station`, dist: '3.2 km' },
        { name: 'State Highway Crossing Hub', dist: '1.1 km' }
      ],
      shopping: [
        { name: 'Local Farmers Market / Shandy Bazaar', dist: '0.5 km' },
        { name: `Grand Commercial Complex, ${listing.location}`, dist: '1.2 km' },
        { name: 'Reliance Fresh Super Market', dist: '0.8 km' }
      ],
      medical: [
        { name: `${listing.location} General Hospital`, dist: '1.0 km' },
        { name: `Government Medical College Clinic`, dist: '2.4 km' },
        { name: `Sri Ramakrishna Care Centre`, dist: '1.8 km' }
      ]
    };
  }, [listing.location, listing.district]);

  const walkScore = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < listing.id.length; i++) {
      hash = listing.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const score = 60 + Math.abs(hash % 36); // 60 to 95 inclusive
    return score;
  }, [listing.id]);

  const commuteChartData = useMemo(() => {
    return getCommuteData(listing.location, listing.district);
  }, [listing.location, listing.district]);

  const { 
    avgRating, starPercentages, avgSafety, avgValue, avgMaintenance, avgConnectivity,
    posSentimentCount, neuSentimentCount, negSentimentCount, posPct, neuPct, negPct
  } = useMemo(() => {
    if (reviews.length === 0) {
      return {
        avgRating: 0,
        starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        avgSafety: 0,
        avgValue: 0,
        avgMaintenance: 0,
        avgConnectivity: 0,
        posSentimentCount: 0,
        neuSentimentCount: 0,
        negSentimentCount: 0,
        posPct: 0,
        neuPct: 0,
        negPct: 0
      };
    }

    let totalStars = 0;
    let totalSafety = 0;
    let totalValue = 0;
    let totalMaintenance = 0;
    let totalConnectivity = 0;
    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    let posSentimentCount = 0;
    let neuSentimentCount = 0;
    let negSentimentCount = 0;

    reviews.forEach(r => {
      totalStars += r.rating;
      totalSafety += r.safetyRating;
      totalValue += r.valueRating;
      totalMaintenance += r.maintenanceRating;
      totalConnectivity += r.connectivityRating;
      
      const rounded = Math.round(r.rating);
      if (rounded >= 1 && rounded <= 5) {
        starCounts[rounded] = (starCounts[rounded] || 0) + 1;
      }

      // Simple regex sentiment parser
      const textToAnalyze = `${r.comment} ${r.pros.join(' ')} ${r.cons.join(' ')}`.toLowerCase();
      const posRegex = /amazing|excellent|perfect|superb|wonderful|beautiful|great|flawless|quiet|peaceful|good|fabulous|love|convenient|friendly|welcoming|clean|outstanding|safe|secure/gi;
      const negRegex = /bad|poor|loud|noisy|awful|terrible|disturbed|distance|far|slow|dirty|problem|issue|broken|hate|annoyed|expensive|not\s+good|disappointed|rough|leak|smell|cramped/gi;

      const posMatches = (textToAnalyze.match(posRegex) || []).length;
      const negMatches = (textToAnalyze.match(negRegex) || []).length;

      if (posMatches > negMatches) {
        posSentimentCount++;
      } else if (negMatches > posMatches) {
        negSentimentCount++;
      } else {
        neuSentimentCount++;
      }
    });

    const total = reviews.length;
    const posPct = Math.round((posSentimentCount / total) * 100);
    const neuPct = Math.round((neuSentimentCount / total) * 100);
    const negPct = Math.max(0, 100 - posPct - neuPct);

    return {
      avgRating: Number((totalStars / total).toFixed(1)),
      starPercentages: {
        5: Math.round(((starCounts[5] || 0) / total) * 100),
        4: Math.round(((starCounts[4] || 0) / total) * 100),
        3: Math.round(((starCounts[3] || 0) / total) * 100),
        2: Math.round(((starCounts[2] || 0) / total) * 100),
        1: Math.round(((starCounts[1] || 0) / total) * 100)
      },
      avgSafety: Number((totalSafety / total).toFixed(1)),
      avgValue: Number((totalValue / total).toFixed(1)),
      avgMaintenance: Number((totalMaintenance / total).toFixed(1)),
      avgConnectivity: Number((totalConnectivity / total).toFixed(1)),
      posSentimentCount,
      neuSentimentCount,
      negSentimentCount,
      posPct,
      neuPct,
      negPct
    };
  }, [reviews]);

  React.useEffect(() => {
    if (!isOpen || activeTab !== 'location') return;
    
    let isMounted = true;
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      setSummaryError(null);
      try {
        const response = await fetch('/api/gemini/neighborhood-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: listing.location,
            district: listing.district,
            landmarks: neighborhoodData,
            walkScore: walkScore,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch neighborhood summary');
        }

        const data = await response.json();
        if (isMounted) {
          setAiSummary(data.summary || '');
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) {
          setSummaryError(err.message || 'Failed to load neighborhood summary');
          setAiSummary(`This neighborhood in ${listing.location}, ${listing.district} represents a highly connected hub. With a Walkability Score of ${walkScore}/100, daily essentials like schools, transit hubs, and retail outlets are within quick walking distance. Ideal for professionals and families seeking a convenient commute.`);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, listing.id, walkScore, neighborhoodData]);

  // Specifications based on pricing and bhk
  const specs = useMemo(() => {
    const sizeMap: Record<number, number> = { 1: 680, 2: 1120, 3: 1650, 4: 2400 };
    const area = sizeMap[listing.bhk] || (listing.bhk * 480 + 150);
    const facingOptions = ['North-East Facing', 'East Facing (Vastu Compliant)', 'West Facing', 'North-West Facing'];
    const facing = facingOptions[listing.id.charCodeAt(0) % facingOptions.length];
    
    let furnishing = 'Semi-Furnished';
    if (listing.title.toLowerCase().includes('fully') || listing.title.toLowerCase().includes('luxury') || listing.title.toLowerCase().includes('furnished')) {
      furnishing = 'Fully Furnished';
    } else if (listing.title.toLowerCase().includes('raw') || listing.price < 9000) {
      furnishing = 'Unfurnished';
    }

    const age = (listing.id.charCodeAt(1) % 6) + 1; // 1-6 years
    const maintenance = Math.round(listing.price * 0.08); // 8% maintenance

    return {
      areaSqFt: area,
      facing,
      furnishing,
      ageOfConstruction: `${age} Years`,
      maintenanceCharges: `₹${maintenance.toLocaleString()}/mo`,
      bookingAmount: `₹${(listing.price * 2).toLocaleString()}`,
      waterSupply: '24/7 Corporation & Borewell Water',
      gatedSecurity: 'Fully Multi-Tier Security Guarded'
    };
  }, [listing]);

  // Floor plan specs
  const roomLayouts = useMemo(() => {
    if (listing.bhk === 1) {
      return [
        { id: 'Living', name: 'Living Hall & Foyer', size: "12'0\" x 14'4\"", desc: 'Spacious living area and entrance foyer with vitrified tile flooring, premium electrical fixtures, and sliding balcony doors.' },
        { id: 'Bedroom', name: 'Master Suite', size: "11'0\" x 12'6\"", desc: 'Cozy master bedroom with attached wardrobe niche, multi-point power sockets, large sliding window and ceiling design.' },
        { id: 'Kitchen', name: 'Compact Kitchenette', size: "8'0\" x 10'0\"", desc: 'Modular kitchen setup with premium granite countertops, stainless steel sink, tiled backsplash, and exhaust chimney point.' },
        { id: 'Bath', name: 'Premium Bathroom', size: "6'0\" x 8'2\"", desc: 'Modern bathroom with elegant ceramic non-skid floors, geyser facilities, and premium sanitary fittings.' },
        { id: 'Balcony', name: 'Scenic Vent Balcony', size: "5'0\" x 8'0\"", desc: 'Comfortable outdoor space accessible from the living room, ideal for morning tea and flower pots.' }
      ];
    } else if (listing.bhk === 2) {
      return [
        { id: 'Living', name: 'Elegant Living Hall', size: "14'0\" x 16'6\"", desc: 'Grand family dining & living hall styled with accent light highlights, sliding glass doors to general balcony, and tv panel provisions.' },
        { id: 'Bedroom-1', name: 'Master Room (Attached Bath)', size: "12'0\" x 14'0\"", desc: 'Premium master bedroom with dedicated attached washroom, dedicated closet space, and sound-insulated double-pane windows.' },
        { id: 'Bedroom-2', name: 'Guest/Kids Room', size: "10'0\" x 12'2\"", desc: 'Spacious study or secondary bedroom with convenient reach-in closet layout and multi-view window panels.' },
        { id: 'Kitchen', name: 'Grand Modular Kitchen', size: "8'0\" x 12'0\"", desc: 'Fully functional kitchen suite with extensive quartz slabs, gas piping layout, water purifier point, and laundry wash utility area hookups.' },
        { id: 'Bath-1', name: 'Master Bathroom', size: "6'0\" x 8'0\"", desc: 'Elegantly tiled master-suite bathroom with shower partitions and high-end modern ceramics.' },
        { id: 'Bath-2', name: 'Common Washroom', size: "5'0\" x 7'0\"", desc: 'Centrally accessible common bathroom finished inside soft modern tiles.' },
        { id: 'Balcony', name: 'Main Deck Balcony', size: "5'0\" x 12'0\"", desc: 'Spacious double-width balcony deck for outdoor leisure, featuring rust-resistant steel railings.' }
      ];
    } else {
      // 3 or 4 BHK fallback
      return [
        { id: 'Living', name: 'Grand Living Hall', size: "16'0\" x 20'4\"", desc: 'Ultra-spacious lifestyle salon and dining ballroom with architectural lighting layout, premium marble-finish vitrification, and deck interface.' },
        { id: 'Bedroom-1', name: 'King Master Suite', size: "14'0\" x 16'0\"", desc: 'Lavish master retreat featuring full wardrobe suite walls, direct balcony deck access, and custom luxury en-suite bathroom.' },
        { id: 'Bedroom-2', name: 'Queen Bedroom (No. 2)', size: "12'0\" x 14'0\"", desc: 'Deluxe second bedroom with private attached restroom, wooden-textured tile floors, and massive sunrise ventilation.' },
        { id: 'Bedroom-3', name: 'Guest / Kids Corner', size: "11'0\" x 12'6\"", desc: 'Cozy guest bedroom or study room structured elegantly with optimal natural daylight distribution.' },
        { id: 'Kitchen', name: 'Premium Chef Kitchen', size: "10'0\" x 12'0\"", desc: 'Double-entry modular kitchen with extensive island workspace, custom cabinetry, dishwasher points, and storage pantry.' },
        { id: 'Bath-Master', name: 'Master Suite Bathroom', size: "6'6\" x 9'0\"", desc: 'High-end designer bath with separate glass shower cubicle, chrome vanity, and marble countertops.' },
        { id: 'Bath-2', name: 'Second Bathroom', size: "6'0\" x 8'0\"", desc: 'Elegant en-suite bathroom serving the second bedroom with luxury fixtures.' },
        { id: 'Bath-Common', name: 'Common Restroom', size: "5'0\" x 7'6\"", desc: 'Clean modern washroom near the lounge foyer area.' },
        { id: 'Balcony', name: 'Double Balconies', size: "6'0\" x 15'0\"", desc: 'Wrap-around scenic balconies granting spectacular green views of the neighborhood gardens.' }
      ];
    }
  }, [listing.bhk]);

  const activeRoomData = roomLayouts.find(r => r.id === selectedPlanRoom) || roomLayouts[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 15 }}
          className="relative w-full max-w-5xl bg-slate-50 rounded-[32px] shadow-2xl border border-slate-200/50 flex flex-col my-4 max-h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner - Sleek card styling */}
          <div className="relative h-48 sm:h-56 select-none bg-slate-900 group">
            <img 
              src={listing.imageUrl} 
              alt={listing.title} 
              className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />
            
            {/* Inner controls */}
            <div className="absolute top-5 right-5 z-20">
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="rounded-full bg-slate-950/40 border-white/20 text-white hover:bg-white hover:text-slate-950 transition-colors w-10 h-10 backdrop-blur-md ring-1 ring-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Title / Property specs */}
            <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600 border-none px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase">
                    {listing.houseType}
                  </Badge>
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {listing.bhk} BHK Home
                  </Badge>
                  <div className="text-white/60 text-xs font-medium flex items-center gap-1 ml-1 bg-white/10 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <Compass className="w-3.5 h-3.5" /> {specs.facing}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm leading-tight">
                  {listing.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  {listing.location}, {listing.district}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 bg-white/10 border border-white/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl backdrop-blur-md">
                <span className="text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-0.5">Monthly Rental</span>
                <span className="text-2xl sm:text-3xl font-black text-white flex items-center sm:justify-end gap-0.5">
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                  {listing.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Selection Row */}
          <div className="border-b border-slate-200/60 bg-white px-5 sm:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto shrink-0 sticky top-0 md:relative z-10">
            <div className="flex gap-1.5">
              {[
                { id: 'overview', label: 'Details & Overview', icon: Info },
                { id: 'blueprint', label: 'Interactive Floor Plan', icon: Ruler },
                { id: 'location', label: 'Neighborhood Proximity', icon: Map },
                { id: 'reviews', label: 'Ratings & Reviews', icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 select-none ${isSelected ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'}`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.id === 'reviews' && reviews.length > 0 && (
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {reviews.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Tab Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50/50 flex flex-col justify-between">
            
            {/* Overview / Details Tab */}
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
              >
                {/* Left Columns - Description and visual cards */}
                <div className="md:col-span-2 space-y-6">
                  {/* Property Description */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">About this Listing</h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {listing.description || "No extensive description available for this property. This space is perfect for accommodating family living quarters with easy connectivity options to neighboring amenities, public commute junctions, commercial hubs, and educational systems."}
                    </p>
                  </div>

                  {/* General Features Bento Checklist */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Core Indoor Facilities</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {listing.amenities.map(item => (
                        <div key={item} className="flex items-center gap-2.5 p-2 px-3 rounded-xl hover:bg-emerald-50/20 hover:border-emerald-100 border border-slate-100 transition-colors">
                          <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                          <span className="text-slate-600 font-medium text-xs sm:text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smart specifications grid banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 flex flex-col justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Super Built Area</span>
                      <div className="mt-2.5">
                        <span className="text-lg sm:text-xl font-extrabold text-blue-900 block">{specs.areaSqFt}</span>
                        <span className="text-xs text-blue-600/70 font-semibold">Square Feet</span>
                      </div>
                    </div>
                    <div className="bg-amber-50/40 border border-amber-100/50 rounded-2xl p-4 flex flex-col justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Furnishing State</span>
                      <div className="mt-2.5">
                        <span className="text-lg sm:text-xl font-extrabold text-amber-900 block">{specs.furnishing}</span>
                        <span className="text-xs text-amber-600/70 font-semibold">Move-In Ready</span>
                      </div>
                    </div>
                    <div className="bg-violet-50/40 border border-violet-100/50 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Property Age</span>
                      <div className="mt-2.5">
                        <span className="text-lg sm:text-xl font-extrabold text-violet-900 block">{specs.ageOfConstruction}</span>
                        <span className="text-xs text-violet-600/70 font-semibold">Well Maintained</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Columns - Key transactional specifications & Host Details */}
                <div className="space-y-6">
                  {/* Detailed Specs Block */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Financials & Security</h4>
                    <div className="space-y-3.5 divide-y divide-slate-100">
                      <div className="flex justify-between text-xs sm:text-sm py-1 pt-0">
                        <span className="text-slate-400 font-medium">Monthly Maintenance</span>
                        <span className="font-extrabold text-slate-800">{specs.maintenanceCharges}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm py-2.5">
                        <span className="text-slate-400 font-medium">Security Deposit</span>
                        <span className="font-extrabold text-slate-800">{specs.bookingAmount}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm py-2.5">
                        <span className="text-slate-400 font-medium">Water Connection</span>
                        <span className="font-bold text-slate-600 text-right max-w-[150px] leading-tight">{specs.waterSupply}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm py-2.5">
                        <span className="text-slate-400 font-medium">Gated Security</span>
                        <span className="font-bold text-slate-600 text-right max-w-[150px] leading-tight">{specs.gatedSecurity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Host / Owner Block */}
                  <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 border border-slate-800 relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 transform translate-x-4 -translate-y-4 text-white">
                      <Building className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="h-11 w-11 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-sm">
                          {listing.location.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[15px] text-white">Property Executive</h4>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Authorized Owner</p>
                        </div>
                      </div>

                      <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                        To reserve a slot for in-person property walkthroughs, tours, or general rental pricing negotiations, establish direct connection below.
                      </p>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/5 font-mono text-slate-300">
                          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>+91 98765 43210</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/5 font-mono text-slate-300">
                          <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                          <span className="truncate">owner@example.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Interactive Blueprint / Floor Plan Tab */}
            {activeTab === 'blueprint' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Left 8 cols - Blueprint Canvas Grid */}
                <div className="lg:col-span-7 bg-white p-5 sm:p-8 rounded-[24px] border border-slate-200/50 shadow-sm flex flex-col justify-between min-h-[400px]">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dynamic Layout Blueprint</h4>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase font-mono mt-0.5 block">Estimated Area: {specs.areaSqFt} sq ft</span>
                      </div>
                      <Badge className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] px-2 py-0.5 rounded-md uppercase font-mono font-bold">
                        Architectural View
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal max-w-lg mb-6">
                      Click the highlighted rooms on the interactive blueprint mapping to view structural measurements, description profiles, and layout designs immediately.
                    </p>
                  </div>

                  {/* CSS-Drawn Interactive Blueprint Grid */}
                  <div className="flex-1 flex items-center justify-center p-3 relative bg-slate-50/50 border border-slate-200/40 rounded-2xl min-h-[280px]">
                    
                    {/* Dotted Blueprint Grid Lines Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none rounded-2xl opacity-80" />

                    {/* Room mapping layout block rendered dynamically */}
                    <div className="w-full max-w-[420px] aspect-[4/3] relative border-4 border-slate-800/80 rounded-xl bg-white p-2 text-slate-800 font-mono text-[10px]">
                      
                      {listing.bhk === 1 && (
                        <div className="absolute inset-2 grid grid-cols-12 grid-rows-12 gap-1.5 h-auto">
                          {/* Living room with Balcony */}
                          <button
                            onClick={() => setSelectedPlanRoom('Living')}
                            className={`col-span-7 row-span-7 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Living' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[11px] uppercase tracking-tight block">Living Room</span>
                            <span className="text-[10px] text-slate-500 font-semibold font-mono">12'0" x 14'4"</span>
                          </button>

                          {/* Balcony */}
                          <button
                            onClick={() => setSelectedPlanRoom('Balcony')}
                            className={`col-span-5 row-span-4 border-2 border-dashed border-slate-600 rounded-md p-1 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Balcony' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-bold text-[9px] uppercase block">Balcony</span>
                            <span className="text-[9px] text-slate-500 font-mono">5'0" x 8'0"</span>
                          </button>

                          {/* Kitchen */}
                          <button
                            onClick={() => setSelectedPlanRoom('Kitchen')}
                            className={`col-span-5 row-span-5 col-start-8 row-start-5 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Kitchen' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[10px] uppercase block">Kitchen</span>
                            <span className="text-[9px] text-slate-500 font-mono">8'0" x 10'0"</span>
                          </button>

                          {/* Master Bedroom */}
                          <button
                            onClick={() => setSelectedPlanRoom('Bedroom')}
                            className={`col-span-7 row-span-5 col-start-1 row-start-8 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Bedroom' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[11px] uppercase tracking-tight block">Master Bedroom</span>
                            <span className="text-[9px] text-slate-500 font-mono">11'0" x 12'6"</span>
                          </button>

                          {/* Bathroom */}
                          <button
                            onClick={() => setSelectedPlanRoom('Bath')}
                            className={`col-span-5 row-span-3 col-start-8 row-start-10 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Bath' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-bold text-[9px] uppercase block">Bathroom</span>
                            <span className="text-[9px] text-slate-500 font-mono">6'0" x 8'2"</span>
                          </button>
                        </div>
                      )}

                      {listing.bhk === 2 && (
                        <div className="absolute inset-2 grid grid-cols-12 grid-rows-12 gap-1.5 h-auto">
                          {/* Living Hall */}
                          <button
                            onClick={() => setSelectedPlanRoom('Living')}
                            className={`col-span-7 row-span-6 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Living' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />
                              <span className="font-extrabold text-[11px] uppercase tracking-tight block">Living & Dining</span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-semibold font-mono">14'0" x 16'6"</span>
                          </button>

                          {/* Balcony deck */}
                          <button
                            onClick={() => setSelectedPlanRoom('Balcony')}
                            className={`col-span-5 row-span-4 border-2 border-dashed border-slate-600 rounded-md p-1 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Balcony' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-bold text-[9px] uppercase block">Deck Balcony</span>
                            <span className="text-[8px] text-slate-500 font-mono">5'0" x 12'0"</span>
                          </button>

                          {/* Kitchen */}
                          <button
                            onClick={() => setSelectedPlanRoom('Kitchen')}
                            className={`col-span-5 row-span-5 col-start-8 row-start-5 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Kitchen' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[10px] uppercase block">Kitchen</span>
                            <span className="text-[8px] text-slate-500 font-mono">8'0" x 12'0"</span>
                          </button>

                          {/* Master Bed */}
                          <button
                            onClick={() => setSelectedPlanRoom('Bedroom-1')}
                            className={`col-span-7 row-span-6 col-start-1 row-start-7 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Bedroom-1' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[11px] uppercase tracking-tight block">Master Bed (Bath)</span>
                            <span className="text-[9px] text-slate-500 font-mono">12'0" x 14'0"</span>
                          </button>

                          {/* Guest/Kids Bed */}
                          <button
                            onClick={() => setSelectedPlanRoom('Bedroom-2')}
                            className={`col-span-5 row-span-3 col-start-8 row-start-10 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Bedroom-2' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[9px] uppercase block">Guest Bedroom</span>
                            <span className="text-[8px] text-slate-500 font-mono">10'0" x 12'2"</span>
                          </button>

                          {/* Master Washroom */}
                          <div className="absolute top-[52%] left-[48%] bg-slate-100 border border-slate-700 rounded-sm scale-90 p-1 flex flex-col justify-center text-[8px] w-14 hover:shadow-xs pointer-events-auto cursor-pointer" onClick={() => setSelectedPlanRoom('Bath-1')}>
                            <span className="font-bold">Attached</span>
                            <span>6'x8'</span>
                          </div>

                          {/* Common Washroom */}
                          <div className="absolute bottom-[2%] left-[48%] bg-slate-100 border border-slate-700 rounded-sm scale-90 p-1 flex flex-col justify-center text-[8px] w-14 hover:shadow-xs pointer-events-auto cursor-pointer" onClick={() => setSelectedPlanRoom('Bath-2')}>
                            <span className="font-bold">Common</span>
                            <span>5'x7'</span>
                          </div>
                        </div>
                      )}

                      {listing.bhk >= 3 && (
                        <div className="absolute inset-2 grid grid-cols-12 grid-rows-12 gap-1 h-auto">
                          {/* Grand Salon / Dinning */}
                          <button
                            onClick={() => setSelectedPlanRoom('Living')}
                            className={`col-span-7 row-span-6 border-2 border-slate-800 rounded-md p-1 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Living' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[10px] uppercase tracking-tight block">Living / Dinning Hall</span>
                            <span className="text-[8px] text-slate-500 font-mono">16'0" x 20'4"</span>
                          </button>

                          {/* Chef Kitchen */}
                          <button
                            onClick={() => setSelectedPlanRoom('Kitchen')}
                            className={`col-span-5 row-span-4 col-start-8 row-start-1 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Kitchen' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[9px] uppercase block">Kitchen</span>
                            <span className="text-[7.5px] text-slate-500 font-mono">10'0" x 12'0"</span>
                          </button>

                          {/* King Master Bedroom */}
                          <button
                            onClick={() => setSelectedPlanRoom('Bedroom-1')}
                            className={`col-span-6 row-span-6 col-start-1 row-start-7 border-2 border-slate-800 rounded-md p-1.5 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Bedroom-1' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[10px] uppercase tracking-tight block">Master Suite 1</span>
                            <span className="text-[8px] text-slate-500 font-mono">14'0" x 16'0"</span>
                          </button>

                          {/* Queen Bedroom */}
                          <button
                            onClick={() => setSelectedPlanRoom('Bedroom-2')}
                            className={`col-span-6 row-span-4 col-start-7 row-start-5 border-2 border-slate-800 rounded-md p-1 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Bedroom-2' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[9px] uppercase block">Bedroom 2</span>
                            <span className="text-[8px] text-slate-500 font-mono">12'0" x 14'0"</span>
                          </button>

                          {/* Kids Bedroom */}
                          <button
                            onClick={() => setSelectedPlanRoom('Bedroom-3')}
                            className={`col-span-6 row-span-4 col-start-7 row-start-9 border-2 border-slate-800 rounded-md p-1 flex flex-col justify-between text-left transition-all ${selectedPlanRoom === 'Bedroom-3' ? 'bg-blue-50/70 border-blue-600 text-blue-900 shadow-md shadow-blue-100 z-10' : 'bg-white hover:bg-slate-50/80'}`}
                          >
                            <span className="font-extrabold text-[8.5px] uppercase block">Kids/Guest Bed</span>
                            <span className="text-[7.5px] text-slate-500 font-mono">11'0" x 12'6"</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right 4 cols - Room Details Viewer Box */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="bg-white p-6 rounded-[24px] border border-slate-200/50 shadow-sm flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-10 w-10 text-blue-600 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <CornerRightDown className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Room Blueprint Details</span>
                      <h4 className="text-xl font-black text-slate-800 mt-1.5 leading-tight">{activeRoomData.name}</h4>
                      
                      <div className="mt-4 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/40 w-fit">
                        <Ruler className="text-slate-500 w-4 h-4 shrink-0" />
                        <span className="font-mono text-xs text-slate-600 font-bold">L x W: {activeRoomData.size}</span>
                      </div>

                      <p className="text-sm text-slate-500 mt-5 leading-relaxed">
                        {activeRoomData.desc}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100/80 mt-6 md:mt-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Materials</span>
                          <span className="text-xs text-slate-600 font-bold mt-1 block">Vitrified double-charge tiles</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block">Power Outlets</span>
                          <span className="text-xs text-slate-600 font-bold mt-1 block">Legrand / Anchor sockets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Neighborhood Highlights Tab */}
            {activeTab === 'location' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Visual Location Proximity Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Commute */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3.5">
                      <Train className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Commute & Transit</h5>
                    <div className="mt-4 space-y-2.5">
                      {neighborhoodData.transit.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium truncate max-w-[130px]">{t.name}</span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{t.dist}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* School */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3.5">
                      <School className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Schools & Colleges</h5>
                    <div className="mt-4 space-y-2.5">
                      {neighborhoodData.schools.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium truncate max-w-[130px]">{s.name}</span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{s.dist}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shopping */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-3.5">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Retail & Shopping</h5>
                    <div className="mt-4 space-y-2.5">
                      {neighborhoodData.shopping.map((sh, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium truncate max-w-[130px]">{sh.name}</span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{sh.dist}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hospital */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/50 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-3.5">
                      <Hospital className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">Hospitals & Clinics</h5>
                    <div className="mt-4 space-y-2.5">
                      {neighborhoodData.medical.map((h, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium truncate max-w-[130px]">{h.name}</span>
                          <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{h.dist}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Walkability Score & AI Neighborhood Summary Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Walkability Score Widget Card */}
                  <div className="md:col-span-4 bg-slate-900 rounded-[24px] p-6 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-slate-800/80 rounded-lg text-emerald-400 border border-slate-700/50">
                          <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                        <h5 className="font-extrabold text-sm tracking-wide text-slate-300 uppercase">Walkability Score</h5>
                      </div>
                      
                      <div className="flex items-end gap-3 mt-4 mb-2">
                        <span className="text-5xl font-black tracking-tight text-emerald-400">{walkScore}</span>
                        <span className="text-slate-400 text-sm font-bold pb-1.5">/ 100</span>
                      </div>
                      
                      <Badge className={`border-none text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md mt-1 ${walkScore >= 90 ? 'bg-emerald-500/20 text-emerald-300' : walkScore >= 70 ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {walkScore >= 90 ? "Walker's Paradise" : walkScore >= 70 ? "Very Walkable" : "Somewhat Walkable"}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 leading-normal mt-5">
                      {walkScore >= 90 
                        ? "Daily errands do not require a car. World-class accessibility to transit, retail, and schools."
                        : walkScore >= 70
                          ? "Most errands can be accomplished easily on foot. Excellent neighborhood integration."
                          : "Some errands can be accomplished on foot. Public transit and biking are available nearby."
                      }
                    </p>
                  </div>

                  {/* AI-Generated Neighborhood Summary Card */}
                  <div className="md:col-span-8 bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-6 opacity-5 pointer-events-none">
                      <Sparkles className="w-16 h-16 text-blue-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3.5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                          </div>
                          <h5 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">AI Neighborhood Digest</h5>
                        </div>
                        <Badge className="bg-slate-100 text-slate-500 border border-slate-200/50 text-[9px] px-2 py-0.5 rounded-full font-bold">
                          Gemini 3.5 Flash
                        </Badge>
                      </div>

                      {isLoadingSummary ? (
                        <div className="space-y-3 py-3">
                          <div className="h-4 bg-slate-100 rounded-sm animate-pulse w-full" />
                          <div className="h-4 bg-slate-100 rounded-sm animate-pulse w-5/6" />
                          <div className="h-4 bg-slate-100 rounded-sm animate-pulse w-2/3" />
                        </div>
                      ) : summaryError ? (
                        <div className="text-rose-500 text-xs flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl">
                          <span>⚠️ {summaryError}</span>
                        </div>
                      ) : (
                        <p className="text-slate-600 text-[13.5px] leading-relaxed font-semibold">
                          {aiSummary}
                        </p>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <span>Based on current local proximity mapping</span>
                      <span className="flex items-center gap-1.5 text-blue-500">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Analysis
                      </span>
                    </div>

                  </div>

                </div>

                {/* Commute Time Bar Chart Card */}
                <div className="bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600 border border-orange-100/50 flex items-center justify-center">
                          <Train className="w-4 h-4 text-orange-500 shrink-0" />
                        </div>
                        <h5 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Commute Time Analysis</h5>
                      </div>
                      <p className="text-slate-500 text-xs font-semibold leading-normal">
                        Estimated travel times (in minutes) to major city hubs based on transport modes
                      </p>
                    </div>
                    {/* Mode Legend */}
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 self-start sm:self-auto bg-slate-50 border border-slate-200/40 px-3.5 py-2 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span>Public Transit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>Driving</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Walking</span>
                      </div>
                    </div>
                  </div>

                  {/* Recharts Bar Chart Container */}
                  <div className="w-full h-[300px] font-sans text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={commuteChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        barGap={4}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="hub" 
                          stroke="#64748b" 
                          fontSize={11}
                          fontFamily="var(--font-sans)"
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={11}
                          fontFamily="var(--font-sans)"
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false}
                          unit="m"
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc', radius: 8 }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xl min-w-[180px] z-50 font-sans">
                                  <p className="font-extrabold text-slate-800 text-[11px] mb-2 border-b border-slate-100 pb-1.5 uppercase tracking-wide">{label}</p>
                                  <div className="space-y-1.5 text-xs">
                                    {payload.map((p: any) => (
                                      <div key={p.name} className="flex justify-between items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                                          {p.name}
                                        </span>
                                        <span className="font-extrabold text-slate-800 text-[11px]">{p.value} mins</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          name="Public Transit" 
                          dataKey="transit" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={32}
                        />
                        <Bar 
                          name="Driving" 
                          dataKey="driving" 
                          fill="#f43f5e" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={32}
                        />
                        <Bar 
                          name="Walking" 
                          dataKey="walking" 
                          fill="#f59e0b" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Ratings & Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Sentiment Summary Widget */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-[28px] p-6 shadow-sm overflow-hidden relative">
                  <div className="absolute right-4 top-4 p-4 opacity-[0.03] pointer-events-none">
                    <Sparkles className="w-16 h-16 text-indigo-600" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Header info */}
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <Smile className="w-4 h-4 text-blue-500" />
                        </span>
                        <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase">Tenant Sentiment Quotient</h4>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-800 leading-tight">Sentiment Summary</h3>
                      <p className="text-xs text-slate-500 font-medium leading-normal">
                        Real-time intelligence parser categorizing reviews to estimate community satisfaction, gated security correctness, and landlord responsiveness.
                      </p>
                    </div>

                    {/* Numeric breakdown counters */}
                    <div className="flex flex-wrap gap-4 items-center sm:gap-6">
                      {/* Positive item */}
                      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100/80 shadow-xs">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                          <Smile className="w-5 h-5 fill-emerald-500/10" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider block leading-none mb-1">Positive</span>
                          <span className="text-base font-black text-slate-800 leading-none">{posSentimentCount} <span className="text-xs text-slate-400 font-bold">({posPct}%)</span></span>
                        </div>
                      </div>

                      {/* Neutral item */}
                      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100/80 shadow-xs">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                          <Meh className="w-5 h-5 fill-amber-500/10" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider block leading-none mb-1">Neutral</span>
                          <span className="text-base font-black text-slate-800 leading-none">{neuSentimentCount} <span className="text-xs text-slate-400 font-bold">({neuPct}%)</span></span>
                        </div>
                      </div>

                      {/* Negative item */}
                      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100/80 shadow-xs">
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                          <Frown className="w-5 h-5 fill-rose-500/10" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider block leading-none mb-1">Negative</span>
                          <span className="text-base font-black text-slate-800 leading-none">{negSentimentCount} <span className="text-xs text-slate-400 font-bold">({negPct}%)</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multicolored dynamic tracking progress bar strip */}
                  <div className="mt-6">
                    <div className="flex h-3.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/10">
                      {posPct > 0 && (
                        <div 
                          className="h-full bg-linear-to-r from-emerald-400 to-emerald-500 flex items-center justify-center text-[9px] text-white font-extrabold transition-all duration-500" 
                          style={{ width: `${posPct}%` }}
                          title={`Positive: ${posPct}%`}
                        >
                          {posPct >= 5 && `${posPct}%`}
                        </div>
                      )}
                      {neuPct > 0 && (
                        <div 
                          className="h-full bg-linear-to-r from-amber-400 to-amber-500 flex items-center justify-center text-[9px] text-white font-extrabold transition-all duration-500" 
                          style={{ width: `${neuPct}%` }}
                          title={`Neutral: ${neuPct}%`}
                        >
                          {neuPct >= 5 && `${neuPct}%`}
                        </div>
                      )}
                      {negPct > 0 && (
                        <div 
                          className="h-full bg-linear-to-r from-rose-400 to-rose-500 flex items-center justify-center text-[9px] text-white font-extrabold transition-all duration-500" 
                          style={{ width: `${negPct}%` }}
                          title={`Negative: ${negPct}%`}
                        >
                          {negPct >= 5 && `${negPct}%`}
                        </div>
                      )}
                    </div>
                    {/* Tiny info text */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 font-semibold mt-2.5 gap-2 select-none">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Emerald: Positive Feedback</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Amber: Balanced/Informational</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Rose: Limitations</span>
                      </div>
                      <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold bg-slate-200/50 px-2 py-0.5 rounded-sm shrink-0 self-start sm:self-center">
                        Regex Classifier v1.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aggregate Summary Header Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Score circle & General metrics */}
                  <div className="lg:col-span-4 bg-slate-900 rounded-[28px] p-6 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div>
                      <h5 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <Star className="text-amber-400 w-3.5 h-3.5 fill-amber-400" /> Renters Pulse
                      </h5>
                      
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-black text-white tracking-tight">{avgRating}</span>
                        <span className="text-slate-400 text-sm font-bold">/ 5.0</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < Math.floor(avgRating) 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : i === Math.floor(avgRating) && avgRating % 1 >= 0.4
                                    ? 'fill-amber-400 text-amber-400 opacity-50'
                                    : 'text-slate-700'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-300">
                          ({reviews.length} {reviews.length === 1 ? 'rating' : 'verified ratings'})
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mt-4">
                        Based on genuine tenant reports regarding water quality, Vastu design, gated protection systems, and surrounding convenience hubs.
                      </p>
                    </div>

                    {/* Quick gauges */}
                    <div className="border-t border-slate-800 pt-4 mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Safety Guard</span>
                        <span className="text-emerald-400 font-extrabold text-sm flex items-center gap-1 mt-0.5">
                          <Shield className="w-3.5 h-3.5" /> {avgSafety} <span className="text-[10px] text-slate-500">/5</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Worth Factor</span>
                        <span className="text-blue-400 font-extrabold text-sm flex items-center gap-1 mt-0.5">
                          <IndianRupee className="w-3.5 h-3.5" /> {avgValue} <span className="text-[10px] text-slate-500">/5</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating progress bars block */}
                  <div className="lg:col-span-4 bg-white border border-slate-200/50 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest mb-4">
                        Rating Distribution
                      </h5>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const percentage = starPercentages[stars] || 0;
                          return (
                            <div key={stars} className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-600 w-3 shrink-0">{stars}</span>
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-400 w-8 text-right select-none">{percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold pt-4 mt-4 border-t border-slate-100">
                      Ratings are certified by checked RentMate profiles.
                    </div>
                  </div>

                  {/* Neighborhood Dimensions (Circular-like linear meters) */}
                  <div className="lg:col-span-4 bg-white border border-slate-200/50 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-widest mb-4">
                        Quality Dimensions
                      </h5>
                      <div className="space-y-4">
                        {/* Maintenance */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                            <span>Maintenance Responsiveness</span>
                            <span className="text-blue-600">{avgMaintenance} / 5.0</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(avgMaintenance / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Connectivity */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                            <span>Transit & Market Proximity</span>
                            <span className="text-pink-600">{avgConnectivity} / 5.0</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(avgConnectivity / 5) * 100}%` }} />
                          </div>
                        </div>

                        {/* Safety */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                            <span>Property Security Guarding</span>
                            <span className="text-emerald-600">{avgSafety} / 5.0</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(avgSafety / 5) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] flex items-center justify-between text-slate-400 font-semibold pt-4 mt-4 border-t border-slate-100">
                      <span>Live feed scoring summary</span>
                      <span className="text-emerald-500 flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Updated
                      </span>
                    </div>
                  </div>

                </div>

                {/* Main section: Write review + Listings Feed layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                  
                  {/* Reviews Feed - Left or Right Grid */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Tenant Reviews ({reviews.length})
                      </h4>
                      <Badge className="bg-slate-100 border-slate-200/50 text-slate-500 font-bold">
                        Sorted by Latest
                      </Badge>
                    </div>

                    {reviews.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 border border-slate-200/50 shadow-sm text-center">
                        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-semibold text-sm">No reviews added yet for this rental.</p>
                        <p className="text-xs text-slate-400 mt-1">Be the first to share your rental feedback experience!</p>
                      </div>
                    ) : (
                      reviews.map((rev) => {
                        const firstChar = rev.author ? rev.author.charAt(0).toUpperCase() : 'U';
                        return (
                          <div key={rev.id} className="bg-white rounded-[24px] p-5 border border-slate-200/50 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md">
                            <div className="flex items-start justify-between gap-4">
                              
                              {/* Header profile details */}
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-sm">
                                  {firstChar}
                                </div>
                                <div>
                                  <h5 className="font-extrabold text-slate-800 text-sm leading-tight">{rev.author}</h5>
                                  <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">{rev.date}</span>
                                </div>
                              </div>

                              {/* Star counts */}
                              <div className="flex items-center gap-1 shrink-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${
                                      i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                    }`} 
                                  />
                                ))}
                              </div>

                            </div>

                            {/* Comment text */}
                            <p className="text-slate-600 text-[13px] leading-relaxed font-medium whitespace-pre-line">
                              {rev.comment}
                            </p>

                            {/* Pros and Cons badges */}
                            {(rev.pros.length > 0 || rev.cons.length > 0) && (
                              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50 mt-1">
                                {rev.pros.map((p, pIdx) => (
                                  <Badge key={pIdx} className="bg-emerald-500/10 hover:bg-emerald-500/15 border-none text-[10px] px-2 py-0.5 rounded-md font-bold text-emerald-600 flex items-center gap-1">
                                    <span className="text-emerald-500">✓</span> {p}
                                  </Badge>
                                ))}
                                {rev.cons.map((c, cIdx) => (
                                  <Badge key={cIdx} className="bg-rose-50 hover:bg-rose-100/50 border-none text-[10px] px-2 py-0.5 rounded-md font-bold text-rose-500 flex items-center gap-1">
                                    <span className="text-rose-400">✗</span> {c}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Sub scores details inside card */}
                            <div className="grid grid-cols-4 gap-2 bg-slate-50/70 py-2.5 px-3 rounded-2xl text-[10px] text-slate-500 font-bold">
                              <div>
                                <span className="block text-slate-400 font-semibold mb-0.5 uppercase text-[8px]">Safety</span>
                                <span className="text-slate-700 flex items-center gap-0.5">⭐ {rev.safetyRating}/5</span>
                              </div>
                              <div>
                                <span className="block text-slate-400 font-semibold mb-0.5 uppercase text-[8px]">Value</span>
                                <span className="text-slate-700 flex items-center gap-0.5">⭐ {rev.valueRating}/5</span>
                              </div>
                              <div>
                                <span className="block text-slate-400 font-semibold mb-0.5 uppercase text-[8px]">Maintenance</span>
                                <span className="text-slate-700 flex items-center gap-0.5">⭐ {rev.maintenanceRating}/5</span>
                              </div>
                              <div>
                                <span className="block text-slate-400 font-semibold mb-0.5 uppercase text-[8px]">Transit</span>
                                <span className="text-slate-700 flex items-center gap-0.5">⭐ {rev.connectivityRating}/5</span>
                              </div>
                            </div>

                            {/* Interaction buttons bar */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                <Shield className="w-3 h-3 text-blue-500" /> Tenant-verified review
                              </span>
                              
                              <button
                                onClick={() => toggleHelpful(rev.id)}
                                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                                  rev.hasLiked 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <ThumbsUp className={`w-3.5 h-3.5 ${rev.hasLiked ? 'fill-blue-500 text-blue-600' : ''}`} />
                                <span>Helpful {rev.helpfulCount > 0 && `(${rev.helpfulCount})`}</span>
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Ratings Form - Right Grid */}
                  <div className="lg:col-span-5">
                    <div className="bg-white border border-slate-200/60 rounded-[28px] p-6 shadow-sm sticky top-4">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <MessageSquare className="text-blue-500 w-4 h-4" /> Share Your Feedback
                      </h4>
                      
                      {submitSuccess ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-50 border border-emerald-150 rounded-[22px] p-5 text-center "
                        >
                          <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black mb-3 text-lg">
                            ✓
                          </div>
                          <h5 className="font-extrabold text-slate-800 text-sm">Review Submitted!</h5>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Thank you! Your verified rental review has been compiled and added to the neighborhood stats directory instantly.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setSubmitSuccess(false)}
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4 px-5 text-[11px] font-bold h-8 border-none"
                          >
                            Add Another Review
                          </Button>
                        </motion.div>
                      ) : (
                        <form onSubmit={submitReview} className="space-y-4">
                          
                          {/* Name Input */}
                          <div>
                            <label className="text-[10px] tracking-wide uppercase font-bold text-slate-400 block mb-1">
                              Your Full Name
                            </label>
                            <input 
                              type="text"
                              required
                              value={newReviewAuthor}
                              onChange={(e) => setNewReviewAuthor(e.target.value)}
                              placeholder="e.g. Anand Kumar"
                              className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                            />
                          </div>

                          {/* Overall Star Multiplier */}
                          <div>
                            <label className="text-[10px] tracking-wide uppercase font-bold text-slate-400 block mb-1.5">
                              Overall Rating
                            </label>
                            <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReviewRating(star)}
                                  className="p-1 hover:scale-110 active:scale-95 transition-transform"
                                >
                                  <Star
                                    className={`w-7 h-7 cursor-pointer transition-colors ${
                                      star <= newReviewRating 
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm' 
                                        : 'text-slate-300 hover:text-amber-300'
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="text-xs font-black text-slate-500 ml-3 uppercase tracking-wider">
                                {newReviewRating === 5 ? 'Perfect' : newReviewRating === 4 ? 'Good' : newReviewRating === 3 ? 'Average' : newReviewRating === 2 ? 'Weak' : 'Poor'}
                              </span>
                            </div>
                          </div>

                          {/* Sub Score Selectors */}
                          <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-[9px] tracking-widest uppercase font-black text-slate-400 block pb-1 border-b border-slate-200">
                              Facility Feature Ratings
                            </span>
                            
                            {/* Safety Slider */}
                            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">Gated Security</span>
                              <div className="flex gap-0.5 items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewSafetyRating(star)}
                                    className="p-0.5"
                                  >
                                    <Star className={`w-4 h-4 ${star <= newSafetyRating ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Value Slider */}
                            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">Value for Money</span>
                              <div className="flex gap-0.5 items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewValueRating(star)}
                                    className="p-0.5"
                                  >
                                    <Star className={`w-4 h-4 ${star <= newValueRating ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Maintenance Slider */}
                            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">Maintenance Fastness</span>
                              <div className="flex gap-0.5 items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewMaintenanceRating(star)}
                                    className="p-0.5"
                                  >
                                    <Star className={`w-4 h-4 ${star <= newMaintenanceRating ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Connectivity Slider */}
                            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">Transit Proximity</span>
                              <div className="flex gap-0.5 items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewConnectivityRating(star)}
                                    className="p-0.5"
                                  >
                                    <Star className={`w-4 h-4 ${star <= newConnectivityRating ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* Dynamic Pros Tag Adders */}
                          <div>
                            <label className="text-[10px] tracking-wide uppercase font-bold text-slate-400 block mb-1">
                              Property Pros (Features you liked)
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={newReviewPro}
                                onChange={(e) => setNewReviewPro(e.target.value)}
                                placeholder="e.g. Spacious Foyer, Great Water"
                                className="flex-1 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                              />
                              <Button
                                type="button"
                                onClick={handleAddPro}
                                className="rounded-xl px-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 border-none text-slate-700 h-[38px] cursor-pointer"
                              >
                                Plus
                              </Button>
                            </div>
                            
                            {/* Mounted Pros indicators */}
                            {newReviewPros.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {newReviewPros.map((tag, idx) => (
                                  <span 
                                    key={idx} 
                                    onClick={() => handleRemovePro(idx)}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold border border-emerald-100/50 text-[10px] px-2 py-0.5 rounded-md cursor-pointer flex items-center gap-1"
                                    title="Click to remove"
                                  >
                                    <span>{tag}</span>
                                    <span className="text-emerald-400 hover:text-emerald-600 select-none ml-0.5">×</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Dynamic Cons Tag Adders */}
                          <div>
                            <label className="text-[10px] tracking-wide uppercase font-bold text-slate-400 block mb-1">
                              Property Cons (Limitations / Issues)
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={newReviewCon}
                                onChange={(e) => setNewReviewCon(e.target.value)}
                                placeholder="e.g. Street Noise, No Elevator"
                                className="flex-1 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                              />
                              <Button
                                type="button"
                                onClick={handleAddCon}
                                className="rounded-xl px-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 border-none text-slate-700 h-[38px] cursor-pointer"
                              >
                                Plus
                              </Button>
                            </div>
                            
                            {/* Mounted Cons indicators */}
                            {newReviewCons.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {newReviewCons.map((tag, idx) => (
                                  <span 
                                    key={idx} 
                                    onClick={() => handleRemoveCon(idx)}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold border border-rose-100/50 text-[10px] px-2 py-0.5 rounded-md cursor-pointer flex items-center gap-1"
                                    title="Click to remove"
                                  >
                                    <span>{tag}</span>
                                    <span className="text-rose-400 hover:text-rose-600 select-none ml-0.5">×</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Detailed text comment textarea */}
                          <div>
                            <label className="text-[10px] tracking-wide uppercase font-bold text-slate-400 block mb-1">
                              Written Feedback
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={newReviewComment}
                              onChange={(e) => setNewReviewComment(e.target.value)}
                              placeholder="Describe your living experience, Vastu feel, ventilation routing, utility comfort, and connectivity access options here..."
                              className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 leading-relaxed resize-none"
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-12 flex items-center justify-center gap-2 border-none shadow-md"
                          >
                            {isSubmittingReview ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                <span>Compiling feedback details...</span>
                              </>
                            ) : (
                              'Publish Verified Review'
                            )}
                          </Button>

                        </form>
                      )}

                    </div>
                  </div>

                </div>

              </motion.div>
            )}

          </div>

          {/* Dialog Action Buttons */}
          <div className="p-4 border-t border-slate-200/60 bg-white flex justify-end gap-3 sticky bottom-0 z-10 shrink-0">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-full px-5 hover:bg-slate-50 border-slate-200 shrink-0 h-10 font-bold text-xs"
            >
              Close Details
            </Button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
