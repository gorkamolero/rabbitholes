'use client';

import { useEffect, useState, useCallback } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';

export interface SuggestedConnection {
  id: string;
  source: string;
  target: string;
  reason: string;
  confidence: number;
  connectionType?: 'leads-to' | 'related' | 'contradicts' | 'supports' | 'expands';
}

export function useConnectionSuggestions(nodes: Node[], edges: Edge[], enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<SuggestedConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addEdges } = useReactFlow();

  const analyzePotentialConnections = useCallback(async () => {
    if (nodes.length < 2 || !enabled) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map(n => ({
            id: n.id,
            label: n.data.label,
            content: n.data.content,
            type: n.data.type,
          })),
          existingEdges: edges.map(e => ({
            source: e.source,
            target: e.target,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze connections');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to analyze connections:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, enabled]);

  // Analyze connections when nodes change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      analyzePotentialConnections();
    }, 2000); // Wait 2s after changes before analyzing

    return () => clearTimeout(timeout);
  }, [analyzePotentialConnections]);

  const acceptSuggestion = useCallback((suggestion: SuggestedConnection) => {
    addEdges({
      id: suggestion.id,
      source: suggestion.source,
      target: suggestion.target,
      type: 'suggested',
      animated: true,
      style: { strokeDasharray: '5,5' },
      data: {
        connectionType: suggestion.connectionType || 'related',
        reason: suggestion.reason,
        wasSuggested: true,
      },
    });

    // Remove from suggestions
    setSuggestions(prev =>
      prev.filter(s => s.id !== suggestion.id)
    );
  }, [addEdges]);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev =>
      prev.filter(s => s.id !== suggestionId)
    );
  }, []);

  const refreshSuggestions = useCallback(() => {
    analyzePotentialConnections();
  }, [analyzePotentialConnections]);

  return {
    suggestions,
    isLoading,
    acceptSuggestion,
    dismissSuggestion,
    refreshSuggestions,
  };
}
