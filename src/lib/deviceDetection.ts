/**
 * Detects low-end devices and redirects to lite mode.
 * Call this BEFORE mounting React.
 */

interface DeviceCapabilities {
  isLowEnd: boolean;
  deviceMemory: number | null;
  hardwareConcurrency: number;
  isSmartTV: boolean;
  isOldAndroid: boolean;
}

export function detectDevice(): DeviceCapabilities {
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  const ua = navigator.userAgent || '';

  const deviceMemory: number | null = nav.deviceMemory ?? null;
  const hardwareConcurrency: number = nav.hardwareConcurrency ?? 2;

  const isSmartTV = /smart[-\s]?tv|hbbtv|netcast|viera|nettv|philipstv|samsungbrowser.*tv|lg\s?browser|webos|tizen/i.test(ua);
  const isOldAndroid = /Android\s[4-9]/i.test(ua) && !/Chrome\/[8-9]\d|Chrome\/1[0-9]\d/i.test(ua);

  const isLowEnd =
    (deviceMemory !== null && deviceMemory <= 1) ||
    hardwareConcurrency <= 2 ||
    isSmartTV ||
    isOldAndroid;

  return { isLowEnd, deviceMemory, hardwareConcurrency, isSmartTV, isOldAndroid };
}

export function shouldRedirectToLite(): boolean {
  // Allow override via URL param
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'full') return false;
  if (params.get('mode') === 'lite') return true;

  // Already on lite page
  if (window.location.pathname === '/tv-lite' || window.location.pathname === '/tv-lite.html') return false;

  const device = detectDevice();
  return device.isLowEnd;
}

/**
 * Auto-redirect low-end devices. Call in main.tsx before React mount.
 * Returns true if redirect happened (don't mount React).
 */
export function autoRedirectLite(): boolean {
  if (shouldRedirectToLite()) {
    window.location.replace('/tv-lite.html');
    return true;
  }
  return false;
}
