/**
 * Puck Editor Configuration
 * Optimized configuration with proper component definitions
 */
"use client";

import { Config } from "@measured/puck";
import { HeroSectionOne } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeatureSection";
import { EnhancedTextField } from "@/components/fields/EnhancedTextField";
import { EnhancedTextAreaField } from "@/components/fields/EnhancedTextAreaField";
import { HeroSectionProps, FeaturesSectionProps } from "@/types";

export const PuckConfig: Config = {
  components: {
    HeroSectionOne: {
      fields: {
        navbarBrand: {
          type: "custom",
          render: ({ onChange, value, id }) => (
            <EnhancedTextField
              label="Navbar Brand"
              value={value as string}
              onChange={onChange}
              elementId={id}
              fieldName="navbarBrand"
              fieldType="text"
              placeholder="Enter brand name"
            />
          ),
        },
        navbarButtonText: {
          type: "custom",
          render: ({ onChange, value, id }) => (
            <EnhancedTextField
              label="Navbar Button Text"
              value={value as string}
              onChange={onChange}
              elementId={id}
              fieldName="navbarButtonText"
              fieldType="text"
              placeholder="Enter button text"
            />
          ),
        },
        title: {
          type: "custom",
          render: ({ onChange, value, id }) => (
            <EnhancedTextField
              label="Title"
              value={value as string}
              onChange={onChange}
              elementId={id}
              fieldName="title"
              fieldType="title"
              placeholder="Enter hero title"
            />
          ),
        },
        description: {
          type: "custom",
          render: ({ onChange, value, id }) => (
            <EnhancedTextAreaField
              label="Description"
              value={value as string}
              onChange={onChange}
              elementId={id}
              fieldName="description"
              fieldType="description"
              placeholder="Enter hero description"
              rows={3}
            />
          ),
        },
        primaryButtonText: {
          type: "custom",
          render: ({ onChange, value, id }) => (
            <EnhancedTextField
              label="Primary Button Text"
              value={value as string}
              onChange={onChange}
              elementId={id}
              fieldName="primaryButtonText"
              fieldType="text"
              placeholder="Enter primary button text"
            />
          ),
        },
        secondaryButtonText: {
          type: "custom",
          render: ({ onChange, value, id }) => (
            <EnhancedTextField
              label="Secondary Button Text"
              value={value as string}
              onChange={onChange}
              elementId={id}
              fieldName="secondaryButtonText"
              fieldType="text"
              placeholder="Enter secondary button text"
            />
          ),
        },
        imageSrc: {
          type: "text",
          label: "Image URL",
        },
      },
      render: (props: HeroSectionProps) => <HeroSectionOne {...props} />,
      defaultProps: {
        navbarBrand: "Your Brand",
        navbarButtonText: "Login",
        title: "Your Amazing Title Here",
        description: "Your description goes here. This is a sample description that you can edit.",
        primaryButtonText: "Get Started",
        secondaryButtonText: "Learn More",
        imageSrc: "https://via.placeholder.com/800x600/4f46e5/ffffff?text=Your+Image",
      },
    },
    FeaturesSection: {
      fields: {
        features: {
          type: "array",
          label: "Features",
          arrayFields: {
            title: { type: "text", label: "Feature Title" },
            description: { type: "textarea", label: "Feature Description" },
          },
          defaultItemProps: {
            title: "Feature Title",
            description: "Feature description goes here.",
          },
        },
      },
      render: (props: FeaturesSectionProps) => <FeaturesSection {...props} />,
      defaultProps: {
        features: [
          {
            id: "1",
            title: "Easy to Use",
            description: "Simple and intuitive interface for everyone.",
          },
          {
            id: "2",
            title: "Fast Performance",
            description: "Optimized for speed and efficiency.",
          },
          {
            id: "3",
            title: "Secure",
            description: "Built with security best practices in mind.",
          },
        ],
      },
    },
  },
};
