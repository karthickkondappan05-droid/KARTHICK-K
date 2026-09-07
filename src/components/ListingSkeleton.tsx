import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from './ui/card';

export interface ListingSkeletonProps {
  className?: string;
}

export const ListingSkeleton: React.FC<ListingSkeletonProps> = () => {
  return (
    <div className="h-full">
      <Card className="h-full flex flex-col overflow-hidden border-none ring-1 ring-slate-100/50 shadow-md rounded-2xl bg-white select-none">
        {/* Pulsing Image/Map Overlay Area */}
        <div className="relative h-56 bg-slate-100 overflow-hidden animate-pulse">
          {/* Mock Score Badge Skeleton */}
          <div className="absolute top-3 left-3 bg-slate-200/80 rounded-full h-6 w-24" />

          {/* Mock Control Buttons (Top Right Overlay) */}
          <div className="absolute top-3 right-3 flex gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200/80" />
            <div className="h-8 w-8 rounded-full bg-slate-200/80" />
            <div className="h-8 w-8 rounded-full bg-slate-200/80" />
          </div>

          {/* Bottom Left Map Preview Button Skeleton */}
          <div className="absolute bottom-3 left-3 bg-slate-200/90 rounded-full h-7 w-28" />
        </div>

        {/* Card Header Section mimicking the real card */}
        <CardHeader className="p-5 pb-2">
          <div className="flex justify-between items-start gap-4">
            {/* Title Skeleton */}
            <div className="flex-1 space-y-2 animate-pulse">
              <div className="h-5 bg-slate-200 rounded-lg w-4/5" />
              <div className="h-3.5 bg-slate-200 rounded-lg w-2/3" />
            </div>
            {/* Price Skeleton */}
            <div className="text-right shrink-0 space-y-1.5 animate-pulse">
              <div className="h-5 bg-slate-200 rounded-lg w-16 ml-auto" />
              <div className="h-3 bg-slate-100 rounded-lg w-12 ml-auto" />
            </div>
          </div>
          {/* Address Line Skeleton */}
          <div className="flex items-center gap-1.5 mt-3 animate-pulse">
            <div className="h-3.5 w-3.5 rounded bg-slate-200" />
            <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
          </div>
        </CardHeader>

        {/* Card Content Section mimicking BHK and Amenities */}
        <CardContent className="p-5 pt-2 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3 animate-pulse">
            {/* BHK specification pill */}
            <div className="h-7 w-20 rounded-lg bg-slate-100" />
            {/* House Type specification pill */}
            <div className="h-7 w-24 rounded-lg bg-slate-100" />
          </div>

          {/* Amenities Badge Skeletons */}
          <div className="flex flex-wrap gap-1.5 animate-pulse">
            <div className="h-5 bg-slate-100 rounded px-2 w-14" />
            <div className="h-5 bg-slate-100 rounded px-2 w-20" />
            <div className="h-5 bg-slate-100 rounded px-2 w-16" />
          </div>
        </CardContent>

        {/* Card Footer Section mimicking CTA Buttons */}
        <CardFooter className="p-5 pt-0">
          <div className="flex gap-2 w-full animate-pulse">
            {/* Expand details button skeleton */}
            <div className="flex-1 h-11 bg-slate-100 border border-slate-100 rounded-xl" />
            {/* Contact owner button skeleton */}
            <div className="flex-1 h-11 bg-slate-200 rounded-xl" />
            {/* WhatsApp button skeleton */}
            <div className="h-11 w-11 shrink-0 bg-slate-100 rounded-xl" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export interface SkeletonGridProps {
  count?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ListingSkeleton key={idx} />
      ))}
    </div>
  );
};
