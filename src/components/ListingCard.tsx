import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, IndianRupee, BedDouble, Heart, Map, ChevronLeft, ChevronRight, X, Maximize2, GitCompare, Share2, Check, MessageCircle, TrendingDown, TrendingUp, Equal, ZoomIn, ZoomOut, Ruler } from 'lucide-react';
import { Listing } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PropertyDetailsModal } from './PropertyDetailsModal';

// Reference average monthly prices by neighborhood and BHK for realistic local rate indexing (in INR)
const NEIGHBORHOOD_AVERAGES: Record<string, Record<number, number>> = {
  'Adyar': {
    1: 12000,
    2: 19500,
    3: 32000,
  },
  'OMR': {
    1: 11500,
    2: 17000,
    3: 26000,
  },
  'RS Puram': {
    1: 15000,
    2: 24000,
    3: 42000,
    4: 55000,
  },
  'Anna Nagar': {
    1: 14000,
    2: 22000,
    3: 24200,
    4: 40000,
  },
  'Thillai Nagar': {
    1: 14200,
    2: 18000,
    3: 28000,
  },
  'Coonoor': {
    1: 15000,
    2: 25000,
    3: 38000,
  },
  'Alagapuram': {
    1: 11000,
    2: 21000,
    3: 30000,
  },
  'Kovilpatti': {
    1: 7500,
    2: 13500,
    3: 20000,
  },
  'Nagercoil': {
    1: 9000,
    2: 16500,
    3: 24000,
  },
  'Avinashi Road': {
    1: 18000,
    2: 28000,
    3: 45000,
    4: 63000,
  },
  'Palayamkottai': {
    1: 8000,
    2: 13000,
    3: 19000,
  },
  'Katpadi': {
    1: 7800,
    2: 12500,
    3: 18000,
  }
};

const getPriceComparison = (location: string, bhk: number, price: number) => {
  let avgPrice = 0;
  const locAverages = NEIGHBORHOOD_AVERAGES[location];
  if (locAverages && locAverages[bhk]) {
    avgPrice = locAverages[bhk];
  } else {
    // General logical fallback estimation based on BHK if neighborhood isn't registered
    const defaultRates: Record<number, number> = { 1: 10000, 2: 18000, 3: 28000, 4: 50000 };
    avgPrice = defaultRates[bhk] || (bhk * 12000);
  }

  const diffPercent = ((price - avgPrice) / avgPrice) * 100;

  // Designated "at average" zone of within +/- 3%
  if (Math.abs(diffPercent) <= 3) {
    return { type: 'at' as const, differencePercent: Math.abs(diffPercent), avgPrice };
  } else if (diffPercent < 0) {
    return { type: 'below' as const, differencePercent: Math.abs(diffPercent), avgPrice };
  } else {
    return { type: 'above' as const, differencePercent: diffPercent, avgPrice };
  }
};

export interface ListingCardProps {
  listing: Listing;
  score?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isComparing?: boolean;
  onToggleCompare?: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  score, 
  isFavorite, 
  onToggleFavorite,
  isComparing = false,
  onToggleCompare
}) => {
  const [showMap, setShowMap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(13); // Default Neighborhood-level zoom (z=13)
  const [showContact, setShowContact] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setImageIndex((prev) => (prev + 1) % images.length);
    } else if (isRightSwipe) {
      setImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const images = listing.roomImages && listing.roomImages.length > 0 
    ? [listing.imageUrl, ...listing.roomImages.filter(url => url !== listing.imageUrl)] // Ensure main image is first
    : [listing.imageUrl];

  // Auto-scrolling feature for the image gallery container (cycles every 5 seconds, pauses on hover)
  React.useEffect(() => {
    if (showMap || images.length <= 1 || isHovered) return;

    const intervalId = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [showMap, images.length, isHovered]);

  // Compute deviation of property rent compared to neighborhood levels
  const priceComparison = useMemo(() => {
    return getPriceComparison(listing.location, listing.bhk, listing.price);
  }, [listing.location, listing.bhk, listing.price]);

  // Compute square footage for the property based on BHK and custom presets
  const propertyArea = useMemo(() => {
    const sizeMap: Record<number, number> = { 1: 680, 2: 1120, 3: 1650, 4: 2400 };
    return sizeMap[listing.bhk] || (listing.bhk * 480 + 150);
  }, [listing.bhk]);

  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  const trendData = useMemo(() => {
    // Determine deterministic multiplier trend based on listing ID or price
    const seed = listing.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const trendType = seed % 4;
    
    let multipliers: number[];
    if (trendType === 0) {
      multipliers = [0.94, 0.952, 0.965, 0.978, 0.99, 1.0]; // steady growth
    } else if (trendType === 1) {
      multipliers = [1.025, 1.01, 0.98, 0.985, 0.992, 1.0]; // dip-recover
    } else if (trendType === 2) {
      multipliers = [0.995, 1.008, 0.992, 1.01, 0.988, 1.0]; // fluctuation
    } else {
      multipliers = [0.95, 0.95, 0.952, 0.975, 0.988, 1.0]; // step-up
    }

    const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((m, i) => ({
      month: m,
      price: Math.round(listing.price * multipliers[i])
    }));
  }, [listing.id, listing.price]);

  const pctChange = useMemo(() => {
    const start = trendData[0].price;
    const end = trendData[trendData.length - 1].price;
    return ((end - start) / start) * 100;
  }, [trendData]);

  const sparklineData = useMemo(() => {
    const width = 300;
    const height = 48;
    const prices = trendData.map(d => d.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;
    const padding = range * 0.15;
    const adjMin = minP - padding;
    const adjMax = maxP + padding;
    const adjRange = adjMax - adjMin;

    const points = trendData.map((d, i) => {
      const x = (i / (trendData.length - 1)) * width;
      const y = height - ((d.price - adjMin) / adjRange) * height;
      return { x, y };
    });

    const linePath = points.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
    const areaPath = linePath + ` L ${width} ${height} L 0 ${height} Z`;

    return { points, linePath, areaPath, width, height };
  }, [trendData]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const propertyUrl = `${window.location.origin}/property/${listing.id}`;
    
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.bhk} BHK in ${listing.location}, ${listing.district} for ₹${listing.price.toLocaleString()}/month!`,
      url: propertyUrl,
    };

    if (navigator.share) {
      try {
        // Extra validation if canShare is available
        if (!navigator.canShare || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (err) {
        console.warn("Web Share API failed, reverting to clipboard fallback:", err);
      }
    }

    // Fallback: Clipboard copy
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(propertyUrl);
      }
    } catch (err) {
      console.warn("Could not copy to clipboard, showing simulated copy instead:", err);
    }
    
    setShowShareToast(true);
    // Dismiss after 3 seconds
    setTimeout(() => {
      setShowShareToast(false);
    }, 3000);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className={`h-full flex flex-col overflow-hidden group border-none transition-all duration-300 rounded-2xl bg-white ${isComparing ? 'ring-2 ring-blue-500 shadow-xl scale-[1.02] bg-blue-50/5' : 'ring-1 ring-slate-100/50 shadow-md hover:shadow-xl'}`}>
        <div className="relative h-56 overflow-hidden bg-slate-100">
          {showMap ? (
            <div className="w-full h-full relative">
              <iframe 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location + ', ' + listing.district + ', Tamil Nadu')}&t=&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
              {/* Custom Map Zoom Control UI */}
              <div 
                className="absolute bottom-3 right-3 z-20 flex border border-slate-200/80 bg-white/95 backdrop-blur-sm p-0.5 rounded-xl shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2.5 text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1 ${zoomLevel === 13 ? 'bg-slate-900 text-white hover:bg-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(13);
                  }}
                  title="Neighborhood-level View (Zoom out)"
                >
                  <ZoomOut className="w-3 h-3" />
                  <span>Neighborhood</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2.5 text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1 ${zoomLevel === 17 ? 'bg-slate-900 text-white hover:bg-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(17);
                  }}
                  title="Street-level View (Zoom in)"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span>Street</span>
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="w-full h-full relative select-none touch-pan-y"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence initial={false}>
                <motion.img 
                  key={imageIndex}
                  src={images[imageIndex]} 
                  alt={`${listing.title} - Image ${imageIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>
              
              {/* Navigation Arrows for Multiple Images */}
              {images.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-white/70 hover:bg-white text-slate-700 ml-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-white/70 hover:bg-white text-slate-700 mr-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  {/* Dots indicator */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all ${idx === imageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {score !== undefined && !showMap && (
              <Badge className="bg-white/90 text-slate-900 border-none shadow-sm backdrop-blur-sm px-2.5 py-1 text-xs">
                {Math.round(score)}% Match
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            <Button 
              variant="secondary" 
              size="icon" 
              className={`rounded-full h-8 w-8 shadow-sm transition-transform hover:scale-105 ${showMap ? 'text-blue-500 fill-blue-500 bg-white' : 'text-slate-600 bg-white/90 hover:bg-white backdrop-blur-sm'}`}
              onClick={() => setShowMap(!showMap)}
              title={showMap ? "Hide Map" : "Show Map"}
            >
              <motion.div
                animate={showMap ? { rotate: 360, scale: [1, 1.3, 1] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex items-center justify-center tool-icon-animation"
              >
                <Map className="w-4 h-4" />
              </motion.div>
            </Button>
            {onToggleCompare && (
              <Button 
                variant="secondary" 
                size="icon" 
                className={`rounded-full h-8 w-8 shadow-sm transition-transform hover:scale-105 ${isComparing ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-500' : 'text-slate-600 bg-white/90 hover:bg-white backdrop-blur-sm'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(listing.id);
                }}
                title={isComparing ? "Remove from Compare" : "Compare Property"}
              >
                <GitCompare className="w-4 h-4" />
              </Button>
            )}
            <Button 
              variant="secondary" 
              size="icon" 
              className={`rounded-full h-8 w-8 shadow-sm transition-transform hover:scale-105 ${isFavorite ? 'text-red-500 fill-red-500 bg-white' : 'text-slate-600 bg-white/90 hover:bg-white backdrop-blur-sm'}`}
              onClick={() => onToggleFavorite?.(listing.id)}
              title="Add to Favorites"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full h-8 w-8 shadow-sm transition-transform hover:scale-105 text-slate-600 bg-white/90 hover:bg-white backdrop-blur-sm"
              onClick={handleShare}
              title="Share Property Link"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          {/* View Gallery Overlay Button */}
          {images.length > 0 && !showMap && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button 
                variant="secondary" 
                size="icon" 
                className="rounded-full h-8 w-8 shadow-sm text-slate-700 bg-white/70 hover:bg-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowGallery(true)}
                title="View Full Gallery"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Floating Map Toggle Button Overlay */}
          <div className="absolute bottom-3 left-3 flex gap-2 z-10">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-2.5 text-[10px] font-extrabold shadow-md bg-slate-900/90 text-white hover:bg-slate-950 rounded-full border border-slate-800/80 flex items-center gap-1 transition-all active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                setShowMap(!showMap);
              }}
              title={showMap ? "Show Photos" : "Show Map Preview"}
            >
              <Map className={`w-3 h-3 ${showMap ? 'text-amber-400 fill-amber-400/20' : 'text-blue-400'}`} />
              <span>{showMap ? "Photos" : "Map Preview"}</span>
            </Button>
          </div>
        </div>
        
        <CardHeader className="p-5 pb-2">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-bold leading-tight">{listing.title}</CardTitle>
            <div className="text-right shrink-0">
              <span className="text-lg font-bold text-slate-900 flex items-center justify-end">
                <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                {listing.price.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">per month</span>
              
              {/* Neighborhood average rent index label */}
              <div 
                className="mt-1 flex items-center justify-end cursor-help"
                title={`Average monthly rent for a ${listing.bhk} BHK in ${listing.location} is ₹${priceComparison.avgPrice.toLocaleString()}`}
              >
                {priceComparison.type === 'below' && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 hover:bg-emerald-100/50 transition-colors">
                    <TrendingDown className="w-2.5 h-2.5 text-emerald-500" />
                    <span>{Math.round(priceComparison.differencePercent)}% below avg</span>
                  </span>
                )}
                {priceComparison.type === 'at' && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-600 ring-1 ring-inset ring-slate-500/10 hover:bg-slate-100/50 transition-colors">
                    <Equal className="w-2.5 h-2.5 text-slate-400" />
                    <span>At neighborhood avg</span>
                  </span>
                )}
                {priceComparison.type === 'above' && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700 ring-1 ring-inset ring-amber-600/15 hover:bg-amber-100/50 transition-colors">
                    <TrendingUp className="w-2.5 h-2.5 text-amber-500" />
                    <span>{Math.round(priceComparison.differencePercent)}% above avg</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <CardDescription className="flex items-center gap-1 text-sm text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {listing.location}, {listing.district}
          </CardDescription>

          {/* Property Size Details */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <Ruler className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Size: <strong className="text-slate-700">{propertyArea.toLocaleString()} sq ft</strong></span>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-2 flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
              <BedDouble className="w-4 h-4 text-slate-400" />
              <span>{listing.bhk} BHK</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
              {listing.houseType}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {listing.amenities.slice(0, 3).map(a => (
              <Badge key={a} variant="secondary" className="text-[10px] px-2 h-5 bg-slate-100/80 font-medium text-slate-600 border-none">
                {a}
              </Badge>
            ))}
            {listing.amenities.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-2 h-5 font-medium border-slate-200 text-slate-500">
                +{listing.amenities.length - 3} more
              </Badge>
            )}
          </div>

          {/* 6-Month Price Trend Sparkline */}
          <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/40">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Neighborhood Trend</span>
              {hoveredPointIdx !== null ? (
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50/50 border border-blue-100/50 rounded px-1.5 py-0.5">
                  {trendData[hoveredPointIdx].month}: ₹{trendData[hoveredPointIdx].price.toLocaleString()}
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  {pctChange > 0.1 ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span>+{pctChange.toFixed(1)}% (6m)</span>
                    </span>
                  ) : pctChange < -0.1 ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600">
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                      <span>{pctChange.toFixed(1)}% (6m)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500">
                      <Equal className="w-3 h-3 text-slate-400" />
                      <span>Stable</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* SVG Sparkline Chart */}
            <div className="relative h-11">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${sparklineData.width} ${sparklineData.height}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`gradient-${listing.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Highlight/Vertical grid-line helper for hovered state */}
                {hoveredPointIdx !== null && (
                  <line
                    x1={sparklineData.points[hoveredPointIdx].x}
                    y1={0}
                    x2={sparklineData.points[hoveredPointIdx].x}
                    y2={sparklineData.height}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    opacity={0.5}
                  />
                )}

                {/* Sparkline gradient fill */}
                <path
                  d={sparklineData.areaPath}
                  fill={`url(#gradient-${listing.id})`}
                />

                {/* Stroke Line */}
                <path
                  d={sparklineData.linePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Circles for nodes */}
                {sparklineData.points.map((p, idx) => {
                  const isCurHovered = hoveredPointIdx === idx;
                  return (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={isCurHovered ? 4.5 : 2}
                      fill={isCurHovered ? "#2563eb" : "#3b82f6"}
                      stroke="white"
                      strokeWidth={isCurHovered ? 1.5 : 1}
                      className="transition-all duration-150"
                    />
                  );
                })}

                {/* Interactive Hitbox rects for hovering columns */}
                {sparklineData.points.map((p, idx) => (
                  <rect
                    key={idx}
                    x={Math.max(0, p.x - (sparklineData.width / (trendData.length * 2)))}
                    y={0}
                    width={sparklineData.width / (trendData.length - 1)}
                    height={sparklineData.height}
                    fill="transparent"
                    className="cursor-crosshair"
                    onMouseEnter={() => setHoveredPointIdx(idx)}
                    onMouseLeave={() => setHoveredPointIdx(null)}
                  />
                ))}
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1 px-1">
              {trendData.map((d, index) => (
                <span 
                  key={d.month} 
                  className={`transition-colors duration-150 ${hoveredPointIdx === index ? 'text-blue-600 font-bold' : ''}`}
                >
                  {d.month}
                </span>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          {!showContact ? (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailsModal(true)} 
                className="flex-1 h-11 border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Maximize2 className="w-4 h-4 text-slate-500" />
                Expand Details
              </Button>
              <Button 
                variant="default" 
                onClick={() => setShowContact(true)} 
                className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-sm font-semibold rounded-xl shadow-md text-white transition-transform active:scale-[0.98]"
              >
                Contact Owner
              </Button>
              <a 
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello! I'm interested in renting your property "${listing.title}" (${listing.bhk} BHK) in ${listing.location}, ${listing.district}. Is it still available for rent?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 w-11 shrink-0 bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center rounded-xl transition-transform active:scale-95 shadow-md"
                title="Chat with Owner on WhatsApp"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="w-5 h-5 fill-white text-white" />
              </a>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-2.5">
              <div className="w-full h-14 flex justify-between items-center bg-slate-50 px-3 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">+91 98765 43210</span>
                  <span className="text-xs text-slate-500">owner@example.com</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a 
                    href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello! I'm interested in renting your property "${listing.title}" (${listing.bhk} BHK) in ${listing.location}, ${listing.district}. Is it still available for rent?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center rounded-lg transition-transform active:scale-95 shadow-sm"
                    title="Chat on WhatsApp"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-white" />
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => setShowContact(false)} className="h-8 w-8 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowDetailsModal(true)} 
                className="w-full h-10 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                Expand Full Details
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Fullscreen Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setShowGallery(false)}
          >
            <div className="absolute top-4 right-4 z-[60]">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setShowGallery(false)}>
                <X className="w-8 h-8" />
              </Button>
            </div>
            
            <div 
              className="relative w-full max-w-5xl aspect-video mx-4 flex items-center justify-center select-none touch-pan-y" 
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={imageIndex}
                  src={images[imageIndex]} 
                  className="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    className="absolute left-[-3rem] md:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-16 w-16 rounded-full hidden md:flex items-center justify-center"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-10 h-10" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="absolute right-[-3rem] md:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-16 w-16 rounded-full hidden md:flex items-center justify-center"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-10 h-10" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Gallery thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4 overflow-x-auto pb-4 custom-scrollbar" onClick={e => e.stopPropagation()}>
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setImageIndex(idx)}
                    className={`relative h-20 w-32 rounded-md overflow-hidden shrink-0 transition-all ${idx === imageIndex ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-100 ring-1 ring-white/30'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        listing={listing}
      />

      {/* Share Toast Notification */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3.5 alert-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-extrabold text-xs text-white uppercase tracking-wider mb-0.5">Property Link Copied</h5>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {window.location.origin}/property/{listing.id}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            {/* Progress bar countdown timer */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden rounded-b-2xl">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="h-full bg-blue-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
