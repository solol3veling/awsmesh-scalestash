import React, { useState } from 'react';
import DiagramCanvas from '../components/diagram/DiagramCanvas';
import ServicePalette from '../components/icons/ServicePalette';
import CodeEditor from '../components/editor/CodeEditor';
import Toolbar from '../components/layout/Toolbar';

const DiagramPage: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        <ServicePalette />

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
            <h2 className="text-sm font-semibold text-gray-700">Canvas</h2>
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
            >
              {showEditor ? 'Hide' : 'Show'} Code Editor
            </button>
          </div>

          <div className="flex-1 flex">
            <div className={showEditor ? 'w-1/2' : 'w-full'}>
              <DiagramCanvas />
            </div>

            {showEditor && (
              <div className="w-1/2 border-l border-gray-300">
                <CodeEditor />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramPage;
