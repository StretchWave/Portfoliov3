type CameraSettingsListener = () => void;

class CameraSettingsManager {
  private fov: number = 60;
  private flightMode: boolean = false;
  private currentAltitude: number = 1.7;
  private listeners: Set<CameraSettingsListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const storedFov = localStorage.getItem("atlas-camera-fov");
      if (storedFov) {
        const parsed = parseFloat(storedFov);
        if (!isNaN(parsed) && parsed >= 50 && parsed <= 105) {
          this.fov = parsed;
        }
      }
    }
  }

  public getFov(): number {
    return this.fov;
  }

  public setFov(fov: number): void {
    const clamped = Math.max(50, Math.min(105, fov));
    if (this.fov !== clamped) {
      this.fov = clamped;
      if (typeof window !== "undefined") {
        localStorage.setItem("atlas-camera-fov", String(clamped));
      }
      this.notify();
    }
  }

  public adjustFov(delta: number): void {
    this.setFov(this.fov + delta);
  }

  public isFlightMode(): boolean {
    return this.flightMode;
  }

  public setFlightMode(enabled: boolean): void {
    if (this.flightMode !== enabled) {
      this.flightMode = enabled;
      this.notify();
    }
  }

  public toggleFlightMode(): boolean {
    this.flightMode = !this.flightMode;
    this.notify();
    return this.flightMode;
  }

  public getAltitude(): number {
    return this.currentAltitude;
  }

  public setAltitude(alt: number): void {
    if (Math.abs(this.currentAltitude - alt) > 0.05) {
      this.currentAltitude = alt;
      this.notify();
    }
  }

  public subscribe(listener: CameraSettingsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

export const cameraSettings = new CameraSettingsManager();
