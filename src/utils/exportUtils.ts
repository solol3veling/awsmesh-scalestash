import type { Node, Edge } from 'reactflow';
import { toPng } from 'html-to-image';

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
  dsl?: string;
  timestamp?: string;
  version?: string;
}

// Simple format for AI diagram generation
export interface SimpleDiagramNode {
  id?: string;
  service: string;
  position: { x: number; y: number };
  label: string;
}

export interface SimpleDiagramConnection {
  source: number | string;
  target: number | string;
  label?: string;
}

export interface SimpleDiagramData {
  nodes: SimpleDiagramNode[];
  connections: SimpleDiagramConnection[];
}

/**
 * Export diagram as PNG image
 * @param elementId - ID of the diagram canvas
 * @param filename - Name for the exported file
 * @param backgroundType - 'canvas' keeps the dots background, 'solid' uses theme-based solid color
 * @param theme - Current theme for solid background color
 */
export const exportAsPNG = async (
  elementId: string,
  filename: string = 'aws-diagram',
  backgroundType: 'canvas' | 'solid' = 'solid',
  theme: 'light' | 'dark' = 'light'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Canvas element not found');
  }

  try {
    // Get the React Flow wrapper (contains everything)
    const reactFlow = element.querySelector('.react-flow') as HTMLElement;
    if (!reactFlow) {
      throw new Error('React Flow element not found');
    }

    // Determine background color
    const backgroundColor = backgroundType === 'solid'
      ? (theme === 'dark' ? '#1a252f' : '#ffffff')
      : (theme === 'dark' ? '#1a252f' : '#f9fafb');

    // Configure export options
    const exportOptions: any = {
      backgroundColor,
      cacheBust: true,
      pixelRatio: 2,
      quality: 1.0,
      filter: (node: any) => {
        // Check if node is an HTML element
        if (!(node instanceof HTMLElement)) {
          return true;
        }

        // Exclude React Flow UI controls
        if (node.classList) {
          const classes = Array.from(node.classList);

          // Always exclude these UI elements
          const excludeClasses = [
            'react-flow__controls',
            'react-flow__minimap',
            'react-flow__attribution',
            'react-flow__panel'
          ];

          if (excludeClasses.some(cls => classes.includes(cls))) {
            return false;
          }

          // For solid background, exclude the background pattern
          if (backgroundType === 'solid' && classes.includes('react-flow__background')) {
            return false;
          }
        }

        // Exclude any buttons (fit-view button, etc.)
        if (node.tagName === 'BUTTON') {
          return false;
        }

        return true;
      },
    };

    // Export the React Flow canvas
    const dataUrl = await toPng(reactFlow, exportOptions);

    // Trigger download
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw error;
  }
};

/**
 * Convert ReactFlow node to simple service ID format
 * Always uses arch::other::service-name format
 */
const getServiceIdFromNode = (node: Node): string => {
  // Handle special node types
  if (node.type === 'groupNode') {
    return 'group';
  }
  if (node.type === 'noteNode') {
    return 'note';
  }

  // If the node has service data, try to extract it
  if (node.data.service) {
    // Check if it's already in the format "arch::other::service-name"
    if (node.data.service.includes('::')) {
      return node.data.service;
    }

    // Otherwise, construct it - always use "other" as category
    const serviceName = node.data.service.toLowerCase().replace(/\s+/g, '-');
    return `arch::other::${serviceName}`;
  }

  return 'arch::other::unknown';
};

/**
 * Export diagram as JSON in simple AI-friendly format
 */
export const exportAsJSON = (
  nodes: Node[],
  edges: Edge[],
  _dsl?: any,
  filename: string = 'aws-diagram'
): void => {
  // Convert to simple format
  const simpleNodes: SimpleDiagramNode[] = nodes.map(node => ({
    id: node.id,
    service: getServiceIdFromNode(node),
    position: node.position,
    label: node.data.label || node.data.service || 'Node',
  }));

  // Create a map of node IDs to array indices
  const nodeIdToIndex = new Map(nodes.map((node, idx) => [node.id, idx]));

  // Convert edges to connections using indices
  const connections: SimpleDiagramConnection[] = edges.map(edge => ({
    source: nodeIdToIndex.get(edge.source) ?? edge.source,
    target: nodeIdToIndex.get(edge.target) ?? edge.target,
    label: edge.label as string || edge.data?.label || undefined,
  })).filter(conn => conn.source !== undefined && conn.target !== undefined);

  const simpleDiagram: SimpleDiagramData = {
    nodes: simpleNodes,
    connections: connections,
  };

  const dataStr = JSON.stringify(simpleDiagram, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `${filename}.json`);
  link.click();
};

/**
 * Import diagram from JSON
 */
export const importFromJSON = (jsonString: string): DiagramData => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid diagram data: missing nodes array');
    }

    if (!data.edges || !Array.isArray(data.edges)) {
      throw new Error('Invalid diagram data: missing edges array');
    }

    return {
      nodes: data.nodes,
      edges: data.edges,
      dsl: data.dsl,
      timestamp: data.timestamp,
      version: data.version,
    };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Failed to parse diagram JSON');
  }
};

/**
 * Encode diagram data to base64 for URL sharing
 */
export const encodeDiagramToURL = (nodes: Node[], edges: Edge[], dsl?: string): string => {
  const diagramData: DiagramData = {
    nodes,
    edges,
    dsl,
    version: '1.0',
  };

  const jsonString = JSON.stringify(diagramData);
  const base64 = btoa(encodeURIComponent(jsonString));

  const url = new URL(window.location.href);
  url.searchParams.set('diagram', base64);

  return url.toString();
};

/**
 * Decode diagram data from URL
 */
export const decodeDiagramFromURL = (url: string = window.location.href): DiagramData | null => {
  try {
    const urlObj = new URL(url);
    const diagramParam = urlObj.searchParams.get('diagram');

    if (!diagramParam) {
      return null;
    }

    const jsonString = decodeURIComponent(atob(diagramParam));
    return importFromJSON(jsonString);
  } catch (error) {
    console.error('Error decoding diagram from URL:', error);
    return null;
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};
