import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NodeResizer } from 'reactflow';
import type { Node } from 'reactflow';
import type { NodeData } from '../../types/diagram';
import OptionsBubble from './OptionsBubble';
import { Palette, Link2, Unlink } from 'lucide-react';
import 'reactflow/dist/style.css';

interface GroupNodeData extends NodeData {
  label?: string;
  backgroundColor?: string;
  borderColor?: string;
  onLabelChange?: (nodeId: string, label: string) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onToggleLock?: (nodeId: string) => void;
  onColorChange?: (nodeId: string, backgroundColor: string, borderColor: string) => void;
  onBindChildren?: (nodeId: string) => void;
  onUnbindChildren?: (nodeId: string) => void;
  hasChildren?: boolean;
  locked?: boolean;
}

interface GroupNodeProps {
  data: GroupNodeData;
  selected?: boolean;
  id: string;
}

// Color palette options with AWS brand colors
const COLOR_PRESETS = [
  // AWS Brand Colors
  { name: 'AWS Orange', bg: 'rgba(255, 153, 0, 0.08)', border: '#ff9900', bgSolid: '#ff9900' },
  { name: 'AWS Squid Ink', bg: 'rgba(35, 47, 62, 0.08)', border: '#232f3e', bgSolid: '#232f3e' },
  { name: 'AWS Blue', bg: 'rgba(0, 122, 194, 0.08)', border: '#007ac2', bgSolid: '#007ac2' },

  // Standard Colors
  { name: 'Blue', bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', bgSolid: '#3b82f6' },
  { name: 'Purple', bg: 'rgba(147, 51, 234, 0.08)', border: '#9333ea', bgSolid: '#9333ea' },
  { name: 'Green', bg: 'rgba(34, 197, 94, 0.08)', border: '#22c55e', bgSolid: '#22c55e' },
  { name: 'Red', bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444', bgSolid: '#ef4444' },
  { name: 'Teal', bg: 'rgba(20, 184, 166, 0.08)', border: '#14b8a6', bgSolid: '#14b8a6' },
  { name: 'Pink', bg: 'rgba(236, 72, 153, 0.08)', border: '#ec4899', bgSolid: '#ec4899' },
  { name: 'Indigo', bg: 'rgba(99, 102, 241, 0.08)', border: '#6366f1', bgSolid: '#6366f1' },
  { name: 'Amber', bg: 'rgba(245, 158, 11, 0.08)', border: '#f59e0b', bgSolid: '#f59e0b' },
  { name: 'Slate', bg: 'rgba(100, 116, 139, 0.08)', border: '#64748b', bgSolid: '#64748b' },
];

const GroupNode: React.FC<GroupNodeProps> = ({ data, selected, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Group');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [isTransparent, setIsTransparent] = useState(true);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  const handleLabelSubmit = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setLabel(data.label || 'Group');
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleToggleLock = () => {
    if (data.onToggleLock) {
      data.onToggleLock(id);
    }
  };

  const handleDuplicate = () => {
    if (data.onDuplicate) {
      data.onDuplicate(id);
    }
  };

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
  };

  const handleApplyColor = () => {
    if (selectedColorIndex !== null) {
      const preset = COLOR_PRESETS[selectedColorIndex];
      const finalBg = isTransparent ? preset.bg : preset.bgSolid;
      if (data.onColorChange) {
        data.onColorChange(id, finalBg, preset.border);
      }
    }
    setShowColorPicker(false);
    setSelectedColorIndex(null);
  };

  const handleTransparencyChange = (transparent: boolean) => {
    setIsTransparent(transparent);
  };

  const handleBindChildren = () => {
    if (data.onBindChildren) {
      data.onBindChildren(id);
    }
  };

  const handleUnbindChildren = () => {
    if (data.onUnbindChildren) {
      data.onUnbindChildren(id);
    }
  };

  // Update picker position when opened
  useEffect(() => {
    if (showColorPicker && colorButtonRef.current) {
      const rect = colorButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + 8,
        left: rect.right - 260, // Align right edge of picker with button
      });
    }
  }, [showColorPicker]);

  const isLocked = data.locked || false;
  const backgroundColor = data.backgroundColor || 'rgba(59, 130, 246, 0.05)';
  const borderColor = data.borderColor || '#3b82f6';

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minWidth: '200px', minHeight: '150px' }}
    >
      {/* Resizer - allows dragging edges to resize */}
      <NodeResizer
        isVisible={selected || isHovered}
        minWidth={200}
        minHeight={150}
        color={borderColor}
        handleStyle={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: borderColor,
          border: '1.5px solid white',
        }}
        lineStyle={{
          borderWidth: '1px',
          borderColor: borderColor,
        }}
      />

      {/* Control toolbar */}
      {(isHovered || selected) && (
        <div className="absolute top-2 right-2 z-30 flex gap-2">
          {/* Bind/Unbind Children Button */}
          {!isLocked && (
            <button
              onClick={data.hasChildren ? handleUnbindChildren : handleBindChildren}
              className="flex items-center justify-center bg-white rounded-md px-2 py-1.5 transition-opacity hover:opacity-60"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: 'none',
                cursor: 'pointer'
              }}
              title={data.hasChildren ? "Unbind child nodes" : "Bind child nodes"}
            >
              {data.hasChildren ? (
                <Unlink size={11} className="text-orange-500" strokeWidth={2} />
              ) : (
                <Link2 size={11} className="text-blue-500" strokeWidth={2} />
              )}
            </button>
          )}

          {/* Color Picker Button */}
          {!isLocked && (
            <>
              <button
                ref={colorButtonRef}
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center justify-center bg-white rounded-md px-2 py-1.5 transition-opacity hover:opacity-60"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Change color"
              >
                <Palette size={11} className="text-gray-600" strokeWidth={2} />
              </button>
            </>
          )}

          <OptionsBubble
            isLocked={isLocked}
            onToggleLock={handleToggleLock}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            showLock={true}
            showDuplicate={true}
          />
        </div>
      )}

      {/* Color Picker Dropdown - Rendered via Portal */}
      {showColorPicker && !isLocked && createPortal(
        <>
          {/* Backdrop to close picker */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setShowColorPicker(false)}
          />
          {/* Color Picker */}
          <div
            className="fixed bg-white rounded-lg shadow-xl p-4"
            style={{
              top: `${pickerPosition.top}px`,
              left: `${pickerPosition.left}px`,
              minWidth: '260px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-3 pb-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-800">Container Color</span>
            </div>

            {/* AWS Colors Section */}
            <div className="mb-3">
              <div className="text-[10px] font-medium text-gray-500 mb-2">AWS COLORS</div>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.slice(0, 3).map((preset, index) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorSelect(index)}
                    className={`w-14 h-14 rounded-md border-2 transition-all hover:scale-105 ${
                      selectedColorIndex === index
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-105'
                        : ''
                    }`}
                    style={{
                      backgroundColor: isTransparent ? preset.bg : preset.bgSolid,
                      borderColor: preset.border,
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Standard Colors Grid */}
            <div className="mb-3">
              <div className="text-[10px] font-medium text-gray-500 mb-2">STANDARD COLORS</div>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.slice(3).map((preset, index) => (
                  <button
                    key={preset.name}
                    onClick={() => handleColorSelect(index + 3)}
                    className={`w-14 h-14 rounded-md border-2 transition-all hover:scale-105 ${
                      selectedColorIndex === index + 3
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-105'
                        : ''
                    }`}
                    style={{
                      backgroundColor: isTransparent ? preset.bg : preset.bgSolid,
                      borderColor: preset.border,
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Transparency Toggle */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-700">Style</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleTransparencyChange(true)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    isTransparent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Transparent
                </button>
                <button
                  onClick={() => handleTransparencyChange(false)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    !isTransparent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Solid
                </button>
              </div>
            </div>

            {/* Preview & Apply */}
            {selectedColorIndex !== null && (
              <div className="space-y-2">
                {/* Preview */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">Preview:</span>
                  <div
                    className="flex-1 h-8 rounded border-2"
                    style={{
                      backgroundColor: isTransparent
                        ? COLOR_PRESETS[selectedColorIndex].bg
                        : COLOR_PRESETS[selectedColorIndex].bgSolid,
                      borderColor: COLOR_PRESETS[selectedColorIndex].border,
                    }}
                  />
                </div>

                {/* Apply Button */}
                <button
                  onClick={handleApplyColor}
                  className="w-full py-2 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors"
                >
                  Apply Color
                </button>
              </div>
            )}

            {selectedColorIndex === null && (
              <div className="text-xs text-gray-500 text-center py-2">
                Select a color above
              </div>
            )}
          </div>
        </>,
        document.body
      )}

      {/* Group container */}
      <div
        className="w-full h-full rounded-lg transition-all"
        style={{
          backgroundColor,
          borderColor: (selected || isHovered) ? borderColor : 'transparent',
          borderWidth: '2px',
          borderStyle: isLocked ? 'dashed' : 'solid',
        }}
      >
        {/* Label badge at the top - vertically centered on border */}
        <div className="absolute left-3 z-20" style={{ top: '-9px' }}>
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleLabelSubmit}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-[9px] font-medium px-1.5 py-0.5 border rounded bg-white text-gray-700 focus:outline-none focus:ring-1 shadow-sm"
              style={{
                minWidth: '50px',
                maxWidth: '120px',
                borderColor: borderColor,
              }}
            />
          ) : (
            <div
              onClick={() => !isLocked && setIsEditing(true)}
              className="text-[9px] font-medium px-1.5 py-0.5 rounded transition-all inline-block tracking-wide"
              style={{
                color: '#ffffff',
                backgroundColor: borderColor,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
                cursor: isLocked ? 'default' : 'text',
              }}
              title={isLocked ? label : 'Click to edit group name'}
            >
              {label}
            </div>
          )}
        </div>

        {/* Helper text when empty and selected */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="text-xs opacity-30 text-center px-4"
              style={{ color: borderColor }}
            >
              Drag nodes into this group
            </div>
          </div>
        )}
      </div>

      {/* Lock indicator */}
      {isLocked && (
        <div className="absolute top-2 left-2 z-20 mr-2">
          <svg
            className="w-3 h-3 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default GroupNode;
