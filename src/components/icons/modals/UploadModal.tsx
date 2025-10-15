import React, { useRef, useState } from 'react';

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  onProcessJSON: (jsonData: any) => Promise<void>;
  theme: 'dark' | 'light';
}

const UploadModal: React.FC<UploadModalProps> = ({ show, onClose, onProcessJSON, theme }) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('text');
  const [jsonText, setJsonText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!show) return null;

  const handleProcessJSONText = async () => {
    if (!jsonText.trim()) {
      alert('Please paste JSON content');
      return;
    }

    try {
      const jsonData = JSON.parse(jsonText);

      // Validate JSON structure
      if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
        alert('Invalid JSON: missing or invalid "nodes" array');
        return;
      }

      setIsGenerating(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      setUploadProgress(50);

      await onProcessJSON(jsonData);

      setUploadProgress(100);

      // Track successful diagram generation from pasted JSON
      if (window.plausible) {
        window.plausible('AI Diagram Generated', {
          props: {
            method: 'Paste JSON',
            nodeCount: jsonData.nodes?.length || 0,
            connectionCount: jsonData.connections?.length || 0,
          }
        });
      }

      // Wait a bit to show 100% before closing
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsGenerating(false);
      setUploadProgress(0);
      setJsonText('');
      onClose();
    } catch (error) {
      console.error('Error loading JSON:', error);
      alert('Error loading JSON. Please try again.');
      setIsGenerating(false);

      // Track failed attempt
      if (window.plausible) {
        window.plausible('AI Diagram Failed', {
          props: {
            method: 'Paste JSON',
            error: 'Parse Error'
          }
        });
      }
    }
  };

  const processJSONFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);

        // Validate JSON structure
        if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
          alert('Invalid JSON: missing or invalid "nodes" array');
          return;
        }

        setIsGenerating(true);
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        setUploadProgress(50);

        await onProcessJSON(jsonData);

        setUploadProgress(100);

        // Track successful diagram generation from file upload
        if (window.plausible) {
          window.plausible('AI Diagram Generated', {
            props: {
              method: 'Upload File',
              nodeCount: jsonData.nodes?.length || 0,
              connectionCount: jsonData.connections?.length || 0,
              fileSize: Math.round(file.size / 1024) + 'KB',
            }
          });
        }

        // Wait a bit to show 100% before closing
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsGenerating(false);
        setUploadProgress(0);
        onClose();
      } catch (error) {
        console.error('Error loading JSON:', error);
        alert('Error parsing JSON file. Please check the file format.');
        setIsGenerating(false);

        // Track failed attempt
        if (window.plausible) {
          window.plausible('AI Diagram Failed', {
            props: {
              method: 'Upload File',
              error: 'Parse Error'
            }
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      processJSONFile(file);
    } else {
      alert('Please select a valid JSON file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/json') {
      processJSONFile(file);
    } else {
      alert('Please drop a valid JSON file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => !isGenerating && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-[#232f3e]' : 'bg-white'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {isGenerating ? 'Generating Design...' : 'Upload Architecture JSON'}
          </h2>
          {!isGenerating && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#ff9900]/20 text-gray-400 hover:text-[#ff9900]'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isGenerating ? (
            <>
              {/* Tab Buttons */}
              <div className={`flex gap-2 mb-4 p-1 rounded-lg ${
                theme === 'dark' ? 'bg-[#1a252f]' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setUploadMethod('text')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    uploadMethod === 'text'
                      ? theme === 'dark'
                        ? 'bg-[#ff9900] text-white'
                        : 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Paste JSON
                </button>
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    uploadMethod === 'file'
                      ? theme === 'dark'
                        ? 'bg-[#ff9900] text-white'
                        : 'bg-blue-600 text-white'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Upload File
                </button>
              </div>

              {uploadMethod === 'text' ? (
                <>
                  {/* Text Input Area */}
                  <div className="space-y-4">
                    <textarea
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      placeholder={`Paste your JSON here...\n\nExample:\n{\n  "nodes": [\n    {\n      "id": "web-server",\n      "service": "arch::other::amazon-ec2",\n      "position": { "x": 100, "y": 100 },\n      "label": "Web Server"\n    }\n  ],\n  "connections": []\n}`}
                      className={`w-full h-64 p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
                        theme === 'dark'
                          ? 'bg-[#1a252f] text-gray-300 border border-gray-700 focus:ring-[#ff9900] placeholder:text-gray-600'
                          : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500 placeholder:text-gray-400'
                      }`}
                    />
                    <button
                      onClick={handleProcessJSONText}
                      disabled={!jsonText.trim()}
                      className={`w-full px-6 py-3 rounded-lg font-medium transition-all ${
                        jsonText.trim()
                          ? theme === 'dark'
                            ? 'bg-[#ff9900] hover:bg-[#ff9900]/90 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Generate Diagram
                    </button>
                  </div>

                  {/* Info Text */}
                  <p className={`text-xs mt-4 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Paste JSON content following the AI-friendly format with nodes and connections
                  </p>
                </>
              ) : (
                <>
                  {/* Drag and Drop Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      dragActive
                        ? theme === 'dark'
                          ? 'border-[#ff9900] bg-[#ff9900]/10'
                          : 'border-blue-500 bg-blue-50'
                        : theme === 'dark'
                          ? 'border-gray-600 hover:border-[#ff9900]/50 hover:bg-[#1a252f]'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      className={`w-16 h-16 mx-auto mb-4 ${
                        dragActive
                          ? theme === 'dark'
                            ? 'text-[#ff9900]'
                            : 'text-blue-500'
                          : theme === 'dark'
                            ? 'text-gray-500'
                            : 'text-gray-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {dragActive ? 'Drop your JSON file here' : 'Drag & drop your JSON file'}
                    </p>
                    <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      or click to browse
                    </p>
                    <button
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                        theme === 'dark'
                          ? 'bg-[#ff9900] hover:bg-[#ff9900]/90 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Select JSON File
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Info Text */}
                  <p className={`text-xs mt-4 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Upload a JSON file following the AI-friendly format with nodes and edges
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              {/* Progress Indicator */}
              <div className="space-y-4">
                {/* Animated Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <svg
                      className={`w-20 h-20 ${theme === 'dark' ? 'text-[#ff9900]' : 'text-blue-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-24 h-24 border-4 border-t-transparent rounded-full animate-spin ${
                        theme === 'dark' ? 'border-[#ff9900]' : 'border-blue-600'
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Progress Text */}
                <div className="text-center">
                  <p className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Creating your architecture...
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {uploadProgress < 40 && 'Reading JSON file...'}
                    {uploadProgress >= 40 && uploadProgress < 90 && 'Generating services and connections...'}
                    {uploadProgress >= 90 && 'Finalizing design...'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#1a252f]' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full transition-all duration-300 ${
                      theme === 'dark' ? 'bg-[#ff9900]' : 'bg-blue-600'
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                {/* Percentage */}
                <p className={`text-center text-sm font-medium ${
                  theme === 'dark' ? 'text-[#ff9900]' : 'text-blue-600'
                }`}>
                  {Math.round(uploadProgress)}%
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
