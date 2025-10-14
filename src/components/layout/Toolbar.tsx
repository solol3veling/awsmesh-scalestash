import React from 'react';
import { Image, FileCode, FileJson } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="default" className="bg-black text-white hover:bg-gray-800">
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={handleExportPNG}>
          <Image className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportSVG}>
          <FileCode className="mr-2 h-4 w-4" />
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Toolbar;
