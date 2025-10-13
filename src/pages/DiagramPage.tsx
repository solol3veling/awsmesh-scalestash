import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import DiagramCanvas from '../components/diagram/DiagramCanvas';
import ServicePalette from '../components/icons/ServicePalette';
import CodeEditor from '../components/editor/CodeEditor';
import Toolbar from '../components/layout/Toolbar';
import { Button } from '../components/ui/button';

const DiagramPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col relative">
      <ServicePalette />

      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <DiagramCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default DiagramPage;
