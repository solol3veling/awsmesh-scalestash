import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import DiagramCanvas from '../components/diagram/DiagramCanvas';
import ServicePalette from '../components/icons/ServicePalette';
import CodeEditor from '../components/editor/CodeEditor';
import Toolbar from '../components/layout/Toolbar';
import { Button } from '../components/ui/button';

const DiagramPage: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="h-screen flex flex-col relative">
      <ServicePalette />

      <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-end gap-3 m-6 bg-transparent">
            <Toolbar />
            <Button
              onClick={() => setShowEditor(!showEditor)}
              variant="default"
              size="default"
              className="bg-black text-white hover:bg-gray-800"
            >
              {showEditor ? 'Hide' : 'Show'} Code Editor
            </Button>
          </div>

          <div className="flex-1 flex">
            <div className={showEditor ? 'w-1/2' : 'w-full'}>
              <ReactFlowProvider>
                <DiagramCanvas />
              </ReactFlowProvider>
            </div>

            {showEditor && (
              <div className="w-1/2 border-l border-gray-300">
                <CodeEditor />
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default DiagramPage;
