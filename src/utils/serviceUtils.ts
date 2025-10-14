/**
 * Utility functions for AWS service ID conversion and icon resolution
 */

export interface AWSService {
  id: string;
  name: string;
  category: string;
  sizes: {
    [key: number]: Array<{
      size: number;
      iconPath: string;
      originalPath?: string;
      fileSize?: number;
      format?: string;
    }>;
  };
}

/**
 * Convert service name to uniform format: arch::other::service-name
 * ALL services use "other" as the category (from manifest)
 */
export const getUniformServiceId = (service: AWSService): string => {
  const prefix = service.name.match(/^(Arch|Res)\s+/i)?.[1].toLowerCase() || 'arch';
  const category = service.category.toLowerCase().replace(/\s+/g, '-');
  const serviceName = service.name
    .replace(/^(Arch|Res)\s+/i, '')
    .replace(/\s+(Other)$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .trim();
  return `${prefix}::${category}::${serviceName}`;
};

/**
 * Get large icon (64px) for a service
 */
export const getLargeIconPath = (service: AWSService): string => {
  const largeIcons = service.sizes[64] || service.sizes[48] || service.sizes[32];
  if (!largeIcons || largeIcons.length === 0) return '';

  const svgIcon = largeIcons.find(icon => icon.format === 'svg');
  return svgIcon?.iconPath || largeIcons[0].iconPath || '';
};

/**
 * Get small icon (16px) for a service
 */
export const getSmallIconPath = (service: AWSService): string => {
  const smallIcons = service.sizes[16];
  if (!smallIcons || smallIcons.length === 0) return '';

  const svgIcon = smallIcons.find(icon => icon.format === 'svg');
  return svgIcon?.iconPath || smallIcons[0].iconPath || '';
};

/**
 * Create icon resolver function to look up icons based on service ID
 */
export const createIconResolver = (
  services: any[],  // Use any[] to be compatible with IconService from useIconsManifest
  getLargeIcon: (service: any) => string | null
) => {
  return (serviceId: string): string | null => {
    // Find matching service by uniform service ID
    const matchingService = services.find(s => {
      const uniformId = getUniformServiceId(s);
      return uniformId === serviceId;
    });

    if (matchingService) {
      return getLargeIcon(matchingService);
    }

    console.warn(`Could not find icon for service: ${serviceId}`);
    return null;
  };
};
