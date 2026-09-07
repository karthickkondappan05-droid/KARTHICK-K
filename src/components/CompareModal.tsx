import React from 'react';
import { Listing } from '../types';
import { X, Check, ArrowRight, IndianRupee, BedDouble, MapPin, Building2, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onRemove: (id: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, listings, onRemove }) => {
  if (!isOpen) return null;

  // Find all unique amenities across the compared listings
  const allAmenities = Array.from(
    new Set(listings.flatMap((listing) => listing.amenities || []))
  ).sort();

  // Highlight cheapest listing if there's more than 1
  const cheapestListingId = React.useMemo(() => {
    if (listings.length < 2) return null;
    const sorted = [...listings].sort((a, b) => a.price - b.price);
    return sorted[0].id;
  }, [listings]);

  // Highlight listing with most amenities
  const mostAmenitiesListingId = React.useMemo(() => {
    if (listings.length < 2) return null;
    let max = -1;
    let maxId = '';
    listings.forEach(l => {
      const len = l.amenities?.length || 0;
      if (len > max) {
        max = len;
        maxId = l.id;
      }
    });
    return maxId;
  }, [listings]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col my-8 max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl sticky top-0 z-10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Compare Properties</h3>
              <p className="text-sm text-slate-500 mt-1">
                Comparing {listings.length} of {3} maximum properties
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="rounded-full h-10 w-10 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-6 custom-scrollbar">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <ArrowRight className="w-12 h-12 text-slate-400 rotate-45" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">No properties selected</h4>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Add up to three listings from the search panel using the compare icon and check their side-by-side differences.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {/* Empty block in corner */}
                    <th className="w-64 min-w-[16rem] pb-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                      Specification
                    </th>
                    {listings.map((listing) => (
                      <th key={listing.id} className="pb-4 min-w-[20rem] px-4 relative group">
                        <div className="absolute top-0 right-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-500 h-8 font-medium px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-red-50"
                            onClick={() => onRemove(listing.id)}
                          >
                            <X className="w-3.5 h-3.5" /> Remove
                          </Button>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                          <div className="h-32 rounded-xl overflow-hidden relative bg-slate-100">
                            <img
                              src={listing.imageUrl}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                            {cheapestListingId === listing.id && (
                              <div className="absolute bottom-2 left-2">
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-white font-medium shadow-sm text-[10px] px-2 py-0.5">
                                  Cheapest Option
                                </Badge>
                              </div>
                            )}
                            {mostAmenitiesListingId === listing.id && cheapestListingId !== listing.id && (
                              <div className="absolute bottom-2 left-2">
                                <Badge className="bg-blue-600 hover:bg-blue-700 border-none text-white font-medium shadow-sm text-[10px] px-2 py-0.5">
                                  Most Facilities
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 line-clamp-1 text-base">
                              {listing.title}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {listing.location}, {listing.district}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                    {listings.length < 3 && (
                      <th className="pb-4 px-4 align-middle">
                        <div className="h-[210px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Slot {listings.length + 1} Empty
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-[150px]">
                            Add another property to comparison matrix.
                          </p>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Rent Price */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 font-medium text-slate-500 text-sm flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-slate-400" /> rent / price
                    </td>
                    {listings.map((l) => (
                      <td key={l.id} className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 stroke-[2.5]" />
                            {l.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400">per month</span>
                        </div>
                      </td>
                    ))}
                    {listings.length < 3 && <td className="py-4 px-4 bg-slate-50/20">—</td>}
                  </tr>

                  {/* BHK Row */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 font-medium text-slate-500 text-sm flex items-center gap-2">
                      <BedDouble className="w-4 h-4 text-slate-400" /> BHK
                    </td>
                    {listings.map((l) => (
                      <td key={l.id} className="py-4 px-4">
                        <span className="font-semibold text-slate-800 text-sm bg-slate-100/80 border border-slate-200/50 px-2.5 py-1 rounded-lg">
                          {l.bhk} BHK
                        </span>
                      </td>
                    ))}
                    {listings.length < 3 && <td className="py-4 px-4 bg-slate-50/20">—</td>}
                  </tr>

                  {/* Property Type */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 font-medium text-slate-500 text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" /> Home Type
                    </td>
                    {listings.map((l) => (
                      <td key={l.id} className="py-4 px-4">
                        <span className="text-sm text-slate-700 font-medium">
                          {l.houseType}
                        </span>
                      </td>
                    ))}
                    {listings.length < 3 && <td className="py-4 px-4 bg-slate-50/20">—</td>}
                  </tr>

                  {/* Description Info */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-4 font-medium text-slate-500 text-sm flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-400" /> Description
                    </td>
                    {listings.map((l) => (
                      <td key={l.id} className="py-4 px-4">
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-[280px]">
                          {l.description || 'No description provided.'}
                        </p>
                      </td>
                    ))}
                    {listings.length < 3 && <td className="py-4 px-4 bg-slate-50/20">—</td>}
                  </tr>

                  {/* Row for Title of Amenities */}
                  <tr className="bg-slate-50/60">
                    <td colSpan={4} className="py-2.5 px-3 font-semibold text-slate-800 text-xs uppercase tracking-wider">
                      Amenities Details Checklist
                    </td>
                  </tr>

                  {/* Checklist of each amenity dynamically mapped */}
                  {allAmenities.map((amenity) => (
                    <tr key={amenity} className="hover:bg-slate-50/30">
                      <td className="py-3 px-3 text-sm font-medium text-slate-600">
                        {amenity}
                      </td>
                      {listings.map((l) => {
                        const hasAmenity = l.amenities?.includes(amenity);
                        return (
                          <td key={l.id} className="py-3 px-4">
                            {hasAmenity ? (
                              <div className="inline-flex items-center justify-center p-1 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <span className="text-slate-300 font-bold">—</span>
                            )}
                          </td>
                        );
                      })}
                      {listings.length < 3 && <td className="py-3 px-4 bg-slate-50/20">—</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <Button variant="outline" className="rounded-full px-5 text-sm" onClick={onClose}>
              Close Comparison
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
