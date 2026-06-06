/**
 * Utility to monitor sheet changes in SocialCalc and update the React context
 */

declare global {
  interface Window {
    SocialCalc: any;
  }
}

export class SheetChangeMonitor {
  private static isInitialized = false;
  private static updateSheetIdCallback: ((sheetId: string) => void) | null =
    null;
  private static intervalId: NodeJS.Timeout | null = null;
  private static lastKnownSheetId: string | null = null;

  /**
   * Initialize the sheet change monitor
   * @param updateSheetId Callback to update the current sheet ID in React context
   */
  static initialize(updateSheetId: (sheetId: string) => void) {
    if (this.isInitialized) {
      return;
    }

    this.updateSheetIdCallback = updateSheetId;
    this.startMonitoring();
    this.isInitialized = true;
  }

  /**
   * Start monitoring for sheet changes
   */
  private static startMonitoring() {
    // Poll for sheet changes every 500ms
    this.intervalId = setInterval(() => {
      this.checkCurrentSheet();
    }, 500);
  }

  /**
   * Check the current sheet and update if it has changed
   */
  private static checkCurrentSheet() {
    try {
      if (typeof window === "undefined" || !window.SocialCalc) {
        return;
      }

      const SocialCalc = window.SocialCalc;
      const control =
        SocialCalc.GetCurrentWorkBookControl &&
        SocialCalc.GetCurrentWorkBookControl();

      if (!control || !control.currentSheetButton) {
        return;
      }

      const currentSheetId = control.currentSheetButton.id;

      // If sheet has changed, update the context
      if (currentSheetId !== this.lastKnownSheetId) {
        this.lastKnownSheetId = currentSheetId;
        if (this.updateSheetIdCallback) {
          this.updateSheetIdCallback(currentSheetId);
        }
      }
    } catch (error) {
      // Silently handle errors to avoid console spam
    }
  }

  /**
   * Get the current sheet ID directly from SocialCalc
   * @returns Current sheet ID or null if not available
   */
  static getCurrentSheetId(): string | null {
    try {
      if (typeof window === "undefined" || !window.SocialCalc) {
        return null;
      }

      const SocialCalc = window.SocialCalc;
      const control =
        SocialCalc.GetCurrentWorkBookControl &&
        SocialCalc.GetCurrentWorkBookControl();

      if (!control || !control.currentSheetButton) {
        return null;
      }

      return control.currentSheetButton.id;
    } catch (error) {
      return null;
    }
  }

  /**
   * Stop monitoring sheet changes
   */
  static cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isInitialized = false;
    this.updateSheetIdCallback = null;
    this.lastKnownSheetId = null;
  }

  /**
   * Force a manual check of the current sheet
   */
  static forceCheck() {
    this.checkCurrentSheet();
  }
}
