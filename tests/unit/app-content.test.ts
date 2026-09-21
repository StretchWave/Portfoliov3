import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defaultAppContent } from "@/data/app-content";
import { profile } from "@/data/profile";
import { SITE_CONFIG } from "@/lib/site-config";
import { validateAppContent } from "@/lib/scene-validation";
import { serializeAppContent } from "@/lib/scene-serializer";
import type { AppContent } from "@/types/content";

describe("App Content Authoring & Canonical Sourcing", () => {
  it("provides canonical defaultAppContent matching site structure", () => {
    assert.ok(defaultAppContent.identity.author);
    assert.ok(defaultAppContent.identity.siteName);
    assert.ok(defaultAppContent.identity.browserTitle);
    assert.ok(defaultAppContent.hero.headline);
    assert.ok(defaultAppContent.about.paragraphs.length > 0);
    assert.ok(defaultAppContent.careerDirections.length > 0);
    assert.ok(defaultAppContent.seo.title);
  });

  it("ensures profile.ts is derived directly from canonical defaultAppContent", () => {
    assert.equal(profile.name, defaultAppContent.identity.author);
    assert.equal(profile.roleEyebrow, defaultAppContent.identity.roleEyebrow);
    assert.equal(profile.introShort, defaultAppContent.hero.shortDescription);
    assert.deepEqual(profile.introLong, defaultAppContent.about.paragraphs);
    assert.deepEqual(profile.careerDirections, defaultAppContent.careerDirections);
  });

  it("ensures SITE_CONFIG is derived directly from canonical defaultAppContent", () => {
    assert.equal(SITE_CONFIG.name, defaultAppContent.identity.siteName);
    assert.equal(SITE_CONFIG.author, defaultAppContent.identity.author);
    assert.equal(SITE_CONFIG.title, defaultAppContent.identity.browserTitle);
    assert.equal(SITE_CONFIG.description, defaultAppContent.identity.description);
    assert.equal(SITE_CONFIG.github, defaultAppContent.social.github);
  });

  it("validates app content and catches missing required identity fields", () => {
    const invalidContent: AppContent = {
      ...defaultAppContent,
      identity: {
        siteName: "",
        author: "",
        browserTitle: "",
        description: "",
      },
    };

    const res = validateAppContent(invalidContent);
    assert.equal(res.valid, false);
    assert.ok(res.errors.some((e) => e.field === "identity.siteName"));
    assert.ok(res.errors.some((e) => e.field === "identity.author"));
    assert.ok(res.errors.some((e) => e.field === "identity.browserTitle"));
  });

  it("warns on malformed external URLs in app content", () => {
    const contentWithBadUrl: AppContent = {
      ...defaultAppContent,
      social: {
        ...defaultAppContent.social,
        github: "not-a-valid-url-at-all",
      },
    };

    const res = validateAppContent(contentWithBadUrl);
    const warnings = res.errors.filter((e) => e.severity === "warning");
    assert.ok(warnings.some((w) => w.code === "INVALID_URL"));
  });

  it("serializes AppContent into valid TypeScript source code", () => {
    const serialized = serializeAppContent(defaultAppContent);
    assert.ok(serialized.includes('import type { AppContent } from "@/types/content";'));
    assert.ok(serialized.includes("export const defaultAppContent: AppContent ="));
    assert.ok(serialized.includes(defaultAppContent.identity.author));
  });
});
