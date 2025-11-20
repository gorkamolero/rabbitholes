'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NodeCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWithSuggestions: () => void;
  onCreateCustom: (question: string) => void;
  suggestions?: string[];
  isLoadingSuggestions?: boolean;
}

export const NodeCreationModal: React.FC<NodeCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateWithSuggestions,
  onCreateCustom,
  suggestions = [],
  isLoadingSuggestions = false,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedMode, setSelectedMode] = useState<'suggest' | 'custom' | null>(null);

  if (!isOpen) return null;

  const handleCustomSubmit = () => {
    if (customQuestion.trim()) {
      onCreateCustom(customQuestion.trim());
      setCustomQuestion('');
      setSelectedMode(null);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onCreateCustom(suggestion);
    setSelectedMode(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Create New Node</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedMode ? (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-6">
                How would you like to create your next question?
              </p>

              <button
                onClick={() => {
                  setSelectedMode('suggest');
                  onCreateWithSuggestions();
                }}
                className="w-full p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 hover:from-purple-900/50 hover:to-blue-900/50 border border-purple-700/50 rounded-lg transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-white mb-1">Get AI Suggestions</h3>
                    <p className="text-sm text-gray-400">
                      Let AI suggest thoughtful follow-up questions based on the context
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMode('custom')}
                className="w-full p-6 bg-gradient-to-r from-green-900/30 to-teal-900/30 hover:from-green-900/50 hover:to-teal-900/50 border border-green-700/50 rounded-lg transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-white mb-1">Write Your Own</h3>
                    <p className="text-sm text-gray-400">
                      Create a custom question to explore a specific direction
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : selectedMode === 'suggest' ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedMode(null)}
                className="text-sm text-gray-400 hover:text-white transition-colors mb-4"
              >
                ← Back
              </button>

              {isLoadingSuggestions ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">Generating suggestions...</p>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm mb-4">
                    Select a question to explore:
                  </p>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg transition-all text-left group"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400 text-xs font-semibold">
                          {index + 1}
                        </span>
                        <p className="flex-1 text-gray-200 group-hover:text-white transition-colors">
                          {suggestion}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No suggestions available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedMode(null)}
                className="text-sm text-gray-400 hover:text-white transition-colors mb-4"
              >
                ← Back
              </button>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Your Question
                </label>
                <textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="What would you like to explore next?"
                  className="w-full min-h-[120px] p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent resize-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleCustomSubmit();
                    }
                  }}
                />
                <p className="text-xs text-gray-500">
                  Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter to submit
                </p>
              </div>

              <button
                onClick={handleCustomSubmit}
                disabled={!customQuestion.trim()}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Create Node
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
