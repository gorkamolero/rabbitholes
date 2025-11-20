'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { ChevronRight, ChevronLeft, Sparkles, X, RefreshCw } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import type { Node } from '@xyflow/react';

interface Suggestion {
  type: 'question' | 'connection' | 'expansion';
  content: string;
  reasoning?: string;
  metadata?: {
    targetNodeId?: string;
    connectionType?: string;
  };
}

interface SuggestionPanelProps {
  currentNode: Node | null;
  allNodes: Node[];
  onAccept: (suggestion: Suggestion) => void;
  onDismiss: (suggestion: Suggestion) => void;
  onModify: (suggestion: Suggestion) => void;
  explorationMode: string;
}

export function SuggestionPanel({
  currentNode,
  allNodes,
  onAccept,
  onDismiss,
  onModify,
  explorationMode,
}: SuggestionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentNode && isOpen && explorationMode !== 'manual') {
      loadSuggestions();
    }
  }, [currentNode?.id, isOpen, explorationMode]);

  const loadSuggestions = async () => {
    if (!currentNode) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: currentNode.id,
          nodeData: currentNode.data,
          allNodes: allNodes.map(n => ({ id: n.id, label: n.data.label, content: n.data.content })),
          mode: explorationMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setDismissedSuggestions(new Set());
    loadSuggestions();
  };

  const handleDismiss = (suggestion: Suggestion) => {
    const key = `${suggestion.type}-${suggestion.content}`;
    setDismissedSuggestions(prev => new Set([...prev, key]));
    onDismiss(suggestion);
  };

  const visibleSuggestions = suggestions.filter(s => {
    const key = `${s.type}-${s.content}`;
    return !dismissedSuggestions.has(key);
  });

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 shadow-lg"
        onClick={() => setIsOpen(true)}
        title="Open AI Suggestions"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
  }

  // Don't show in manual mode
  if (explorationMode === 'manual') {
    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg overflow-y-auto z-40">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">AI Suggestions</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            AI suggestions are disabled in Manual Mode. Switch to Guided or Hybrid mode to enable suggestions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg overflow-y-auto z-40">
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">AI Suggestions</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {!currentNode && (
          <p className="text-sm text-muted-foreground">
            Select a node to see AI suggestions
          </p>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading suggestions...
          </div>
        )}

        {visibleSuggestions.map((suggestion, i) => (
          <Card key={i} className="border-muted">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="capitalize">
                  {suggestion.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDismiss(suggestion)}
                  title="Dismiss suggestion"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{suggestion.content}</p>
              {suggestion.reasoning && (
                <p className="text-xs text-muted-foreground italic">
                  {suggestion.reasoning}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onAccept(suggestion)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onModify(suggestion)}
                >
                  Modify
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && visibleSuggestions.length === 0 && currentNode && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No suggestions available
          </p>
        )}

        {visibleSuggestions.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Different Suggestions
          </Button>
        )}
      </div>
    </div>
  );
}
