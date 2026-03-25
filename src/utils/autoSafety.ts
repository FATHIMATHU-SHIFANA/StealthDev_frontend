import { SecurityManager } from './security';

export class AutoSafetyManager {
  private static instance: AutoSafetyManager;
  private isBackground = false;
  private safetyTimeout: number | null = null;

  private constructor() {}

  static getInstance(): AutoSafetyManager {
    if (!AutoSafetyManager.instance) {
      AutoSafetyManager.instance = new AutoSafetyManager();
    }
    return AutoSafetyManager.instance;
  }

  initialize(): void {
    this.setupAppStateListener();
    this.setupScreenBlurDetection();
  }

  private setupAppStateListener(): void {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.isBackground = true;
        this.activateSafetyMode();
      } else {
        this.isBackground = false;
        this.handleAppActive();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also handle page unload
    window.addEventListener('beforeunload', () => {
      this.activateSafetyMode();
    });
  }

  private setupScreenBlurDetection(): void {
    // In a real implementation, you would integrate with device-specific APIs
    // For web, we'll use basic detection methods
    
    console.log('Screen blur detection initialized');
  }

  private activateSafetyMode(): void {
    // Immediately activate panic mode when app goes to background
    SecurityManager.setPanicMode(true);
    SecurityManager.setPrivateMode(false);
    
    console.log('Auto safety: Panic mode activated due to app backgrounding');
  }

  private handleAppActive(): void {
    // When app becomes active again, keep panic mode for a grace period
    // This prevents accidental exposure when quickly switching apps
    this.safetyTimeout = window.setTimeout(() => {
      if (!this.isBackground) {
        console.log('Auto safety: Grace period ended, user can manually exit panic mode');
      }
    }, 2000); // 2 second grace period
  }

  // Method to manually trigger safety checks
  performSafetyCheck(): boolean {
    const checks = [
      this.checkAppBackground(),
      this.checkScreenRecording(),
      this.checkScreenshotAttempt(),
      this.checkUnusualActivity(),
    ];

    const hasRisk = checks.some(check => check);
    
    if (hasRisk) {
      this.activateSafetyMode();
    }
    
    return hasRisk;
  }

  private checkAppBackground(): boolean {
    return this.isBackground;
  }

  private checkScreenRecording(): boolean {
    // In a real implementation, this would detect screen recording
    // For now, return false (no recording detected)
    return false;
  }

  private checkScreenshotAttempt(): boolean {
    // In a real implementation, this would detect screenshots
    // For now, return false (no screenshot detected)
    return false;
  }

  private checkUnusualActivity(): boolean {
    // Check for rapid app switching, unusual user behavior, etc.
    // For now, return false (no unusual activity)
    return false;
  }

  // Emergency methods
  async emergencyWipe(): Promise<void> {
    try {
      console.log('Emergency wipe initiated');
      
      // Clear all sensitive data
      SecurityManager.clearAllData();
      
      // Activate panic mode
      SecurityManager.setPanicMode(true);
      
      console.log('Emergency wipe completed');
    } catch (error) {
      console.error('Emergency wipe failed:', error);
    }
  }

  // Cleanup
  destroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', () => {});
    
    if (this.safetyTimeout) {
      window.clearTimeout(this.safetyTimeout);
    }
  }

  private handleVisibilityChange: () => void = () => {};
}

// Singleton instance for easy access
export const autoSafety = AutoSafetyManager.getInstance();

// React hook for using auto safety features
import { useState, useEffect } from 'react';

export const useAutoSafety = () => {
  const [isSafetyMode, setIsSafetyMode] = useState(false);

  useEffect(() => {
    const initializeSafety = () => {
      autoSafety.initialize();
      
      // Check current safety state
      const panicMode = SecurityManager.getPanicMode();
      setIsSafetyMode(panicMode);
    };

    initializeSafety();

    return () => {
      autoSafety.destroy();
    };
  }, []);

  const triggerSafetyCheck = () => {
    const hasRisk = autoSafety.performSafetyCheck();
    setIsSafetyMode(hasRisk);
    return hasRisk;
  };

  const emergencyWipe = async () => {
    await autoSafety.emergencyWipe();
    setIsSafetyMode(true);
  };

  return {
    isSafetyMode,
    triggerSafetyCheck,
    emergencyWipe,
  };
};
