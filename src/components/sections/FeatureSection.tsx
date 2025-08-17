/**
 * Features Section Component
 * Optimized version with better performance and cleaner code
 */
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";
import { FeaturesSectionProps, Feature as FeatureType } from "@/types";

const FEATURE_ICONS = [
  IconTerminal2,
  IconEaseInOut,
  IconCurrencyDollar,
  IconCloud,
  IconRouteAltLeft,
  IconHelp,
  IconAdjustmentsBolt,
  IconHeart,
];

interface FeatureProps extends FeatureType {
  index: number;
}

const Feature: React.FC<FeatureProps> = ({ title, description, index }) => {
  const IconComponent = FEATURE_ICONS[index % FEATURE_ICONS.length];

  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l border-neutral-800",
        index < 4 && "lg:border-b border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-400">
        <IconComponent className="w-10 h-10" />
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  features = [] 
}) => {
  const safeFeatures = features.filter(Boolean);

  if (safeFeatures.length === 0) {
    return (
      <div className="py-10 max-w-7xl mx-auto text-center">
        <p className="text-neutral-400">No features to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {safeFeatures.map((feature, index) => (
        <Feature
          key={feature.id || `feature-${index}`}
          {...feature}
          index={index}
        />
      ))}
    </div>
  );
};
