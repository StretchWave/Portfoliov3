"use client";

export type HapticStyle = "light" | "medium" | "heavy" | "success" | "warning";

const HAPTIC_PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 24,
  heavy: 45,
  success: [15, 35, 20],
  warning: [30, 45, 30],
};

class HapticFeedbackManager {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      this.isSupported = "vibrate" in navigator && typeof navigator.vibrate === "function";
      try {
        const stored = localStorage.getItem("atlas-haptics-enabled");
        if (stored !== null) {
          this.isEnabled = stored === "true";
        }
      } catch {
        // Ignore localStorage restrictions
      }
    }
  }

  public trigger(style: HapticStyle = "light"): boolean {
    if (!this.isSupported || !this.isEnabled) return false;

    try {
      const pattern = HAPTIC_PATTERNS[style];
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem("atlas-haptics-enabled", String(enabled));
    } catch {
      // Ignore localStorage restrictions
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public hasHardwareSupport(): boolean {
    return this.isSupported;
  }
}

export const hapticManager = new HapticFeedbackManager();
