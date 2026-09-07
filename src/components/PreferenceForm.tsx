import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { UserProfile } from '../types';
import { Filter, Search } from 'lucide-react';

interface PreferenceFormProps {
  preferences: UserProfile;
  onChange: (prefs: UserProfile) => void;
}

export function PreferenceForm({ preferences, onChange }: PreferenceFormProps) {
  const handleChange = (field: keyof UserProfile, value: any) => {
    onChange({ ...preferences, [field]: value });
  };

  return (
    <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" /> More Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Preferred BHK</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(num => (
              <Button
                key={num}
                variant={preferences.preferredBhk === num ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 ${preferences.preferredBhk === num ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
                onClick={() => handleChange('preferredBhk', num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Square Footage Range</Label>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 rounded-md border border-slate-150 px-2 py-0.5">
              {preferences.sqftMin.toLocaleString()} - {preferences.sqftMax.toLocaleString()} sq ft
            </span>
          </div>

          <div className="relative h-6 flex items-center select-none">
            {/* Track Background */}
            <div className="absolute left-0 right-0 h-1.5 bg-slate-100 rounded-full" />
            
            {/* Highlights Track Range */}
            <div 
              className="absolute h-1.5 bg-slate-900 rounded-full" 
              style={{
                left: `${((preferences.sqftMin - 400) / (3000 - 400)) * 100}%`,
                right: `${100 - ((preferences.sqftMax - 400) / (3000 - 400)) * 100}%`
              }}
            />

            {/* Minimum Range Slider Input */}
            <input
              type="range"
              min="400"
              max="3000"
              step="50"
              value={preferences.sqftMin}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), preferences.sqftMax - 100);
                handleChange('sqftMin', val);
              }}
              className="absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent cursor-pointer focus:outline-none focus:ring-0
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-slate-900
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:scale-115
                [&::-webkit-slider-thumb]:active:scale-125
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-slate-900
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:transition-all
                [&::-moz-range-thumb]:hover:scale-115
                [&::-moz-range-thumb]:active:scale-125"
              style={{ zIndex: preferences.sqftMin > 1700 ? 5 : 4 }}
            />

            {/* Maximum Range Slider Input */}
            <input
              type="range"
              min="400"
              max="3000"
              step="50"
              value={preferences.sqftMax}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), preferences.sqftMin + 100);
                handleChange('sqftMax', val);
              }}
              className="absolute w-full h-1.5 pointer-events-none appearance-none bg-transparent cursor-pointer focus:outline-none focus:ring-0
                [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-slate-900
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:scale-115
                [&::-webkit-slider-thumb]:active:scale-125
                [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-slate-900
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:transition-all
                [&::-moz-range-thumb]:hover:scale-115
                [&::-moz-range-thumb]:active:scale-125"
              style={{ zIndex: preferences.sqftMin > 1700 ? 4 : 5 }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>400 sq ft</span>
            <span>3,000 sq ft</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Essential Amenities</Label>
          <div className="flex flex-wrap gap-2">
            {['WiFi', 'Pool', 'Gym', 'Parking', 'Garden', 'Security'].map(amenity => (
              <Button
                key={amenity}
                variant={preferences.requiredAmenities.includes(amenity) ? 'secondary' : 'outline'}
                size="sm"
                className={`text-xs h-8 px-3 rounded-full ${preferences.requiredAmenities.includes(amenity) ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'text-slate-600 border-slate-200'}`}
                onClick={() => {
                  const existing = preferences.requiredAmenities;
                  const next = existing.includes(amenity) 
                    ? existing.filter(a => a !== amenity)
                    : [...existing, amenity];
                  handleChange('requiredAmenities', next);
                }}
              >
                {amenity}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
