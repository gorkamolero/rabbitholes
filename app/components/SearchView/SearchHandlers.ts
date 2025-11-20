import { Node, Edge, Position } from '@xyflow/react';
import { searchRabbitHole } from '../../services/api';

interface ConversationMessage {
  user?: string;
  assistant?: string;
}

interface SearchResponse {
  response: string;
  followUpQuestions: string[];
  sources: any[];
  images: any[];
}

export async function handleNodeExpansion(
  node: Node,
  nodes: Node[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  conversationHistory: ConversationMessage[],
  setConversationHistory: (history: ConversationMessage[]) => void,
  getFollowUpMode: () => string,
  abortController: AbortController
) {
  const questionText = String(node.data.label || '');

  // Add current main node to conversation history
  const lastMainNode = nodes.find(n => n.type === 'mainNode');
  if (lastMainNode) {
    const newHistoryEntry: ConversationMessage = {
      user: String(lastMainNode.data.label || ''),
      assistant: String(lastMainNode.data.content || '')
    };
    setConversationHistory([...conversationHistory, newHistoryEntry]);
  }

  // Update node to show loading state
  setNodes(nodes.map(n => {
    if (n.id === node.id) {
      return {
        ...n,
        type: 'mainNode',
        style: {
          ...n.style,
          width: 600,
          height: 500
        },
        data: {
          ...n.data,
          content: 'Loading...',
          isExpanded: true
        }
      };
    }
    return n;
  }));

  // Make API call
  const followUpMode = getFollowUpMode();
  const response = await searchRabbitHole({
    query: questionText,
    previousConversation: conversationHistory,
    concept: '',
    followUpMode: followUpMode as 'expansive' | 'focused'
  }, abortController.signal);

  return response;
}

export function createFollowUpNodes(
  parentNode: Node,
  followUpQuestions: string[]
): { nodes: Node[], edges: Edge[] } {
  const newNodes: Node[] = [];
  const newEdges: Edge[] = [];

  followUpQuestions.forEach((question, index) => {
    const followUpId = `question-${parentNode.id}-${index}`;

    newNodes.push({
      id: followUpId,
      type: 'questionNode',
      data: {
        label: question,
        isExpanded: false
      },
      position: { x: 0, y: 0 }, // Will be layouted by Dagre
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });

    newEdges.push({
      id: `edge-${parentNode.id}-${followUpId}`,
      source: parentNode.id,
      target: followUpId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'rgba(255, 255, 255, 0.3)' }
    });
  });

  return { nodes: newNodes, edges: newEdges };
}
