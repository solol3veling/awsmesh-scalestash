import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconColor: 'text-red-500',
          confirmButton: theme === 'dark'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'info':
        return {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconColor: 'text-blue-500',
          confirmButton: theme === 'dark'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      default: // warning
        return {
          icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconColor: 'text-yellow-500',
          confirmButton: theme === 'dark'
            ? 'bg-[#ff9900] hover:bg-[#ff9900]/90 text-white'
            : 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`max-w-md w-full rounded-2xl shadow-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-[#232f3e]' : 'bg-white'
        }`}
      >
        {/* Icon */}
        <div className="flex justify-center pt-8 pb-4">
          <div className={styles.iconColor}>
            {styles.icon}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h2 className={`text-xl font-bold mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {title}
          </h2>
          <p className={`text-sm leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className={`px-6 pb-6 flex gap-3 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              theme === 'dark'
                ? 'bg-[#1a252f] hover:bg-[#2d3f52] text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
