import React from 'react';
import { Listing } from '../types';
import { X, GitCompare, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface CompareFloatingBarProps {
  selectedListings: Listing[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  selectedListings,
  onRemove,
  onClear,
  onCompare,
}) => {
  if (selectedListings.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        exit={{ y: 100, opacity: 0, x: '-50%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="fixed bottom-6 left-1/2 z-40 max-w-2xl w-[92%] sm:w-auto bg-slate-900 border border-slate-800 text-white rounded-full px-5 py-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md"
      >
        {/* Selected listings thumbnails list */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600/20 text-blue-400 shrink-0">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300">
              Comparing <span className="text-white font-bold">{selectedListings.length}</span> / 3
            </p>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          {/* List of items selected */}
          <div className="flex items-center gap-2">
            {selectedListings.map((listing) => (
              <div 
                key={listing.id} 
                className="relative group h-10 w-10 shrink-0 rounded-full overflow-hidden border border-slate-700 bg-slate-800"
                title={listing.title}
              >
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="h-full w-full object-cover" 
                />
                <button
                  type="button"
                  onClick={() => onRemove(listing.id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-500 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {Array.from({ length: 3 - selectedListings.length }).map((_, idx) => (
              <div 
                key={idx} 
                className="h-10 w-10 shrink-0 rounded-full border border-dashed border-slate-800 flex items-center justify-center text-slate-600 bg-slate-900/50"
              >
                <span className="text-[10px] font-bold">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button 
            type="button"
            onClick={onClear} 
            className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-full transition-colors"
          >
            Clear All
          </button>
          
          <Button
            onClick={onCompare}
            disabled={selectedListings.length < 2}
            className="rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs px-5 py-2 h-9 flex items-center shadow-md disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
          >
            Compare Now
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
