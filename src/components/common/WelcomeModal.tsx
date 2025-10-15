import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const { theme } = useTheme();

  const handleClose = () => {
    // Track event
    if (window.plausible) {
      window.plausible('Welcome Modal Closed');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className={`max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden relative ${
            theme === 'dark' ? 'bg-[#232f3e]' : 'bg-white'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              theme === 'dark'
                ? 'bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'bg-white/50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            } backdrop-blur-sm`}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Hero Content */}
            <div className="px-8 py-16 md:px-12 md:py-20 flex flex-col justify-center">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-[#ff9900] rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  AWSMesh
                </h1>
              </div>

              {/* Hero Text */}
              <h2 className={`text-4xl md:text-5xl font-bold mb-4 leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Design AWS architectures visually
              </h2>

              <p className={`text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Drag, drop, and connect AWS services to create professional infrastructure diagrams in minutes.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ff9900]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#ff9900]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      500+ AWS Services
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Complete library of official AWS service icons
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ff9900]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#ff9900]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Export & Share
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Save as PNG, JSON, or share with your team
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ff9900]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#ff9900]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      AI-Powered
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Generate diagrams from JSON or build from scratch
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleClose}
                className="w-full md:w-auto px-8 py-4 bg-[#ff9900] hover:bg-[#ff8800] text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Start Building →
              </button>
            </div>

            {/* Right Side - Demo Video */}
            <div className={`${theme === 'dark' ? 'bg-[#1a252f]' : 'bg-gray-50'} p-8 md:p-12 flex items-center`}>
              <div className="w-full">
                <div className={`rounded-xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-[#232f3e]' : 'bg-white'}`}>
                  <div className="aspect-video flex items-center justify-center border-4 border-dashed border-gray-700/20">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#ff9900]/10 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#ff9900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Watch Demo
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                        See how easy it is to build diagrams
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      500+
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Services
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Free
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Forever
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ∞
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Diagrams
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
