'use client';

import { useState, useEffect } from 'react';

export type AspectRatioCategory = 'portrait' | 'standard' | 'wide' | 'ultrawide' | 'superultrawide';
export type DeviceCategory = 'phone' | 'tablet' | 'desktop' | 'largedesktop';

interface ViewportInfo {
  width: number;
  height: number;
  aspectRatio: number;
  aspectCategory: AspectRatioCategory;
  deviceCategory: DeviceCategory;
  isPortrait: boolean;
  isLandscape: boolean;
  isUltrawide: boolean;
  isMobile: boolean;
  isTablet: boolean;
}

function getAspectCategory(ratio: number): AspectRatioCategory {
  // Portrait: < 1:1 (e.g., phones in portrait, tablets in portrait)
  if (ratio < 1) return 'portrait';
  // Standard: 1:1 to 16:10 (1.0 to 1.6)
  if (ratio < 1.6) return 'standard';
  // Wide: 16:10 to 16:9 (1.6 to 1.78)
  if (ratio < 1.9) return 'wide';
  // Ultrawide: 21:9 range (2.33)
  if (ratio < 2.8) return 'ultrawide';
  // Super ultrawide: 32:9 and beyond (3.56+)
  return 'superultrawide';
}

function getDeviceCategory(width: number): DeviceCategory {
  if (width < 640) return 'phone';
  if (width < 1024) return 'tablet';
  if (width < 1920) return 'desktop';
  return 'largedesktop';
}

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    // Default values for SSR
    return {
      width: 1920,
      height: 1080,
      aspectRatio: 16 / 9,
      aspectCategory: 'wide',
      deviceCategory: 'desktop',
      isPortrait: false,
      isLandscape: true,
      isUltrawide: false,
      isMobile: false,
      isTablet: false,
    };
  });

  useEffect(() => {
    function updateViewport() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const aspectCategory = getAspectCategory(aspectRatio);
      const deviceCategory = getDeviceCategory(width);

      setViewport({
        width,
        height,
        aspectRatio,
        aspectCategory,
        deviceCategory,
        isPortrait: aspectRatio < 1,
        isLandscape: aspectRatio >= 1,
        isUltrawide: aspectCategory === 'ultrawide' || aspectCategory === 'superultrawide',
        isMobile: deviceCategory === 'phone',
        isTablet: deviceCategory === 'tablet',
      });
    }

    // Initial update
    updateViewport();

    // Listen for resize events
    window.addEventListener('resize', updateViewport);

    // Also listen for orientation changes on mobile
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
}
