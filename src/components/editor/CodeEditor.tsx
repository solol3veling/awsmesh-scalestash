import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useDiagram } from '../../context/DiagramContext';

const CodeEditor: React.FC = () => {
  const { dsl, loadFromDSL, updateDSL } = useDiagram();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    updateDSL();
  }, []);

  useEffect(() => {
    setCode(JSON.stringify(dsl, null, 2));
  }, [dsl]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      setError(null);
    }
  };

  const handleApplyChanges = () => {
    try {
      const parsedDSL = JSON.parse(code);
      loadFromDSL(parsedDSL);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 relative">
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-white font-semibold">DSL JSON Editor</h3>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-500 text-white text-sm">
          {error}
        </div>
      )}

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* Buttons moved to bottom left */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-10 max-w-[200px]">
        <button
          onClick={handleApplyChanges}
          className="px-4 py-2 bg-[#ff9900] text-white rounded hover:bg-[#ff8800] text-sm font-medium shadow-lg transition-colors"
        >
          Apply Changes
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-[#ff9900] text-white rounded hover:bg-[#ff8800] text-sm font-medium shadow-lg transition-colors"
        >
          Download JSON
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
