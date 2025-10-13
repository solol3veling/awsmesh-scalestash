import { useEffect, useCallback, useState } from 'react';
import type { Node, Edge } from 'reactflow';
import type { DiagramDSL } from '../types/diagram';

const STORAGE_KEY = 'aws-diagram-state';
const STORAGE_VERSION = '1.0';

interface PersistedState {
  version: string;
  timestamp: string;
  nodes: Node[];
  edges: Edge[];
  dsl: DiagramDSL;
}

interface UseDiagramPersistenceOptions {
  nodes: Node[];
  edges: Edge[];
  dsl: DiagramDSL;
  autoSave?: boolean;
  debounceMs?: number;
}

export const useDiagramPersistence = ({
  nodes,
  edges,
  dsl,
  autoSave = true,
  debounceMs = 1000,
}: UseDiagramPersistenceOptions) => {
  const [hasPersistedState, setHasPersistedState] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Check if persisted state exists
  const checkPersistedState = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null;
    } catch (error) {
      console.error('Error checking persisted state:', error);
      return false;
    }
  }, []);

  // Load persisted state
  const loadPersistedState = useCallback((): PersistedState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored) as PersistedState;

      // Validate version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Persisted state version mismatch, clearing state');
        clearPersistedState();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Error loading persisted state:', error);
      return null;
    }
  }, []);

  // Save current state to localStorage
  const saveState = useCallback(() => {
    try {
      const state: PersistedState = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        nodes,
        edges,
        dsl,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setLastSaved(new Date());
      setHasPersistedState(true);

      return true;
    } catch (error) {
      console.error('Error saving state:', error);
      return false;
    }
  }, [nodes, edges, dsl]);

  // Clear persisted state
  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasPersistedState(false);
      setLastSaved(null);
      return true;
    } catch (error) {
      console.error('Error clearing persisted state:', error);
      return false;
    }
  }, []);

  // Get state metadata (timestamp, size, etc.)
  const getStateMetadata = useCallback(() => {
    const state = loadPersistedState();
    if (!state) return null;

    return {
      timestamp: new Date(state.timestamp),
      nodeCount: state.nodes.length,
      edgeCount: state.edges.length,
      version: state.version,
    };
  }, [loadPersistedState]);

  // Initialize - check for existing state
  useEffect(() => {
    const exists = checkPersistedState();
    setHasPersistedState(exists);
  }, [checkPersistedState]);

  // Auto-save with debounce
  useEffect(() => {
    if (!autoSave) return;

    // Only save if there are nodes (don't save empty state)
    if (nodes.length === 0) return;

    const timeoutId = setTimeout(() => {
      saveState();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, dsl, autoSave, debounceMs, saveState]);

  return {
    // State indicators
    hasPersistedState,
    lastSaved,

    // Actions
    saveState,
    loadPersistedState,
    clearPersistedState,

    // Utilities
    getStateMetadata,
  };
};
