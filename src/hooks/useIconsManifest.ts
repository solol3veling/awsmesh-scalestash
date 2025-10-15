import { useState, useEffect } from 'react';
import { initIconCache, preloadIcons, clearExpiredCache } from '../utils/iconCache';

export interface IconVariant {
  size: number;
  iconPath: string;
  originalPath: string;
  fileSize: number;
  format: string;
}

export interface IconService {
  id: string;
  name: string;
  category: string;
  sizes: Record<number, IconVariant[]>; // e.g., { 16: [...], 32: [...], 64: [...] }
}

export interface IconsManifest {
  version: string;
  generatedAt: string;
  totalIcons: number;
  categories: string[];
  services: IconService[];
}

const DEFAULT_MANIFEST: IconsManifest = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  totalIcons: 0,
  categories: [],
  services: [],
};

export const useIconsManifest = () => {
  const [manifest, setManifest] = useState<IconsManifest>(DEFAULT_MANIFEST);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadManifest = async () => {
      try {
        setLoading(true);

        // Initialize icon cache
        await initIconCache();

        // Clear expired cache entries
        clearExpiredCache().catch(console.warn);

        const response = await fetch('/icons-manifest.json');

        if (!response.ok) {
          throw new Error('Icons manifest not found. Run `npm run icons:generate` first.');
        }

        const data: IconsManifest = await response.json();
        setManifest(data);
        setError(null);

        // Preload commonly used icons in the background
        setTimeout(() => {
          const iconPaths = data.services
            .slice(0, 50) // Preload first 50 services
            .flatMap(service => {
              const paths: string[] = [];
              // Get 64px icons (for sidebar)
              if (service.sizes[64]) {
                const icon = service.sizes[64].find(v => v.format === 'svg') || service.sizes[64][0];
                if (icon) paths.push(icon.iconPath);
              }
              return paths;
            });

          preloadIcons(iconPaths).catch(console.warn);
        }, 1000); // Delay preloading to not block initial render
      } catch (err) {
        console.error('Error loading icons manifest:', err);
        setError(err instanceof Error ? err.message : 'Failed to load icons');
        setManifest(DEFAULT_MANIFEST);
      } finally {
        setLoading(false);
      }
    };

    loadManifest();
  }, []);

  const getServicesByCategory = (category: string): IconService[] => {
    if (category === 'All') {
      return manifest.services;
    }
    return manifest.services.filter(s => s.category === category);
  };

  const searchServices = (query: string): IconService[] => {
    const lowerQuery = query.toLowerCase();
    return manifest.services.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.category.toLowerCase().includes(lowerQuery)
    );
  };

  const getCategories = (): string[] => {
    return ['All', ...manifest.categories];
  };

  // Get icon for a specific size (prefer SVG over PNG)
  const getIconForSize = (service: IconService, size: number): string | null => {
    const variants = service.sizes[size];
    if (!variants || variants.length === 0) return null;

    // Prefer SVG format
    const svg = variants.find(v => v.format === 'svg');
    return svg ? svg.iconPath : variants[0].iconPath;
  };

  // Get icon for sidebar (prefer 64px)
  const getSmallIcon = (service: IconService): string | null => {
    // Try 64px first
    if (service.sizes[64]) {
      return getIconForSize(service, 64);
    }
    // Fallback to largest available
    const sizes = Object.keys(service.sizes).map(Number).sort((a, b) => b - a);
    return sizes.length > 0 ? getIconForSize(service, sizes[0]) : null;
  };

  // Get larger icon (for canvas - prefer 32px or 48px)
  const getLargeIcon = (service: IconService): string | null => {
    // Try 32px, 48px, 64px in order
    for (const size of [32, 48, 64]) {
      const icon = getIconForSize(service, size);
      if (icon) return icon;
    }
    // Fallback to largest available
    const sizes = Object.keys(service.sizes).map(Number).sort((a, b) => b - a);
    return sizes.length > 0 ? getIconForSize(service, sizes[0]) : null;
  };

  return {
    manifest,
    loading,
    error,
    services: manifest.services,
    categories: getCategories(),
    getServicesByCategory,
    searchServices,
    getIconForSize,
    getSmallIcon,
    getLargeIcon,
  };
};
