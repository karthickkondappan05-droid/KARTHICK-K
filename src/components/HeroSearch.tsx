import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Listing } from '../types';
import { Search, MapPin, Home as HomeIcon, Filter, X, History } from 'lucide-react';

interface HeroSearchProps {
  preferences: UserProfile;
  searchQuery: string;
  onPreferencesChange: (prefs: UserProfile) => void;
  onSearchQueryChange: (query: string) => void;
  listings?: Listing[];
}

const DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", 
  "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", 
  "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", 
  "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", 
  "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", 
  "Viluppuram", "Virudhunagar"
];

export function HeroSearch({ preferences, searchQuery, onPreferencesChange, onSearchQueryChange, listings = [] }: React.PropsWithChildren<HeroSearchProps>) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allDistricts = React.useMemo(() => {
    const customDistricts = listings
      .map(l => l.district || '')
      .filter((d): d is string => !!d && typeof d === 'string');
    
    const merged = Array.from(new Set([...DISTRICTS, ...customDistricts]))
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    return merged.sort((a, b) => a.localeCompare(b));
  }, [listings]);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Keep top 5 searches
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s.toLowerCase() !== query.toLowerCase());
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const handlePrefChange = (field: keyof UserProfile, value: any) => {
    onPreferencesChange({ ...preferences, [field]: value });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestions = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    // Get unique locations and districts matching the query
    const matches = listings.filter(l => 
      l.location.toLowerCase().includes(query) || 
      l.district.toLowerCase().includes(query) ||
      l.title.toLowerCase().includes(query)
    ).slice(0, 5); // top 5 matches
    
    return matches;
  };

  const suggestions = getSuggestions();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveSearchQuery(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = () => {
    saveSearchQuery(searchQuery);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full h-[430px] mb-12 rounded-3xl overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000")' }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-8 drop-shadow-md tracking-tight">
          Find your perfect rental home.
        </h2>
        
        {/* Search Bar Container */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl p-2 w-full flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* Location Search Input */}
          <div className="flex-1 w-full flex items-center px-6 py-3 md:py-0 relative" ref={searchRef}>
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <div className="flex-1 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1">Search Keywords</label>
              <input 
                type="text"
                placeholder="Ex. Adyar, Chennai, Villa..."
                className="w-full bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:ring-0"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              
              {/* Smart Suggestions & Recent Searches Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50">
                  {searchQuery.trim().length > 0 ? (
                    suggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Suggested Matches</div>
                        {suggestions.map(suggestion => (
                          <div 
                            key={suggestion.id}
                            className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-3 transition-colors"
                            onClick={() => {
                              onSearchQueryChange(suggestion.title);
                              saveSearchQuery(suggestion.title);
                              setShowSuggestions(false);
                            }}
                          >
                            <Search className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{suggestion.title}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{suggestion.location}, {suggestion.district}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">No exact matches found</div>
                    )
                  ) : (
                    recentSearches.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1.5 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            Recent Searches
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearRecentSearches();
                            }}
                            className="text-[9px] font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
                          >
                            Clear All
                          </button>
                        </div>
                        {recentSearches.map((query, index) => (
                          <div 
                            key={index}
                            className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors group"
                            onClick={() => {
                              onSearchQueryChange(query);
                              saveSearchQuery(query);
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <History className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white font-medium">{query}</span>
                            </div>
                            <button
                              title="Delete search"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearch(query);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-150 dark:hover:bg-slate-700 rounded transition-all text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* District Dropdown */}
          <div className="flex-1 w-full flex items-center px-6 py-3 md:py-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors md:rounded-none">
            <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1">District</label>
              <select 
                title="District"
                value={preferences.preferredDistrict}
                onChange={(e) => handlePrefChange('preferredDistrict', e.target.value)}
                className="w-full bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900 dark:text-slate-100">All Districts</option>
                {allDistricts.map(d => <option key={d} value={d} className="dark:bg-slate-900 dark:text-slate-100">{d}</option>)}
              </select>
            </div>
          </div>

          {/* House Type Dropdown */}
          <div className="flex-1 w-full flex items-center px-6 py-3 md:py-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
            <HomeIcon className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1">House Type</label>
              <select 
                title="House Type"
                value={preferences.preferredHouseType}
                onChange={(e) => handlePrefChange('preferredHouseType', e.target.value)}
                className="w-full bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900 dark:text-slate-100">All Types</option>
                <option value="Apartment" className="dark:bg-slate-900 dark:text-slate-100">Apartment</option>
                <option value="Independent House" className="dark:bg-slate-900 dark:text-slate-100">Independent House</option>
                <option value="Villa" className="dark:bg-slate-900 dark:text-slate-100">Villa</option>
                <option value="Studio" className="dark:bg-slate-900 dark:text-slate-100">Studio</option>
              </select>
            </div>
          </div>

          {/* Budget Range (Simplified for Search Bar) */}
          <div className="flex-1 w-full flex items-center px-6 py-3 md:py-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors md:rounded-r-full">
            <Filter className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <div className="flex-1 flex gap-2 items-center">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1">Min Budget</label>
                <select 
                  title="Min Budget"
                  value={preferences.budgetMin}
                  onChange={(e) => handlePrefChange('budgetMin', parseInt(e.target.value))}
                  className="w-full bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer appearance-none"
                >
                  {[2000, 3000, 5000, 10000, 15000, 20000, 30000].map(v => (
                    <option key={v} value={v} className="dark:bg-slate-900 dark:text-slate-100">₹{v}</option>
                  ))}
                </select>
              </div>
              <span className="text-slate-300">-</span>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-1">Max Budget</label>
                <select 
                  title="Max Budget"
                  value={preferences.budgetMax}
                  onChange={(e) => handlePrefChange('budgetMax', parseInt(e.target.value))}
                  className="w-full bg-transparent border-none p-0 text-sm text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer appearance-none"
                >
                  {[10000, 20000, 30000, 50000, 100000, 200000].map(v => (
                    <option key={v} value={v} className="dark:bg-slate-900 dark:text-slate-100">₹{v}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Search Button (aesthetic & logic) */}
            <button 
              onClick={handleSearchSubmit}
              className="ml-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors shrink-0 shadow-md cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          
        </div>

        {/* Recent Searches Chips Section below Search Bar */}
        {recentSearches.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center items-center gap-2 z-10 animate-fade-in">
            <span className="text-xs text-white/80 font-medium flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-white/60" />
              Recent:
            </span>
            {recentSearches.map((query, idx) => (
              <div 
                key={idx}
                className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-slate-850/40 hover:bg-white/20 dark:hover:bg-slate-800/60 hover:scale-105 active:scale-95 transition-all backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/15 cursor-pointer shadow-sm"
                onClick={() => {
                  onSearchQueryChange(query);
                  saveSearchQuery(query); // update and place first
                }}
              >
                <span className="font-medium">{query}</span>
                <button 
                  title="Remove search"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(query);
                  }}
                  className="hover:bg-white/20 rounded-full p-0.5 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={clearRecentSearches}
              className="text-[10px] uppercase font-bold text-white/60 hover:text-white underline underline-offset-4 ml-2 transition-colors cursor-pointer bg-transparent border-none outline-none"
            >
              Clear All
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
