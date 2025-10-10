import { useState, useEffect } from 'react';

export interface IconService {
  id: string;
  name: string;
  category: string;
  iconPath: string;
  originalPath: string;
  fileSize: number;
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
        const response = await fetch('/icons-manifest.json');

        if (!response.ok) {
          throw new Error('Icons manifest not found. Run `npm run icons:generate` first.');
        }

        const data: IconsManifest = await response.json();
        setManifest(data);
        setError(null);
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

  return {
    manifest,
    loading,
    error,
    services: manifest.services,
    categories: getCategories(),
    getServicesByCategory,
    searchServices,
  };
};
