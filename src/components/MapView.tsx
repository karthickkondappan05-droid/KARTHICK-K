import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Listing } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { BedDouble, IndianRupee, MapPin, Info, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PropertyDetailsModal } from './PropertyDetailsModal';

// Base coordinates dictionary for Tamil Nadu centers & neighborhoods
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  'adyar': [13.0033, 80.2550],
  'omr': [12.9156, 80.2312],
  'rs puram': [11.0115, 76.9442],
  'thillai nagar': [10.8285, 78.6853],
  'coonoor': [11.3530, 76.7959],
  'alagapuram': [11.6789, 78.1441],
  'kovilpatti': [9.1724, 77.8692],
  'nagercoil': [8.1833, 77.4119],
  'palayamkottai': [8.7188, 77.7471],
  'katpadi': [12.9642, 79.1354],
  'avinashi road': [11.0264, 76.9961],
};

const getCoordinates = (location: string, district?: string): [number, number] => {
  const normalizedLoc = location.toLowerCase().trim();
  const normalizedDist = district?.toLowerCase().trim();

  if (NEIGHBORHOOD_COORDS[normalizedLoc]) {
    return NEIGHBORHOOD_COORDS[normalizedLoc];
  }

  if (normalizedLoc === 'anna nagar') {
    if (normalizedDist === 'madurai') {
      return [9.9252, 78.1406];
    }
    return [13.0850, 80.2101]; // Default to Chennai Anna Nagar
  }

  // Fallbacks: If district exists, map to city center, else general center of Tamil Nadu
  if (normalizedDist === 'chennai') return [13.0827, 80.2707];
  if (normalizedDist === 'coimbatore') return [11.0168, 76.9558];
  if (normalizedDist === 'madurai') return [9.9252, 78.1198];
  if (normalizedDist === 'tiruchirappalli' || normalizedDist === 'trichy') return [10.7905, 78.7047];
  if (normalizedDist === 'salem') return [11.6643, 78.1460];
  if (normalizedDist === 'nilgiris' || normalizedDist === 'ooty') return [11.4102, 76.6950];
  if (normalizedDist === 'vellore') return [12.9165, 79.1325];

  return [11.1271, 78.6569]; // Center of Tamil Nadu
};

// Seed-based deterministic golden ratio jitter (approx. 200m - 400m spacing)
// to prevent overlapping of properties listed in the same neighborhood
const getCoordinatesWithJitter = (id: string, location: string, district?: string): [number, number] => {
  const base = getCoordinates(location, district);
  const indexStr = id.replace(/\D/g, ''); 
  const index = indexStr ? parseInt(indexStr, 10) : 0;
  
  if (index === 0) return base;
  
  const angle = (index * 137.5) * (Math.PI / 180); // Golden angle
  const radius = 0.0022 * Math.sqrt((index % 4) + 1); 
  
  return [
    base[0] + radius * Math.sin(angle),
    base[1] + radius * Math.cos(angle)
  ];
};

interface MapViewProps {
  listings: Listing[];
}

export function MapView({ listings }: MapViewProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(listings[0] || null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  
  // Real estate details modal triggers
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalListing, setModalListing] = useState<Listing | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // Asynchronously inject Leaflet CSS & JS dynamically
  useEffect(() => {
    if ((window as any).L) {
      setIsLeafletLoaded(true);
      return;
    }

    // Stylesheet injection check
    let cssLink = document.querySelector('link[href*="leaflet.css"]') as HTMLLinkElement | null;
    if (!cssLink) {
      cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    // Script injection check
    let jsScript = document.querySelector('script[src*="leaflet.js"]') as HTMLScriptElement | null;
    if (!jsScript) {
      jsScript = document.createElement('script');
      jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      jsScript.async = true;
      jsScript.onload = () => {
        setIsLeafletLoaded(true);
      };
      document.body.appendChild(jsScript);
    } else {
      const interval = setInterval(() => {
        if ((window as any).L) {
          setIsLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Update selection dynamically when lists modify
  useEffect(() => {
    if (listings.length > 0) {
      const stillInList = listings.some(l => l.id === selectedListing?.id);
      if (!stillInList) {
        setSelectedListing(listings[0]);
      }
    } else {
      setSelectedListing(null);
    }
  }, [listings]);

  // Map initialization
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Prevent re-initialization conflicts
    if (mapInstanceRef.current) return;

    const initialCenter = selectedListing
      ? getCoordinatesWithJitter(selectedListing.id, selectedListing.location, selectedListing.district)
      : [11.1271, 78.6569];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      touchZoom: true,          // Support pinch-to-zoom on mobile/touch screens
      dragging: true,           // Allow mouse/touch dragging to pan
      tap: false,               // Disable custom tap handler in Leaflet to prevent tap interference on modern screens
      bounceAtZoomLimits: true  // Improved mobile bouncy visual feedback at zoom boundaries
    }).setView(initialCenter, selectedListing ? 14 : 8);

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // High fidelity clean CartoDB Voyager map styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [isLeafletLoaded]);

  // Synchronize Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = (window as any).L;
    if (!map || !L) return;

    // Flush current markers
    Object.values(markersRef.current).forEach((marker: any) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Generate new markers
    listings.forEach((listing) => {
      const jitteredCoords = getCoordinatesWithJitter(listing.id, listing.location, listing.district);
      const isSelected = selectedListing?.id === listing.id;

      // Clean rent formats (e.g., ₹18k)
      const labelText = listing.price >= 10000 
        ? `₹${(listing.price / 1000).toFixed(0)}k` 
        : `₹${listing.price.toLocaleString()}`;

      // Custom high fidelity SVG rendering for the interactive pin
      const markerHtml = `
        <div class="flex items-center justify-center transition-all duration-300">
          <div class="px-2.5 py-1 rounded-full shadow-lg border text-[10px] font-extrabold flex items-center gap-0.5 whitespace-nowrap transition-all duration-300
            ${isSelected 
              ? 'bg-blue-600 border-blue-600 text-white scale-110 ring-4 ring-blue-500/25 translate-y-[-4px]' 
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-105'
            }"
          >
            <span>${labelText}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-price-marker',
        iconSize: [54, 24],
        iconAnchor: [27, 24]
      });

      const marker = L.marker(jitteredCoords, { icon: customIcon }).addTo(map);

      // Programmatically assembly of the detailed dynamic Popup Box DOM
      const popupContainer = document.createElement('div');
      popupContainer.className = 'p-1 max-w-[195px] flex flex-col gap-1.5 font-sans';

      // Thumbnail
      const imageEl = document.createElement('img');
      imageEl.src = listing.imageUrl;
      imageEl.className = 'w-full h-20 object-cover rounded-lg mb-1 pointer-events-none';
      popupContainer.appendChild(imageEl);

      // Title
      const titleEl = document.createElement('h4');
      titleEl.className = 'font-extrabold text-xs text-slate-900 leading-snug truncate';
      titleEl.innerText = listing.title;
      popupContainer.appendChild(titleEl);

      // Address tag 
      const pinRowEl = document.createElement('p');
      pinRowEl.className = 'text-[9px] text-slate-500 truncate flex items-center gap-0.5 -mt-0.5';
      pinRowEl.innerText = `${listing.location}, ${listing.district}`;
      popupContainer.appendChild(pinRowEl);

      // Info badge / price rows
      const badgeRow = document.createElement('div');
      badgeRow.className = 'flex items-center justify-between pt-1 border-t border-slate-150 mt-1';

      const priceTag = document.createElement('span');
      priceTag.className = 'text-xs font-black text-blue-600';
      priceTag.innerText = `₹${listing.price.toLocaleString()}`;
      badgeRow.appendChild(priceTag);

      const bhkTag = document.createElement('span');
      bhkTag.className = 'text-[8px] uppercase tracking-wider bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded';
      bhkTag.innerText = `${listing.bhk} BHK`;
      badgeRow.appendChild(bhkTag);

      popupContainer.appendChild(badgeRow);

      // View details anchor trigger
      const detailButton = document.createElement('button');
      detailButton.className = 'w-full mt-1.5 text-center text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-1.5 rounded-lg transition-colors cursor-pointer';
      detailButton.innerText = 'View Details';
      detailButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setModalListing(listing);
        setShowDetailsModal(true);
      };
      
      popupContainer.appendChild(detailButton);

      marker.bindPopup(popupContainer, {
        closeButton: false,
        offset: [0, -12]
      });

      marker.on('click', () => {
        setSelectedListing(listing);
      });

      markersRef.current[listing.id] = marker;
    });

  }, [listings, isLeafletLoaded, selectedListing?.id]);

  // Respond elegantly to selection states with flyTo and autopopup triggerings
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedListing) return;

    const targetCoords = getCoordinatesWithJitter(selectedListing.id, selectedListing.location, selectedListing.district);

    map.flyTo(targetCoords, 14, {
      animate: true,
      duration: 1.0
    });

    const focusMarker = markersRef.current[selectedListing.id];
    if (focusMarker) {
      const timeoutId = setTimeout(() => {
        focusMarker.openPopup();
      }, 850);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedListing?.id]);

  return (
    <div className="h-[calc(100vh-12rem)] min-h-[600px] flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Pop up styles overrides directly embedded to prevent file-link issues */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
          border: 1px solid #f1f5f9 !important;
          padding: 2px !important;
        }
        .leaflet-popup-content {
          margin: 6px 8px !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .custom-price-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Sidebar List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar pb-10">
        <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 py-2">
          <h2 className="text-xl font-bold tracking-tight px-1 text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>{listings.length} Properties On Map</span>
          </h2>
          <div className="mt-2 flex items-start gap-2 bg-blue-50/50 border border-blue-150 text-blue-700 p-2.5 rounded-xl text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <p>Select houses in the sidebar or click map price labels to navigate locations seamlessly.</p>
          </div>
        </div>
        
        {listings.map((listing) => {
          // Dynamic calculated area for size matching 
          const areaSqFt = { 1: 680, 2: 1120, 3: 1650, 4: 2400 }[listing.bhk] || (listing.bhk * 480 + 150);
          return (
            <motion.div
              key={listing.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedListing(listing)}
              className="cursor-pointer"
            >
              <Card className={`border-none transition-all duration-200 overflow-hidden ${selectedListing?.id === listing.id ? 'ring-2 ring-blue-600 shadow-md scale-[1.01] bg-blue-500/5' : 'ring-1 ring-slate-100/70 hover:shadow-md bg-white'}`}>
                 <div className="flex h-32">
                   <img src={listing.imageUrl} className="w-32 h-full object-cover shrink-0" alt=""/>
                   <div className="p-3.5 flex flex-col justify-between flex-1 min-w-0">
                     <div>
                       <h3 className="font-extrabold text-sm text-slate-900 truncate leading-tight">{listing.title}</h3>
                       <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                         <MapPin className="w-3 h-3 text-slate-400" /> {listing.location}, {listing.district}
                       </p>
                     </div>
                     <div className="text-[10px] text-slate-400 font-mono">
                       {areaSqFt.toLocaleString()} sq ft
                     </div>
                     <div className="flex items-center justify-between mt-1">
                       <span className="font-black text-sm text-blue-700 flex items-center">
                         <IndianRupee className="w-3.5 h-3.5"/>{listing.price.toLocaleString()}
                       </span>
                       <Badge variant="secondary" className="text-[9px] bg-slate-100 font-extrabold text-slate-600">{listing.bhk} BHK</Badge>
                     </div>
                   </div>
                 </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Map Frame */}
      <div className="flex-1 bg-white rounded-3xl shadow-md border border-slate-150 overflow-hidden relative min-h-[400px]">
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

        {/* Customized Dynamic Loading Screen Overlay */}
        {!isLeafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3.5 z-20">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
              <MapPin className="w-5 h-5 text-blue-600 absolute animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">Initialising Interactive Map</p>
              <p className="text-[11px] text-slate-400 mt-1">Loading vector tiles and neighborhood markers...</p>
            </div>
          </div>
        )}

        {/* Search returns no listings state handler */}
        {listings.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 gap-3 z-20">
            <MapPin className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No properties matching filters to display on map.</p>
          </div>
        )}
      </div>

      {/* Property Details Modal Connection */}
      {modalListing && (
        <PropertyDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          listing={modalListing}
        />
      )}
    </div>
  );
}
