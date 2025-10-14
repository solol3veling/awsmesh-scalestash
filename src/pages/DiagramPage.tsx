import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import DiagramCanvas from '../components/diagram/DiagramCanvas';
import ServicePalette from '../components/icons/ServicePalette';
import CodeEditor from '../components/editor/CodeEditor';
import PersistenceIndicator from '../components/common/PersistenceIndicator';
import ConfirmationModal from '../components/common/ConfirmationModal';
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
  const { nodes, edges, dsl, setNodes, setEdges, undo, redo } = useDiagram();
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

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

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (isCtrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleClearState = () => {
    setShowClearModal(true);
  };

  const handleRestoreState = () => {
    setShowRestoreModal(true);
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

      {/* Clear State Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        title="Clear Everything?"
        message="Are you sure you want to clear the saved state and current diagram? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="warning"
        onConfirm={() => {
          setShowClearModal(false);
          // Clear localStorage
          clearPersistedState();
          // Clear canvas
          setNodes([]);
          setEdges([]);
        }}
        onCancel={() => {
          setShowClearModal(false);
        }}
      />

      {/* Restore State Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRestoreModal}
        title="Restore Saved State?"
        message="Restore last saved state? This will replace your current diagram."
        confirmText="Restore"
        cancelText="Cancel"
        variant="info"
        onConfirm={() => {
          setShowRestoreModal(false);
          const persistedState = loadPersistedState();
          if (persistedState) {
            setNodes(persistedState.nodes);
            setEdges(persistedState.edges);
          }
        }}
        onCancel={() => {
          setShowRestoreModal(false);
        }}
      />
    </>
  );
};

export default DiagramPage;
