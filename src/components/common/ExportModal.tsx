import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { exportAsPNG, exportAsJSON, encodeDiagramToURL, copyToClipboard } from '../../utils/exportUtils';
import type { Node, Edge } from 'reactflow';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  dsl?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, nodes, edges, dsl }) => {
  const { theme } = useTheme();
  const [filename, setFilename] = useState('aws-diagram');
  const [exporting, setExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  if (!isOpen) return null;

  const handleExportPNG = async (backgroundType: 'canvas' | 'solid') => {
    try {
      setExporting(true);
      await exportAsPNG('diagram-canvas', filename, backgroundType, theme);

      if (window.plausible) {
        window.plausible('Export Diagram', {
          props: {
            format: 'PNG',
            background: backgroundType,
            nodeCount: nodes.length,
            edgeCount: edges.length,
          }
        });
      }
    } catch (error) {
      console.error('PNG export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      setExporting(true);
      exportAsJSON(nodes, edges, dsl, filename);

      if (window.plausible) {
        window.plausible('Export Diagram', {
          props: {
            format: 'JSON',
            nodeCount: nodes.length,
            edgeCount: edges.length,
          }
        });
      }
    } catch (error) {
      console.error('JSON export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setExporting(true);
      const shareableLink = encodeDiagramToURL(nodes, edges, dsl);
      await copyToClipboard(shareableLink);
      setLinkCopied(true);

      if (window.plausible) {
        window.plausible('Share Diagram', {
          props: {
            method: 'Link',
            nodeCount: nodes.length,
            edgeCount: edges.length,
          }
        });
      }

      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Link generation error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl shadow-xl ${
          theme === 'dark' ? 'bg-[#232f3e]' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Export
              </h2>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {nodes.length} nodes, {edges.length} connections
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Filename */}
          <div>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-[#1a252f] border-gray-700 text-white placeholder-gray-500 focus:border-[#ff9900]'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#ff9900]'
              } focus:outline-none`}
              placeholder="diagram-name"
            />
          </div>

          {/* Export buttons grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* PNG with solid background */}
            <button
              onClick={() => handleExportPNG('solid')}
              disabled={exporting}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-[#ff9900] bg-[#1a252f] hover:bg-[#1a252f]'
                  : 'border-gray-200 hover:border-[#ff9900] bg-gray-50 hover:bg-white'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  PNG
                </span>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Solid background
              </p>
            </button>

            {/* PNG with canvas background */}
            <button
              onClick={() => handleExportPNG('canvas')}
              disabled={exporting}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-[#ff9900] bg-[#1a252f] hover:bg-[#1a252f]'
                  : 'border-gray-200 hover:border-[#ff9900] bg-gray-50 hover:bg-white'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  PNG
                </span>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Canvas background
              </p>
            </button>

            {/* JSON */}
            <button
              onClick={handleExportJSON}
              disabled={exporting}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-[#ff9900] bg-[#1a252f] hover:bg-[#1a252f]'
                  : 'border-gray-200 hover:border-[#ff9900] bg-gray-50 hover:bg-white'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  JSON
                </span>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Data export
              </p>
            </button>

            {/* Share Link */}
            <button
              onClick={handleGenerateLink}
              disabled={exporting}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                linkCopied
                  ? 'border-green-500 bg-green-500/10'
                  : theme === 'dark'
                  ? 'border-gray-700 hover:border-[#ff9900] bg-[#1a252f] hover:bg-[#1a252f]'
                  : 'border-gray-200 hover:border-[#ff9900] bg-gray-50 hover:bg-white'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-2 mb-1">
                {linkCopied ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
                <span className={`text-sm font-semibold ${
                  linkCopied
                    ? 'text-green-500'
                    : theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {linkCopied ? 'Copied!' : 'Link'}
                </span>
              </div>
              <p className={`text-xs ${
                linkCopied
                  ? 'text-green-500'
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {linkCopied ? 'Ready to share' : 'Copy to share'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
