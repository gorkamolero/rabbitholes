import { Node } from '@xyflow/react';
import { searchRabbitHole } from '../../services/api';

interface ImageData {
  url: string;
  thumbnail: string;
  description: string;
}

interface Source {
  title: string;
  url: string;
  uri: string;
}

interface SearchResponse {
  response: string;
  followUpQuestions: string[];
  sources: Source[];
  images: ImageData[];
  contextualQuery: string;
}

interface ConversationMessage {
  user?: string;
  assistant?: string;
}

export function createLoadingNode(query: string, nodeWidth: number, nodeHeight: number): Node {
  return {
    id: 'main',
    type: 'mainNode',
    data: {
      label: query,
      content: 'Loading...',
      images: [],
      sources: [],
      isExpanded: true
    },
    position: { x: 0, y: 0 },
    style: {
      width: nodeWidth,
      height: nodeHeight,
      minHeight: nodeHeight,
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      cursor: 'default'
    }
  };
}

export async function performInitialSearch(
  query: string,
  conversationHistory: ConversationMessage[],
  currentConcept: string,
  getFollowUpMode: () => string
): Promise<SearchResponse> {
  const followUpMode = getFollowUpMode();
  return await searchRabbitHole({
    query,
    previousConversation: conversationHistory,
    concept: currentConcept,
    followUpMode: followUpMode as 'expansive' | 'focused'
  });
}

export function createMainNodeFromResponse(
  loadingNode: Node,
  response: SearchResponse,
  query: string
): Node {
  return {
    ...loadingNode,
    data: {
      label: response.contextualQuery || query,
      content: response.response,
      images: response.images?.map((img: ImageData) => img.url),
      sources: response.sources,
      isExpanded: true
    }
  };
}
