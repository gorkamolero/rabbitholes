'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ModeSelector } from './NodeCreationModal/ModeSelector';
import { SuggestionsList } from './NodeCreationModal/SuggestionsList';
import { CustomQuestionForm } from './NodeCreationModal/CustomQuestionForm';

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

  const handleClose = () => {
    onClose();
    setSelectedMode(null);
    setCustomQuestion('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]" suppressHydrationWarning>
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Node</DialogTitle>
          <DialogDescription>
            {!selectedMode
              ? 'Choose how you would like to create your next exploration node'
              : selectedMode === 'suggest'
              ? 'AI-generated suggestions based on your current context'
              : 'Write your own custom question or thought'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!selectedMode ? (
            <ModeSelector
              onSelectSuggest={() => {
                setSelectedMode('suggest');
                onCreateWithSuggestions();
              }}
              onSelectCustom={() => setSelectedMode('custom')}
            />
          ) : selectedMode === 'suggest' ? (
            <SuggestionsList
              suggestions={suggestions}
              isLoading={isLoadingSuggestions}
              onSelect={handleSuggestionSelect}
              onBack={() => setSelectedMode(null)}
            />
          ) : (
            <CustomQuestionForm
              question={customQuestion}
              onQuestionChange={setCustomQuestion}
              onSubmit={handleCustomSubmit}
              onBack={() => setSelectedMode(null)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
