'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Skeleton } from './ui/skeleton';
import { Sparkles, Pencil, ArrowLeft } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[600px]">
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
            <div className="grid gap-4">
              <Button
                onClick={() => {
                  setSelectedMode('suggest');
                  onCreateWithSuggestions();
                }}
                variant="outline"
                className="h-auto p-6 justify-start hover:bg-primary/5 hover:border-primary transition-all group"
              >
                <div className="flex items-start w-full gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold mb-1">Get AI Suggestions</h3>
                    <p className="text-sm text-muted-foreground">
                      Let AI suggest thoughtful follow-up questions based on the context
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setSelectedMode('custom')}
                variant="outline"
                className="h-auto p-6 justify-start hover:bg-primary/5 hover:border-primary transition-all group"
              >
                <div className="flex items-start w-full gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors">
                    <Pencil className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold mb-1">Write Your Own</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a custom question to explore a specific direction
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          ) : selectedMode === 'suggest' ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMode(null)}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {isLoadingSuggestions ? (
                <div className="space-y-3">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse mb-4" />
                    <p className="text-sm text-muted-foreground">Generating suggestions...</p>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2 p-4 border rounded-lg">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-3">
                  <Label>Select a question to explore:</Label>
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      variant="outline"
                      className="w-full h-auto p-4 justify-start text-left hover:bg-primary/5 hover:border-primary transition-all"
                    >
                      <div className="flex items-start w-full gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{index + 1}</span>
                        </div>
                        <p className="flex-1 text-sm">{suggestion}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No suggestions available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMode(null)}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="space-y-3">
                <Label htmlFor="custom-question">Your Question</Label>
                <Textarea
                  id="custom-question"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="What would you like to explore next?"
                  className="min-h-[120px] resize-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleCustomSubmit();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to submit
                </p>
              </div>

              <Button
                onClick={handleCustomSubmit}
                disabled={!customQuestion.trim()}
                className="w-full"
                size="lg"
              >
                Create Node
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
