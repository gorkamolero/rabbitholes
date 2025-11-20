'use client';

import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export interface Suggestion {
  type: 'question' | 'connection' | 'expansion';
  content: string;
  reasoning?: string;
}

interface SuggestionPanelProps {
  currentNode: Node | null;
  onAccept: (suggestion: Suggestion) => void;
  onDismiss: (suggestion: Suggestion) => void;
  onRefresh: () => void;
}

export function SuggestionPanel({
  currentNode,
  onAccept,
  onDismiss,
  onRefresh,
}: SuggestionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentNode && isOpen) {
      loadSuggestions();
    }
  }, [currentNode, isOpen]);

  const loadSuggestions = async () => {
    if (!currentNode) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: currentNode.id,
          nodeData: currentNode.data
        }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
        onClick={() => setIsOpen(true)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg overflow-y-auto z-50">
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
            Select a node to see suggestions
          </p>
        )}

        {isLoading && <div className="text-sm">Loading suggestions...</div>}

        {suggestions.map((suggestion, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary">{suggestion.type}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onDismiss(suggestion)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{suggestion.content}</p>
              {suggestion.reasoning && (
                <p className="text-xs text-muted-foreground">
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
                  onClick={() => {/* Open edit dialog */}}
                >
                  Modify
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {suggestions.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onRefresh}
          >
            Request Different Suggestions
          </Button>
        )}
      </div>
    </div>
  );
}
