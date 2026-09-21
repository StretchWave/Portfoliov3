import type { PortfolioProfile, ProjectLink } from "@/types/portfolio";
import { defaultAppContent } from "@/data/app-content";

/**
 * Single source of truth for the owner's professional profile. Only facts
 * that are verified (or supplied by the owner) belong here. Links must be
 * real; unknown channels (LinkedIn, email, resume) stay absent until supplied.
 *
 * Derived canonically from defaultAppContent, editable via Atlas Studio (/studio).
 */
const dynamicLinks: ProjectLink[] = [];
if (defaultAppContent.social.github) {
  dynamicLinks.push({ label: "GitHub profile", href: defaultAppContent.social.github });
}
if (defaultAppContent.social.linkedin) {
  dynamicLinks.push({ label: "LinkedIn profile", href: defaultAppContent.social.linkedin });
}
if (defaultAppContent.social.resume) {
  dynamicLinks.push({ label: "Resume", href: defaultAppContent.social.resume });
}

export const profile: PortfolioProfile = {
  name: defaultAppContent.identity.author,
  title: defaultAppContent.identity.description,
  roleEyebrow: defaultAppContent.identity.roleEyebrow,
  introShort: defaultAppContent.hero.shortDescription,
  introLong: defaultAppContent.about.paragraphs,
  careerDirections: defaultAppContent.careerDirections,
  links: dynamicLinks,
};