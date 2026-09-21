/**
 * Canonical App Content Data Model for Project Atlas.
 *
 * This vocabulary is framework-independent and represents all editable
 * application-level content (site identity, hero, about paragraphs, career
 * directions, interactive landing, SEO metadata, and social channels).
 */

export interface CareerDirectionContent {
  title: string;
  description: string;
}

export interface SocialLinkContent {
  label: string;
  href: string;
}

export interface AppContent {
  identity: {
    siteName: string;
    author: string;
    browserTitle: string;
    description: string;
    roleEyebrow: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    shortDescription: string;
    primaryAction: {
      label: string;
      href: string;
    };
    secondaryAction: {
      label: string;
      href: string;
    };
    githubLink: {
      label: string;
      href: string;
    };
  };
  about: {
    title: string;
    paragraphs: string[];
  };
  careerDirections: CareerDirectionContent[];
  interactiveExperience: {
    title: string;
    description: string;
    launchLabel: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    openGraphTitle: string;
    openGraphDescription: string;
  };
  social: {
    github: string;
    linkedin?: string;
    email?: string;
    resume?: string;
  };
}
