import { useState, useEffect } from 'react';
import { getCachedIcon } from '../utils/iconCache';

/**
 * Hook to use cached icons with automatic cleanup
 */
export const useCachedIcon = (iconPath: string | null): string | null => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!iconPath) {
      setCachedUrl(null);
      return;
    }

    let isMounted = true;
    let blobUrl: string | null = null;

    const loadIcon = async () => {
      try {
        const url = await getCachedIcon(iconPath);
        if (isMounted) {
          blobUrl = url;
          setCachedUrl(url);
        }
      } catch (error) {
        console.warn('Error loading cached icon:', error);
        if (isMounted) {
          setCachedUrl(iconPath); // Fallback to original path
        }
      }
    };

    loadIcon();

    // Cleanup blob URL on unmount
    return () => {
      isMounted = false;
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [iconPath]);

  return cachedUrl;
};
