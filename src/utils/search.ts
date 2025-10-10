import type { IconService } from '../hooks/useIconsManifest';

/**
 * Calculate similarity score between query and text
 * Higher score = better match
 */
function calculateSimilarity(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 90;

  // Contains exact query
  if (lowerText.includes(lowerQuery)) return 80;

  // Word boundary match (e.g., "S3" matches "Amazon S3")
  const words = lowerText.split(/[\s-_]+/);
  for (const word of words) {
    if (word === lowerQuery) return 85;
    if (word.startsWith(lowerQuery)) return 75;
  }

  // Fuzzy match - check if all query characters appear in order
  let textIndex = 0;
  for (const char of lowerQuery) {
    textIndex = lowerText.indexOf(char, textIndex);
    if (textIndex === -1) return 0;
    textIndex++;
  }

  // All characters found in sequence
  const score = 60 - (lowerText.length - lowerQuery.length) * 2;
  return Math.max(score, 10);
}

/**
 * Search services with improved fuzzy matching
 */
export function searchServices(services: IconService[], query: string): IconService[] {
  if (!query || query.trim().length === 0) {
    return services;
  }

  const trimmedQuery = query.trim();
  const results: Array<{ service: IconService; score: number }> = [];

  for (const service of services) {
    // Search in service name
    const nameScore = calculateSimilarity(trimmedQuery, service.name);

    // Search in category
    const categoryScore = calculateSimilarity(trimmedQuery, service.category) * 0.7;

    // Search in ID (e.g., "ec2", "s3")
    const idScore = calculateSimilarity(trimmedQuery, service.id) * 0.9;

    // Take the best score
    const bestScore = Math.max(nameScore, categoryScore, idScore);

    if (bestScore > 0) {
      results.push({ service, score: bestScore });
    }
  }

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);

  return results.map(r => r.service);
}

/**
 * Filter services by category
 */
export function filterByCategory(services: IconService[], category: string): IconService[] {
  if (category === 'All') {
    return services;
  }
  return services.filter(s => s.category === category);
}

/**
 * Highlight matching text in search results
 */
export function highlightMatch(text: string, query: string): string {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
