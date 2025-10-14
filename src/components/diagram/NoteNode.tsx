import React, { useState, useRef, useEffect } from 'react';
import { NodeResizer } from 'reactflow';
import type { NodeData } from '../../types/diagram';
import OptionsBubble from './OptionsBubble';
import { useTheme } from '../../context/ThemeContext';

interface NoteNodeData extends NodeData {
  note?: string;
  backgroundColor?: string;
  onNoteChange?: (nodeId: string, note: string) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onColorChange?: (nodeId: string, backgroundColor: string, borderColor: string) => void;
}

interface NoteNodeProps {
  data: NoteNodeData;
  selected?: boolean;
  id: string;
}

// Color palette for notes
const NOTE_COLORS = [
  { name: 'Yellow', bg: '#fefce8', border: '#fde047' },
  { name: 'Pink', bg: '#fdf2f8', border: '#f9a8d4' },
  { name: 'Blue', bg: '#eff6ff', border: '#93c5fd' },
  { name: 'Green', bg: '#f0fdf4', border: '#86efac' },
  { name: 'Purple', bg: '#faf5ff', border: '#c4b5fd' },
  { name: 'AWS Orange', bg: '#fff3e0', border: '#ff9900' },
  { name: 'AWS Dark', bg: 'rgba(35, 47, 62, 0.1)', border: '#232f3e' },
  { name: 'Orange', bg: '#fff7ed', border: '#fdba74' },
];

const NoteNode: React.FC<NoteNodeProps> = ({ data, selected, id }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(data.note || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const backgroundColor = data.backgroundColor || '#fefce8';
  const borderColor = NOTE_COLORS.find(c => c.bg === backgroundColor)?.border || '#fde047';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  };

  const handleNoteBlur = () => {
    setIsEditing(false);
    if (data.onNoteChange) {
      data.onNoteChange(id, noteText);
    }
  };

  const handleDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  const handleDuplicate = () => {
    if (data.onDuplicate) {
      data.onDuplicate(id);
    }
  };

  const handleColorSelect = (color: typeof NOTE_COLORS[0]) => {
    if (data.onColorChange) {
      data.onColorChange(id, color.bg, color.border);
    }
    setShowColorPicker(false);
  };

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minWidth: '60px', minHeight: '50px' }}
    >
      {/* Resizer */}
      <NodeResizer
        isVisible={selected || isHovered}
        minWidth={60}
        minHeight={50}
        color={borderColor}
        handleStyle={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: borderColor,
          border: '1px solid white',
        }}
        lineStyle={{
          borderWidth: '1px',
          borderColor: borderColor,
        }}
      />

      {/* Control toolbar */}
      {(isHovered || selected) && (
        <div className="absolute top-1 right-1 z-30 flex gap-1">
          {/* Color Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center justify-center bg-white rounded-md px-1.5 py-1 transition-opacity hover:opacity-60 shadow-md"
              title="Change color"
            >
              <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>

            {/* Color Picker Dropdown */}
            {showColorPicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl p-3 z-50" style={{ width: '200px' }}>
                  <div className="text-[10px] font-semibold text-gray-700 mb-2.5">Note Color</div>
                  <div className="grid grid-cols-4 gap-2">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorSelect(color)}
                        className={`w-10 h-10 rounded border transition-all hover:scale-105 ${
                          backgroundColor === color.bg
                            ? 'ring-1 ring-offset-1 ring-gray-400 scale-105'
                            : ''
                        }`}
                        style={{
                          backgroundColor: color.bg,
                          borderColor: color.border,
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <OptionsBubble
            isLocked={false}
            onToggleLock={() => {}}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            showLock={false}
            showDuplicate={true}
          />
        </div>
      )}

      {/* Note content */}
      <div
        className="w-full h-full transition-all relative overflow-hidden"
        style={{
          backgroundColor,
          borderColor: (selected || isHovered) ? borderColor : 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '2px',
          boxShadow: (selected || isHovered) ? '0 1px 2px 0 rgba(0, 0, 0, 0.03)' : '0 1px 1px 0 rgba(0, 0, 0, 0.02)',
        }}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {/* Note icon in top-left */}
        <div className="absolute top-1 left-1 opacity-20">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: borderColor }}>
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </div>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={noteText}
            onChange={handleNoteChange}
            onBlur={handleNoteBlur}
            placeholder="Add notes..."
            className="w-full h-full p-2 pt-4 resize-none bg-transparent border-none focus:outline-none text-[9px] leading-snug"
            style={{
              color: theme === 'dark' ? '#6b7280' : '#6b7280',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          />
        ) : (
          <div
            className="w-full h-full p-2 pt-4 text-[9px] leading-snug whitespace-pre-wrap overflow-auto cursor-text"
            style={{
              color: theme === 'dark' ? '#6b7280' : '#6b7280',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {noteText || (
              <span className="opacity-40 italic text-[8px]">Click to add...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteNode;
