/**
 * Hero Section Component
 * Optimized version with better performance and cleaner code
 */
"use client";

import React from "react";
import { motion } from "motion/react";
import { HeroSectionProps } from "@/types";
import { DEFAULT_VALUES } from "@/constants";

interface NavbarProps {
  brand: string;
  buttonText: string;
}

const Navbar: React.FC<NavbarProps> = ({ brand, buttonText }) => (
  <nav className="relative z-20 flex w-full items-center justify-between border-b border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900">
    <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
      {brand}
    </div>
    <button className="rounded-lg bg-neutral-800 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-800 dark:hover:bg-neutral-300">
      {buttonText}
    </button>
  </nav>
);

export const HeroSectionOne: React.FC<HeroSectionProps> = ({
  navbarBrand = DEFAULT_VALUES.HERO_SECTION.navbarBrand,
  navbarButtonText = DEFAULT_VALUES.HERO_SECTION.navbarButtonText,
  title = DEFAULT_VALUES.HERO_SECTION.title,
  description = DEFAULT_VALUES.HERO_SECTION.description,
  primaryButtonText = DEFAULT_VALUES.HERO_SECTION.primaryButtonText,
  secondaryButtonText = DEFAULT_VALUES.HERO_SECTION.secondaryButtonText,
  imageSrc = DEFAULT_VALUES.HERO_SECTION.imageSrc,
}) => {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <Navbar brand={navbarBrand} buttonText={navbarButtonText} />
      
      {/* Side Lines */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80" />
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80" />

      {/* Content */}
      <div className="px-4 py-10 md:py-20">
        {/* Animated Title */}
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {title.split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto mt-6 max-w-2xl text-center text-lg text-slate-600 dark:text-slate-400"
        >
          {description}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.0 }}
          className="relative z-10 mx-auto mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button className="rounded-lg bg-slate-800 px-8 py-3 text-white transition-colors hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-800 dark:hover:bg-slate-300">
            {primaryButtonText}
          </button>
          <button className="rounded-lg border border-slate-300 px-8 py-3 text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
            {secondaryButtonText}
          </button>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
            <img
              src={imageSrc}
              alt="Landing page preview"
              className="aspect-[16/9] h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
