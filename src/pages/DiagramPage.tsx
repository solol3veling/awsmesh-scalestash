import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import DiagramCanvas from '../components/diagram/DiagramCanvas';
import ServicePalette from '../components/icons/ServicePalette';
import CodeEditor from '../components/editor/CodeEditor';

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
          <div className={`flex-1 ${showCodeEditor ? 'w-1/2' : 'w-full'}`}>
            <DiagramCanvas />
          </div>
          {showCodeEditor && (
            <div className="w-1/2 border-l border-gray-300 dark:border-gray-700">
              <CodeEditor />
            </div>
          )}
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default DiagramPage;
