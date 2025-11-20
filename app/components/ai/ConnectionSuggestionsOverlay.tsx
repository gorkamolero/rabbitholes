'use client';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { X, Check, RefreshCw, Lightbulb } from 'lucide-react';
import type { SuggestedConnection } from '@/app/hooks/useConnectionSuggestions';

interface ConnectionSuggestionsOverlayProps {
  suggestions: SuggestedConnection[];
  isLoading: boolean;
  onAccept: (suggestion: SuggestedConnection) => void;
  onDismiss: (suggestionId: string) => void;
  onRefresh: () => void;
  enabled: boolean;
}

const connectionTypeColors = {
  'leads-to': 'bg-blue-500',
  'related': 'bg-purple-500',
  'contradicts': 'bg-red-500',
  'supports': 'bg-green-500',
  'expands': 'bg-amber-500',
};

const connectionTypeLabels = {
  'leads-to': 'Leads to',
  'related': 'Related',
  'contradicts': 'Contradicts',
  'supports': 'Supports',
  'expands': 'Expands',
};

export function ConnectionSuggestionsOverlay({
  suggestions,
  isLoading,
  onAccept,
  onDismiss,
  onRefresh,
  enabled,
}: ConnectionSuggestionsOverlayProps) {
  if (!enabled || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-30 max-w-md space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>Connection Suggestions</span>
          {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {suggestions.map((suggestion) => (
        <Card key={suggestion.id} className="border-amber-200 dark:border-amber-900">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${
                      connectionTypeColors[
                        suggestion.connectionType || 'related'
                      ]
                    } text-white text-xs`}
                  >
                    {connectionTypeLabels[
                      suggestion.connectionType || 'related'
                    ]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((suggestion.confidence || 0) * 100)}% confidence
                  </span>
                </div>
                <p className="text-sm">{suggestion.reason}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => onDismiss(suggestion.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onAccept(suggestion)}
              >
                <Check className="h-3 w-3 mr-1" />
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
