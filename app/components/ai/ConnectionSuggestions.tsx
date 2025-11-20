'use client';

import { useEffect, useState } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';

export interface SuggestedConnection {
  source: string;
  target: string;
  reason: string;
  confidence: number;
}

export function useConnectionSuggestions(nodes: Node[], edges: Edge[]) {
  const [suggestions, setSuggestions] = useState<SuggestedConnection[]>([]);
  const { addEdges } = useReactFlow();

  useEffect(() => {
    if (nodes.length < 2) return;

    analyzePotentialConnections(nodes, edges).then(setSuggestions);
  }, [nodes, edges]);

  const acceptSuggestion = (suggestion: SuggestedConnection) => {
    addEdges({
      id: `${suggestion.source}-${suggestion.target}`,
      source: suggestion.source,
      target: suggestion.target,
      type: 'suggested',
      animated: true,
      style: { strokeDasharray: '5,5' },
    });

    setSuggestions(prev =>
      prev.filter(s => s.source !== suggestion.source || s.target !== suggestion.target)
    );
  };

  return { suggestions, acceptSuggestion };
}

async function analyzePotentialConnections(
  nodes: Node[],
  edges: Edge[]
): Promise<SuggestedConnection[]> {
  try {
    const response = await fetch('/api/analyze-connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, existingEdges: edges }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Failed to analyze connections:', error);
    return [];
  }
}
