import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import DiagramCanvas from '../components/diagram/DiagramCanvas';
import ServicePalette from '../components/icons/ServicePalette';
import CodeEditor from '../components/editor/CodeEditor';
import PersistenceIndicator from '../components/common/PersistenceIndicator';
import { useDiagram } from '../context/DiagramContext';
import { useDiagramPersistence } from '../hooks/useDiagramPersistence';

const DiagramPage: React.FC = () => {
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  return (
    <div className="h-screen flex flex-col relative">
      <ServicePalette
        showCodeEditor={showCodeEditor}
        setShowCodeEditor={setShowCodeEditor}
      />

      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <DiagramPageContent showCodeEditor={showCodeEditor} />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

// Separate component to access diagram context inside ReactFlowProvider
const DiagramPageContent: React.FC<{ showCodeEditor: boolean }> = ({ showCodeEditor }) => {
  const { nodes, edges, dsl, setNodes, setEdges } = useDiagram();
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);

  const {
    hasPersistedState,
    lastSaved,
    loadPersistedState,
    clearPersistedState,
    getStateMetadata,
  } = useDiagramPersistence({
    nodes,
    edges,
    dsl,
    autoSave: true,
    debounceMs: 1000,
  });

  // Load persisted state on mount
  useEffect(() => {
    if (hasLoadedInitialState) return;

    const persistedState = loadPersistedState();
    if (persistedState) {
      setNodes(persistedState.nodes);
      setEdges(persistedState.edges);
      console.log('Loaded persisted state:', {
        nodes: persistedState.nodes.length,
        edges: persistedState.edges.length,
      });
    }

    setHasLoadedInitialState(true);
  }, [hasLoadedInitialState, loadPersistedState, setNodes, setEdges]);

  const handleClearState = () => {
    if (confirm('Are you sure you want to clear the saved state? This will not clear your current diagram.')) {
      clearPersistedState();
    }
  };

  const handleRestoreState = () => {
    if (confirm('Restore last saved state? This will replace your current diagram.')) {
      const persistedState = loadPersistedState();
      if (persistedState) {
        setNodes(persistedState.nodes);
        setEdges(persistedState.edges);
      }
    }
  };

  const metadata = getStateMetadata();

  return (
    <>
      {/* Persistence Indicator */}
      <PersistenceIndicator
        hasPersistedState={hasPersistedState}
        lastSaved={lastSaved}
        nodeCount={metadata?.nodeCount}
        edgeCount={metadata?.edgeCount}
        onClearState={handleClearState}
        onRestoreState={handleRestoreState}
      />

      <div className={`flex-1 ${showCodeEditor ? 'w-1/2' : 'w-full'}`}>
        <DiagramCanvas />
      </div>
      {showCodeEditor && (
        <div className="w-1/2 border-l border-gray-300 dark:border-gray-700">
          <CodeEditor />
        </div>
      )}
    </>
  );
};

export default DiagramPage;
