import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import type { DiagramDSL, AWSNode } from '../types/diagram';

// Helper function to convert service to uniform ID format
const getUniformServiceId = (serviceName: string, category: string): string => {
  const prefix = serviceName.match(/^(Arch|Res)\s+/i)?.[1].toLowerCase() || 'arch';
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
  const normalizedService = serviceName
    .replace(/^(Arch|Res)\s+/i, '')
    .replace(/\s+(Other)$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .trim();
  return `${prefix}::${normalizedCategory}::${normalizedService}`;
};

// Flow pattern keywords - maps semantic names to handle directions
export const FLOW_PATTERNS: Record<string, { source: string; target: string }> = {
  // Horizontal flows
  'horizontal': { source: 'right-2', target: 'left-2' },
  'horizontal-reverse': { source: 'left-2', target: 'right-2' },

  // Vertical flows
  'vertical': { source: 'bottom-2', target: 'top-2' },
  'vertical-reverse': { source: 'top-2', target: 'bottom-2' },

  // Diagonal flows
  'diagonal-down': { source: 'bottom-2', target: 'right-2' },
  'diagonal-up': { source: 'top-2', target: 'right-2' },

  // L-shaped flows
  'l-shape-down': { source: 'right-2', target: 'top-2' },
  'l-shape-up': { source: 'right-2', target: 'bottom-2' },
  'l-shape-left-down': { source: 'left-2', target: 'top-2' },
  'l-shape-left-up': { source: 'left-2', target: 'bottom-2' },
};

// Helper function to get all available flow pattern names
export const getFlowPatternNames = (): string[] => Object.keys(FLOW_PATTERNS);

interface DiagramContextType {
  nodes: Node[];
  edges: Edge[];
  dsl: DiagramDSL;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeColor: (nodeId: string, backgroundColor: string, borderColor: string) => void;
  toggleNodeLock: (nodeId: string) => void;
  bindChildrenToGroup: (groupId: string) => void;
  unbindChildrenFromGroup: (groupId: string) => void;
  removeEdge: (edgeId: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
  updateDSL: () => void;
  loadFromDSL: (dsl: DiagramDSL, iconResolver?: (service: string) => string | null) => void;
  exportDSL: () => DiagramDSL;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export const useDiagram = () => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within DiagramProvider');
  }
  return context;
};

interface DiagramProviderProps {
  children: ReactNode;
}

export const DiagramProvider: React.FC<DiagramProviderProps> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dsl, setDSL] = useState<DiagramDSL>({
    version: '1.0',
    metadata: {
      title: 'Untitled Diagram',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    nodes: [],
    connections: [],
  });

  // History state for undo/redo
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  const historyTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Track all changes to nodes and edges and save to history with debouncing
  React.useEffect(() => {
    if (isUndoRedoAction) return; // Don't save if this is an undo/redo action

    // Clear existing timeout
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    // Debounce history updates - wait 500ms after the last change
    historyTimeoutRef.current = setTimeout(() => {
      const currentState = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };

      setHistory((prev) => {
        // Check if state actually changed from the last saved state
        const lastState = prev[prev.length - 1];
        if (lastState &&
            JSON.stringify(lastState.nodes) === JSON.stringify(currentState.nodes) &&
            JSON.stringify(lastState.edges) === JSON.stringify(currentState.edges)) {
          return prev; // No change, don't add to history
        }

        // Remove any future history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add current state
        const updatedHistory = [...newHistory, currentState];
        // Limit history to last 50 states
        if (updatedHistory.length > 50) {
          const trimmed = updatedHistory.slice(-50);
          setHistoryIndex(trimmed.length - 1);
          return trimmed;
        }
        setHistoryIndex(updatedHistory.length - 1);
        return updatedHistory;
      });
    }, 500); // 500ms debounce

    return () => {
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
    };
  }, [nodes, edges, isUndoRedoAction, historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const previousState = history[newIndex];

    if (!previousState) return;

    setIsUndoRedoAction(true);
    setHistoryIndex(newIndex);
    setNodes(JSON.parse(JSON.stringify(previousState.nodes)));
    setEdges(JSON.parse(JSON.stringify(previousState.edges)));

    // Reset flag after state update
    setTimeout(() => setIsUndoRedoAction(false), 100);
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const nextState = history[newIndex];

    if (!nextState) return;

    setIsUndoRedoAction(true);
    setHistoryIndex(newIndex);
    setNodes(JSON.parse(JSON.stringify(nextState.nodes)));
    setEdges(JSON.parse(JSON.stringify(nextState.edges)));

    // Reset flag after state update
    setTimeout(() => setIsUndoRedoAction(false), 100);
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Prevent changes to locked nodes
      const filteredChanges = changes.filter((change) => {
        if (change.type === 'position' || change.type === 'remove') {
          const node = nodes.find((n) => n.id === change.id);
          if (node?.data?.locked) {
            return false; // Block changes to locked nodes
          }
        }
        return true;
      });
      setNodes((nds) => applyNodeChanges(filteredChanges, nds));
    },
    [nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('Connection made:', connection);
      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        type: 'awsEdge',
        style: { strokeWidth: 1, stroke: '#94a3b8' },
        animated: false,
      };
      console.log('Adding edge:', newEdge);
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        console.log('Updated edges:', updatedEdges);
        return updatedEdges;
      });
    },
    []
  );

  const addNode = useCallback((node: Node) => {
    setNodes((nds) => [...nds, node]);
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, []);

  const duplicateNode = useCallback((nodeId: string) => {
    setNodes((nds) => {
      const nodeToDuplicate = nds.find((n) => n.id === nodeId);
      if (!nodeToDuplicate) return nds;

      // Deep copy the data to ensure complete independence
      const newNode: Node = {
        ...nodeToDuplicate,
        id: `node-${Date.now()}`,
        position: {
          x: nodeToDuplicate.position.x + 80,
          y: nodeToDuplicate.position.y + 80,
        },
        data: JSON.parse(JSON.stringify({
          ...nodeToDuplicate.data,
          locked: false, // Don't copy lock state
          // Remove callback references since they'll be re-added by DiagramCanvas
          onLabelChange: undefined,
          onToggleLock: undefined,
          onDelete: undefined,
          onDuplicate: undefined,
          isConnecting: undefined,
        })),
        selected: false,
        draggable: true,
      };

      return [...nds, newNode];
    });
  }, []);

  const updateNodeLabel = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label } }
          : node
      )
    );
  }, []);

  const updateNodeColor = useCallback((nodeId: string, backgroundColor: string, borderColor: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, backgroundColor, borderColor } }
          : node
      )
    );
  }, []);

  const toggleNodeLock = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, locked: !node.data.locked }, draggable: node.data.locked }
          : node
      )
    );
  }, []);

  const bindChildrenToGroup = useCallback((groupId: string) => {
    setNodes((nds) => {
      const groupNode = nds.find((n) => n.id === groupId);
      if (!groupNode || groupNode.type !== 'groupNode') return nds;

      // Calculate group bounds
      const groupBounds = {
        left: groupNode.position.x,
        right: groupNode.position.x + (groupNode.style?.width as number || 300),
        top: groupNode.position.y,
        bottom: groupNode.position.y + (groupNode.style?.height as number || 200),
      };

      // Find all nodes that are inside the group bounds
      return nds.map((node) => {
        // Skip the group itself
        if (node.id === groupId) {
          return { ...node, data: { ...node.data, hasChildren: true } };
        }

        // Check if node is within group bounds
        const nodeCenter = {
          x: node.position.x + 40, // Approximate node center (assuming ~80px width)
          y: node.position.y + 40,
        };

        const isInside =
          nodeCenter.x >= groupBounds.left &&
          nodeCenter.x <= groupBounds.right &&
          nodeCenter.y >= groupBounds.top &&
          nodeCenter.y <= groupBounds.bottom;

        if (isInside && node.type === 'awsNode') {
          // Calculate relative position to group
          const relativePosition = {
            x: node.position.x - groupNode.position.x,
            y: node.position.y - groupNode.position.y,
          };

          return {
            ...node,
            parentNode: groupId,
            position: relativePosition,
            extent: 'parent' as const,
          };
        }

        return node;
      });
    });
  }, []);

  const unbindChildrenFromGroup = useCallback((groupId: string) => {
    setNodes((nds) => {
      const groupNode = nds.find((n) => n.id === groupId);
      if (!groupNode) return nds;

      return nds.map((node) => {
        // Update the group node
        if (node.id === groupId) {
          return { ...node, data: { ...node.data, hasChildren: false } };
        }

        // Unbind children
        if (node.parentNode === groupId) {
          // Convert relative position back to absolute
          const absolutePosition = {
            x: node.position.x + groupNode.position.x,
            y: node.position.y + groupNode.position.y,
          };

          return {
            ...node,
            parentNode: undefined,
            position: absolutePosition,
            extent: undefined,
          };
        }

        return node;
      });
    });
  }, []);

  const removeEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, []);

  const updateEdgeLabel = useCallback((edgeId: string, label: string) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, label }
          : edge
      )
    );
  }, []);

  // Convert React Flow nodes/edges to minimal DSL JSON
  const updateDSL = useCallback(() => {
    // Create node ID to index mapping for minimal edge references
    const nodeIdToIndex = new Map<string, number>();
    nodes.forEach((node, index) => {
      nodeIdToIndex.set(node.id, index);
    });

    const dslNodes: AWSNode[] = nodes.map((node) => {
      // Handle group nodes - use compact group syntax
      if (node.type === 'groupNode') {
        const width = node.style?.width || 300;
        const height = node.style?.height || 200;
        const locked = node.data.locked ? '::locked' : '';

        // Format: "width::height::container::::locked" (omit trailing if unlocked)
        const groupValue = `${width}::${height}::container${locked}`;

        return {
          id: node.id,
          service: 'group',
          label: node.data.label || 'Group',
          position: node.position,
          group: groupValue,
        };
      }

      // Handle regular AWS service nodes
      const serviceName = node.data.service || 'unknown';
      const category = node.data.category || 'Compute';

      const baseNode: AWSNode = {
        id: node.id,
        service: getUniformServiceId(serviceName, category),
        category: category,
        label: node.data.label || '',
        position: node.position,
      };

      // Add compact group field for child nodes: "::::parent::parent-id"
      if (node.parentNode) {
        baseNode.group = `::::parent::${node.parentNode}`;
      }

      return baseNode;
    });

    const dslConnections = edges.map((edge) => ({
      id: edge.id,
      source: nodeIdToIndex.get(edge.source) ?? edge.source,
      target: nodeIdToIndex.get(edge.target) ?? edge.target,
      label: edge.label as string,
      animated: edge.animated,
    }));

    setDSL((prev) => ({
      ...prev,
      nodes: dslNodes,
      connections: dslConnections,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, [nodes, edges]);

  // Load diagram from DSL JSON
  const loadFromDSL = useCallback((dslData: DiagramDSL, iconResolver?: (service: string) => string | null) => {
    const flowNodes: Node[] = dslData.nodes.map((node, index) => {
      // Parse compact group field if present
      // Format: "width::height::container::locked" or "::::parent::parent-id"
      let groupInfo: {
        isContainer?: boolean;
        isChild?: boolean;
        width?: number;
        height?: number;
        locked?: boolean;
        parentId?: string;
      } = {};

      if (node.group) {
        const parts = node.group.split('::');

        // Check if it's a child node: "::::parent::parent-id"
        if (parts[4] === 'parent' && parts[5]) {
          groupInfo.isChild = true;
          groupInfo.parentId = parts[5];
        }
        // Check if it's a container: "width::height::container[::locked]"
        else if (parts[2] === 'container') {
          groupInfo.isContainer = true;
          groupInfo.width = parseInt(parts[0]) || 300;
          groupInfo.height = parseInt(parts[1]) || 200;
          groupInfo.locked = parts[3] === 'locked' || parts[4] === 'locked';
        }
      }

      // Handle group container nodes
      if (node.service === 'group' || groupInfo.isContainer) {
        return {
          id: node.id || `group-${Date.now()}-${index}`,
          type: 'groupNode',
          position: node.position,
          style: {
            width: groupInfo.width || 300,
            height: groupInfo.height || 200,
            zIndex: -1,
          },
          draggable: !groupInfo.locked,
          selectable: true,
          data: {
            label: node.label || 'Group',
            service: 'group',
            category: 'Container',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: '#3b82f6',
            locked: groupInfo.locked || false,
            hasChildren: false, // Will be set when children are bound
            ...node.data,
          },
        };
      }

      // Handle regular AWS service nodes
      const iconUrl = iconResolver ? iconResolver(node.service) : null;

      return {
        id: node.id || `node-${Date.now()}-${index}`,
        type: 'awsNode',
        position: node.position,
        parentNode: groupInfo.parentId, // Restore parent relationship from compact syntax
        extent: groupInfo.parentId ? ('parent' as const) : undefined, // Add extent constraint if has parent
        data: {
          service: node.service,
          category: node.category || 'Compute',
          label: node.label || node.service,
          iconUrl: iconUrl || node.data?.iconUrl, // Use resolved icon or fallback to existing
          ...node.data,
        },
      };
    });

    // Convert direction to handle (uses middle handle by default)
    const directionToHandle = (direction: string, position: number = 2): string => {
      return `${direction}-${position}`;
    };

    // Smart handle selection based on node positions
    const selectBestHandle = (sourceNode: any, targetNode: any, isSource: boolean): string => {
      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;

      // Determine primary direction based on distance
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal connection is dominant
        if (isSource) {
          return dx > 0 ? 'right-2' : 'left-2'; // Going right or left
        } else {
          return dx > 0 ? 'left-2' : 'right-2'; // Coming from left or right
        }
      } else {
        // Vertical connection is dominant
        if (isSource) {
          return dy > 0 ? 'bottom-2' : 'top-2'; // Going down or up
        } else {
          return dy > 0 ? 'top-2' : 'bottom-2'; // Coming from above or below
        }
      }
    };

    // Handle both index-based (0, 1, 2) and ID-based edge references
    const flowEdges: Edge[] = (dslData.connections || []).map((conn) => {
      const sourceId = typeof conn.source === 'number'
        ? flowNodes[conn.source]?.id
        : conn.source;
      const targetId = typeof conn.target === 'number'
        ? flowNodes[conn.target]?.id
        : conn.target;

      // Find source and target nodes for smart handle selection
      const sourceNode = flowNodes.find(n => n.id === sourceId);
      const targetNode = flowNodes.find(n => n.id === targetId);

      // Priority: sourceHandle > flow > sourceDirection/targetDirection > auto-select
      let sourceHandle = conn.sourceHandle;
      let targetHandle = conn.targetHandle;

      // Parse flow field if provided
      if (!sourceHandle && !targetHandle && conn.flow) {
        // Check if it's a keyword pattern
        if (FLOW_PATTERNS[conn.flow]) {
          sourceHandle = FLOW_PATTERNS[conn.flow].source;
          targetHandle = FLOW_PATTERNS[conn.flow].target;
        } else {
          // Otherwise parse as direction format: "right::left" or "right::left::2::1"
          const flowParts = conn.flow.split('::');
          if (flowParts.length >= 2) {
            const sourceDir = flowParts[0];
            const targetDir = flowParts[1];
            const sourcePos = flowParts[2] || '2'; // Default to middle handle
            const targetPos = flowParts[3] || '2'; // Default to middle handle

            sourceHandle = `${sourceDir}-${sourcePos}`;
            targetHandle = `${targetDir}-${targetPos}`;
          }
        }
      }

      // If specific handle not provided, check for direction
      if (!sourceHandle && conn.sourceDirection) {
        sourceHandle = directionToHandle(conn.sourceDirection);
      }
      if (!targetHandle && conn.targetDirection) {
        targetHandle = directionToHandle(conn.targetDirection);
      }

      // If still no handle, auto-select based on position
      if (!sourceHandle && sourceNode && targetNode) {
        sourceHandle = selectBestHandle(sourceNode, targetNode, true);
      }
      if (!targetHandle && sourceNode && targetNode) {
        targetHandle = selectBestHandle(sourceNode, targetNode, false);
      }

      return {
        id: conn.id || `edge-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId as string,
        target: targetId as string,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        label: conn.label,
        animated: conn.animated,
        type: 'awsEdge',
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);

    // Ensure DSL has required structure even if minimal
    setDSL({
      version: dslData.version || '1.0',
      metadata: dslData.metadata || {
        title: 'Imported Diagram',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      nodes: dslData.nodes,
      connections: dslData.connections || [],
    });
  }, []);

  const exportDSL = useCallback(() => {
    updateDSL();
    return dsl;
  }, [dsl, updateDSL]);

  return (
    <DiagramContext.Provider
      value={{
        nodes,
        edges,
        dsl,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        removeNode,
        duplicateNode,
        updateNodeLabel,
        updateNodeColor,
        toggleNodeLock,
        bindChildrenToGroup,
        unbindChildrenFromGroup,
        removeEdge,
        updateEdgeLabel,
        updateDSL,
        loadFromDSL,
        exportDSL,
        undo,
        redo,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </DiagramContext.Provider>
  );
};
