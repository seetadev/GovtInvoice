import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export type StatusBarStyle = 'light' | 'dark';

interface StatusBarConfig {
    style: StatusBarStyle;
    overlaysWebView?: boolean;
}

/**
 * Hook to configure the status bar appearance for a specific page
 * @param config - Configuration for status bar (style, overlaysWebView)
 * 
 * style: 'light' = dark text/icons on light background
 * style: 'dark' = light text/icons on dark background
 * overlaysWebView: true = edge-to-edge mode (status bar overlays content)
 */
export function useStatusBar(config: StatusBarConfig) {
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            const configureStatusBar = async () => {
                try {
                    // Set overlay mode for edge-to-edge display
                    await StatusBar.setOverlaysWebView({
                        overlay: config.overlaysWebView ?? true
                    });

                    await StatusBar.setStyle({
                        style: config.style === 'light' ? Style.Light : Style.Dark
                    });

                    // Note: StatusBar.setBackgroundColor is no longer called here.
                    // It triggers the deprecated Window.setStatusBarColor on Android 15 (SDK 35).
                    // Edge-to-edge transparency is handled natively by EdgeToEdge.enable().
                    // For non-overlay mode, the WebView background provides the visual bar color.
                } catch (error) {
                    console.warn('[StatusBar] Configuration failed:', error);
                }
            };

            configureStatusBar();
        }
    }, [config.style, config.overlaysWebView]);
}

/**
 * Initialize edge-to-edge status bar on app startup
 */
export async function initializeEdgeToEdgeStatusBar() {
    if (Capacitor.isNativePlatform()) {
        try {
            await StatusBar.setOverlaysWebView({ overlay: true });
            await StatusBar.setStyle({ style: Style.Light });
            // Note: StatusBar.setBackgroundColor removed - it calls the deprecated
            // Window.setStatusBarColor API flagged on Android 15 (SDK 35).
            // Edge-to-edge transparency is now handled natively by EdgeToEdge.enable()
            // in MainActivity.java, which is backward compatible.
        } catch (error) {
            console.warn('[StatusBar] Edge-to-edge initialization failed:', error);
        }
    }
}

/**
 * Preset configurations for common use cases
 */
export const StatusBarPresets = {
    // Light header (Dashboard pages) - transparent overlay with dark icons
    light: {
        style: 'light' as StatusBarStyle,
        overlaysWebView: true,
    },
    // Primary/Blue header (Invoice editor) - transparent overlay with light icons
    primary: {
        style: 'dark' as StatusBarStyle,
        overlaysWebView: true,
    },
    // Dark header - transparent overlay with light icons
    dark: {
        style: 'dark' as StatusBarStyle,
        overlaysWebView: true,
    },
    // Solid background (non-edge-to-edge) - for specific screens
    solidLight: {
        style: 'light' as StatusBarStyle,
        overlaysWebView: false,
    },
    solidPrimary: {
        style: 'dark' as StatusBarStyle,
        overlaysWebView: false,
    },
    solidDark: {
        style: 'dark' as StatusBarStyle,
        overlaysWebView: false,
    },
};
