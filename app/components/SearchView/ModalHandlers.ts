import { Node, Edge, MarkerType } from '@xyflow/react';
import { getSuggestions } from '../../services/api';

interface ConversationMessage {
  user?: string;
  assistant?: string;
}

export async function requestSuggestions(
  sourceNode: Node,
  conversationHistory: ConversationMessage[]
): Promise<string[]> {
  const historyForSuggestions = conversationHistory.map(entry => [
    { role: 'user' as const, content: entry.user || '' },
    { role: 'assistant' as const, content: entry.assistant || '' }
  ]).flat();

  const response = await getSuggestions({
    query: String(sourceNode.data.label || ''),
    conversationHistory: historyForSuggestions,
    mode: 'expansive'
  });

  return response.suggestions || [];
}

export function createNodeAndEdgeFromQuestion(
  question: string,
  sourceNode: Node,
  questionNodeWidth: number,
  activeRequestRef: React.MutableRefObject<{ [key: string]: AbortController | null }>
): { node: Node; edge: Edge; nodeId: string; abortController: AbortController } {
  const abortController = new AbortController();
  const nodeId = `question-${sourceNode.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  activeRequestRef.current[nodeId] = abortController;

  const tempQuestionNode: Node = {
    id: nodeId,
    type: 'default',
    data: {
      label: question,
      isExpanded: false,
      content: '',
      images: [],
      sources: []
    },
    position: { x: 0, y: 0 },
    style: {
      width: questionNodeWidth,
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'left',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer'
    }
  };

  const newEdge: Edge = {
    id: `edge-${nodeId}`,
    source: sourceNode.id,
    target: nodeId,
    style: {
      stroke: 'rgba(248, 248, 248, 0.8)',
      strokeWidth: 1.5
    },
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'rgba(248, 248, 248, 0.8)'
    }
  };

  return { node: tempQuestionNode, edge: newEdge, nodeId, abortController };
}
