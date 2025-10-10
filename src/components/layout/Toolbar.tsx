import React from 'react';
import { useDiagram } from '../../context/DiagramContext';
import { exportToPNG, exportToSVG, exportToJSON } from '../../utils/export';

const Toolbar: React.FC = () => {
  const { exportDSL } = useDiagram();

  const handleExportPNG = () => {
    exportToPNG('react-flow', `aws-diagram-${Date.now()}.png`);
  };

  const handleExportSVG = () => {
    exportToSVG('react-flow', `aws-diagram-${Date.now()}.svg`);
  };

  const handleExportJSON = () => {
    const dsl = exportDSL();
    exportToJSON(dsl, `aws-diagram-${Date.now()}.json`);
  };

  return (
    <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">AWS Architecture Designer</h1>
        <span className="text-xs text-gray-400">v1.0</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExportPNG}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition"
        >
          Export PNG
        </button>
        <button
          onClick={handleExportSVG}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition"
        >
          Export SVG
        </button>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium transition"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
