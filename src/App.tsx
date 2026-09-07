import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Home, FileText, LayoutDashboard, Search, Sparkles, Map, User, SearchIcon, LogOut, LogIn, Heart, Settings, GitCompare, Sun, Moon, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AcademicDocs from './components/AcademicDocs';
import FlaskDocs from './components/FlaskDocs';
import { ListingCard } from './components/ListingCard';
import { SkeletonGrid } from './components/ListingSkeleton';
import { HeroSearch } from './components/HeroSearch';
import { PreferenceForm } from './components/PreferenceForm';
import { AdminPanel } from './components/AdminPanel';
import { MapView } from './components/MapView';
import { Chatbot } from './components/Chatbot';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { CompareModal } from './components/CompareModal';
import { UserProfile, Listing } from './types';
import { DUMMY_LISTINGS } from './constants';
import { getRecommendations, calculateScore } from './services/recommendation';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { auth } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

type Theme = 'light' | 'dark' | 'system';

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('user_theme');
    return (saved as Theme) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove('dark');
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else if (currentTheme === 'light') {
        // Light mode is the standard default background variables
      } else {
        // System preference detection
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        if (mq.matches) {
          root.classList.add('dark');
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem('user_theme', theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove('dark');
        if (e.matches) {
          root.classList.add('dark');
        }
      };
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState('system');
  const [viewLayout, setViewLayout] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const loadInitialListings = () => {
    const saved = localStorage.getItem('property_listings');
    return saved ? JSON.parse(saved) : DUMMY_LISTINGS;
  };

  const loadInitialPreferences = () => {
    const saved = localStorage.getItem('user_preferences');
    const defaults = {
      budgetMin: 3000,
      budgetMax: 50000,
      preferredLocation: '',
      preferredDistrict: '',
      preferredHouseType: '',
      preferredBhk: 2,
      requiredAmenities: [],
      favorites: [],
      sqftMin: 400,
      sqftMax: 3000
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  };

  const [listings, setListings] = useState<Listing[]>(loadInitialListings);
  const [preferences, setPreferences] = useState<UserProfile>(loadInitialPreferences);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  // Trigger simulated loading state to process recommendations on initial load and updates
  useEffect(() => {
    setIsLoadingRecommendations(true);
    const timer = setTimeout(() => {
      setIsLoadingRecommendations(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [preferences, searchQuery]);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareWarning, setCompareWarning] = useState<string | null>(null);

  useEffect(() => {
    if (compareWarning) {
      const timer = setTimeout(() => {
        setCompareWarning(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [compareWarning]);

  const handleToggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        setCompareWarning("You can select up to 3 properties for comparison.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleRemoveCompare = (id: string) => {
    setCompareIds(prev => prev.filter(item => item !== id));
  };

  const handleClearCompare = () => {
    setCompareIds([]);
  };

  const selectedCompareListings = useMemo(() => {
    return listings.filter(l => compareIds.includes(l.id));
  }, [listings, compareIds]);

  useEffect(() => {
    localStorage.setItem('property_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPreferences(prev => ({ ...prev, favorites: [] })); // Clear favorites on logout
      setActiveTab('system');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const recommendedListings = useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      // Filter matching listings globally across ALL listings so custom-added items are always discoverable
      const matched = listings.filter(l => 
        l.title.toLowerCase().includes(query) || 
        l.location.toLowerCase().includes(query) ||
        l.district.toLowerCase().includes(query) ||
        l.houseType.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.amenities.some(a => a.toLowerCase().includes(query))
      );
      
      // Rank matched results based on preference compatibility score
      return matched.map(l => ({
        ...l,
        score: calculateScore(l, preferences)
      })).sort((a, b) => b.score - a.score);
    }
    
    return getRecommendations(listings, preferences);
  }, [preferences, searchQuery, listings]);

  const toggleFavorite = (id: string) => {
    setPreferences(prev => ({
      ...prev,
      favorites: prev.favorites.includes(id) 
        ? prev.favorites.filter(fid => fid !== id)
        : [...prev.favorites, id]
    }));
  };

  const handleAddListing = (listing: Listing) => {
    setListings([listing, ...listings]);
  };

  const handleEditListing = (updatedListing: Listing) => {
    setListings(listings.map(l => l.id === updatedListing.id ? updatedListing : l));
  };

  const handleDeleteListing = (id: string) => {
    setListings(listings.filter(l => l.id !== id));
    // also remove from favorites if deleted
    setPreferences(prev => ({ ...prev, favorites: prev.favorites.filter(favId => favId !== id) }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Home className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">RentMate</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">Recommendation System</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden md:flex">
            <TabsList className="bg-slate-100/50 p-1">
              <TabsTrigger value="system" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Home className="w-4 h-4" /> Home
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Map className="w-4 h-4" /> Map View
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Heart className="w-4 h-4" /> Favorites
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4" /> Admin
              </TabsTrigger>
              <TabsTrigger value="docs" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="w-4 h-4" /> Docs
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-4">
            {/* Elegant Segmented Theme Switcher */}
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200/55 shadow-xs transition-colors">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-all focus:outline-none cursor-pointer ${theme === 'light' ? 'bg-white dark:bg-slate-705 text-blue-600 shadow-sm scale-105 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-all focus:outline-none cursor-pointer ${theme === 'dark' ? 'bg-white dark:bg-slate-705 text-blue-600 shadow-sm scale-105 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-full transition-all focus:outline-none cursor-pointer ${theme === 'system' ? 'bg-white dark:bg-slate-705 text-blue-600 shadow-sm scale-105 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="System Default"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-600">v1.2 Stable</span>
            </div>
            
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                <img src={user.photoURL || ''} alt="Avatar" className="w-7 h-7 rounded-full bg-slate-200" />
                <span className="text-sm font-medium hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-500 hover:text-slate-900" onClick={handleLogout} title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:block">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'system' ? (
            <motion.div
              key="system"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              {/* Hero Search Section */}
              <HeroSearch 
                preferences={preferences}
                searchQuery={searchQuery}
                onPreferencesChange={setPreferences}
                onSearchQueryChange={setSearchQuery}
                listings={listings}
              />

              {viewLayout === 'grid' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                  {/* Sidebar: Preferences */}
                  <aside className="lg:col-span-3 space-y-6">
                    <div className="sticky top-28">
                      <PreferenceForm preferences={preferences} onChange={setPreferences} />
                      
                      {/* Stats Card */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Search Insights</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Listings Scanned</span>
                            <span className="font-bold text-slate-800">{listings.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">High Matches (&gt;80%)</span>
                            <span className="font-bold text-slate-800">{recommendedListings.filter(l => l.score > 80).length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>

                  {/* Main Content: Listings */}
                  <div className="lg:col-span-9 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight">Smart Recommendations</h2>
                        <p className="text-slate-500 mt-1">Based on your unique preference profile</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Badge variant="secondary" className="bg-slate-100 font-normal self-start md:self-auto h-9 px-4 flex items-center rounded-full text-slate-600">
                          Sorted by Relevancy
                        </Badge>
                      </div>
                    </div>

                    {isLoadingRecommendations ? (
                      <SkeletonGrid count={6} />
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {recommendedListings.map(listing => (
                            <ListingCard 
                              key={listing.id} 
                              listing={listing} 
                              score={listing.score}
                              isFavorite={preferences.favorites.includes(listing.id)}
                              onToggleFavorite={toggleFavorite}
                              isComparing={compareIds.includes(listing.id)}
                              onToggleCompare={handleToggleCompare}
                            />
                          ))}
                        </div>

                        {recommendedListings.length === 0 && (
                          <div className="py-20 text-center space-y-4">
                            <div className="inline-block p-6 bg-slate-50 rounded-full">
                              <Search className="w-12 h-12 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-semibold">No matches found</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">Try broadening your budget or location preferences to see more results.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <MapView listings={recommendedListings} />
                </motion.div>
              )}
            </motion.div>
          ) : activeTab === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MapView listings={recommendedListings} />
            </motion.div>
          ) : activeTab === 'favorites' ? (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Saved Favorites</h2>
                <p className="text-slate-500 mt-1">Properties you've kept an eye on</p>
              </div>

              {preferences.favorites.length > 0 && (
                viewLayout === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {listings.filter(l => preferences.favorites.includes(l.id)).map(listing => (
                      <ListingCard 
                        key={listing.id} 
                        listing={listing} 
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        isComparing={compareIds.includes(listing.id)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full font-sans"
                  >
                    <MapView listings={listings.filter(l => preferences.favorites.includes(l.id))} />
                  </motion.div>
                )
              )}

              {preferences.favorites.length === 0 && (
                <div className="py-20 text-center space-y-4">
                  <div className="inline-block p-6 bg-red-50 rounded-full">
                    <Heart className="w-12 h-12 text-red-300" />
                  </div>
                  <h3 className="text-xl font-semibold">No favorites yet</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Click the heart icon on any property to save it to your favorites.</p>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AdminPanel 
                listings={listings} 
                onAddListing={handleAddListing}
                onEditListing={handleEditListing}
                onDeleteListing={handleDeleteListing}
              />
            </motion.div>
          ) : activeTab === 'docs' ? (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4">Internal Documentation</Badge>
                <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Project Final Submission</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  A comprehensive overview of the architectural and algorithmic logic behind RentMate.
                </p>
              </div>
              <AcademicDocs />
            </motion.div>
          ) : activeTab === 'python-backend' ? (
            <motion.div
              key="python-backend"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <FlaskDocs />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Floating Layout Toggle (Grid/Map) for System/Favorites tabs */}
        <AnimatePresence>
          {(activeTab === 'system' || activeTab === 'favorites') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="fixed bottom-6 left-6 z-50"
            >
              <Button
                onClick={() => setViewLayout(prev => prev === 'grid' ? 'map' : 'grid')}
                className="h-14 px-5.5 rounded-full shadow-2xl bg-slate-950 dark:bg-slate-900 text-white hover:bg-slate-850 dark:hover:bg-slate-800 flex items-center gap-2.5 border border-slate-800 transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold text-sm shadow-black/40"
              >
                {viewLayout === 'grid' ? (
                  <>
                    <Map className="w-4.5 h-4.5 text-blue-400 shrink-0 animate-pulse" />
                    <span className="tracking-tight">View Map</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-4.5 h-4.5 text-emerald-450 shrink-0" />
                    <span className="tracking-tight">View Grid</span>
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Chatbot */}
        <Chatbot listings={listings} />

        {/* Property Comparison Components */}
        <CompareFloatingBar
          selectedListings={selectedCompareListings}
          onRemove={handleRemoveCompare}
          onClear={handleClearCompare}
          onCompare={() => setIsCompareOpen(true)}
        />

        <CompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          listings={selectedCompareListings}
          onRemove={handleRemoveCompare}
        />

        {/* Custom Notification Toast for Limit Warnings */}
        <AnimatePresence>
          {compareWarning && (
            <motion.div
              initial={{ opacity: 0, y: 45, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 45, x: '-50%' }}
              className="fixed bottom-28 left-1/2 z-50 transform -translate-x-1/2 bg-red-650/95 border border-red-500 text-white px-4.5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold bg-slate-900 border-slate-800"
            >
              <span className="text-amber-400">⚠️</span> {compareWarning}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Branding */}
      <footer className="mt-20 border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Home className="text-white w-4 h-4" />
            </div>
            <span className="font-bold">RentMate 2026</span>
          </div>
          
          <nav className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">API Documentation</a>
          </nav>

          <div className="text-xs text-slate-400">
            Built as a Project Prototype for Academic Evaluation
          </div>
        </div>
      </footer>
    </div>
  );
}
