// puck/config.tsx
"use client";

import { Config } from "@measured/puck";
import { HeroSectionOne } from "@/app/Components/HeroSection";
import { FeaturesSection } from "@/app/Components/FeatureSection";
import { EnhancedTextField, EnhancedTextAreaField } from "@/app/Components/puck/AIFieldEnhancements";

interface HeroSectionOneProps {
  navbarBrand: string;
  navbarButtonText: string;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  imageSrc: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

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
          type: "custom",
          render: ({ onChange, value, id }) => (
            <EnhancedTextField
              label="Image URL"
              value={value as string}
              onChange={onChange}
              elementId={id}
              fieldName="imageSrc"
              fieldType="text"
              placeholder="Enter image URL"
            />
          ),
        },
      },
      defaultProps: {
        navbarBrand: "Your Brand",
        navbarButtonText: "Login",
        title: "Your Amazing Title Here",
        description: "Your description goes here. This is a sample description that you can edit.",
        primaryButtonText: "Get Started",
        secondaryButtonText: "Learn More",
        imageSrc: "https://via.placeholder.com/800x600/4f46e5/ffffff?text=Your+Image",
      },
      render: (props: HeroSectionOneProps) => <HeroSectionOne {...props} />,
    },

    FeaturesSection: {
      fields: {
        features: {
          type: "array",
          label: "Features",
          arrayFields: {
            id: { type: "text", label: "Feature ID" },
            title: {
              type: "custom",
              render: ({ onChange, value, id }) => (
                <EnhancedTextField
                  label="Feature Title"
                  value={value as string}
                  onChange={onChange}
                  elementId={id}
                  fieldName="title"
                  fieldType="title"
                  placeholder="Enter feature title"
                />
              ),
            },
            description: {
              type: "custom",
              render: ({ onChange, value, id }) => (
                <EnhancedTextAreaField
                  label="Feature Description"
                  value={value as string}
                  onChange={onChange}
                  elementId={id}
                  fieldName="description"
                  fieldType="description"
                  placeholder="Enter feature description"
                  rows={2}
                />
              ),
            },
          },
        },
      },
      defaultProps: {
        features: [
          { id: "feature-1", title: "Built for developers", description: "Built for engineers, developers, dreamers, thinkers and doers." },
          { id: "feature-2", title: "Ease of use", description: "It's as easy as using an Apple, and as expensive as buying one." },
          { id: "feature-3", title: "Pricing like no other", description: "Our prices are best in the market. No cap, no lock, no credit card required." },
          { id: "feature-4", title: "100% Uptime guarantee", description: "We just cannot be taken down by anyone." },
          { id: "feature-5", title: "Multi-tenant Architecture", description: "You can simply share passwords instead of buying new seats" },
          { id: "feature-6", title: "24/7 Customer Support", description: "We are available 100% of the time. At least our AI Agents are." },
          { id: "feature-7", title: "Money back guarantee", description: "If you don't like EveryAI, we will convince you to like us." },
          { id: "feature-8", title: "And everything else", description: "I just ran out of copy ideas. Accept my sincere apologies" },
        ],
      },
      render: (props: FeaturesSectionProps) => <FeaturesSection {...props} />,
    },
  },
};
