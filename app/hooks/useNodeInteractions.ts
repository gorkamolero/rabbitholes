import { useRef, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { handleNodeExpansion } from '../components/SearchView/SearchHandlers';
import type { ConversationMessage, ImageData } from '../components/SearchView/types';

export function useNodeInteractions(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void,
  setEdges: (edges: Edge[]) => void,
  conversationHistory: ConversationMessage[],
  setConversationHistory: (history: ConversationMessage[] | ((prev: ConversationMessage[]) => ConversationMessage[])) => void,
  setIsLoading: (loading: boolean) => void,
  getFollowUpMode: () => string,
  getLayoutedElements: (nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] },
  nodeWidth: number,
  nodeHeight: number
) {
  const activeRequestRef = useRef<{ [key: string]: AbortController | null }>({});

  const handleNodeClick = useCallback(async (node: Node) => {
    if (!node.id.startsWith('question-') || node.data.isExpanded) return;

    const hasActiveRequests = Object.values(activeRequestRef.current).some(controller => controller !== null);
    if (hasActiveRequests) return;

    if (activeRequestRef.current[node.id]) {
      activeRequestRef.current[node.id]?.abort();
    }

    const abortController = new AbortController();
    activeRequestRef.current[node.id] = abortController;
    setIsLoading(true);

    try {
      const response = await handleNodeExpansion(
        node,
        nodes,
        setNodes,
        setEdges,
        conversationHistory,
        setConversationHistory,
        getFollowUpMode,
        abortController
      );

      if (activeRequestRef.current[node.id] === abortController) {
        const questionText = String(node.data.label || '');
        const transformedNodes = nodes.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              type: 'mainNode',
              style: {
                ...n.style,
                width: nodeWidth,
                minHeight: '500px',
                background: '#1a1a1a',
                opacity: 1,
                cursor: 'default'
              },
              data: {
                label: response.contextualQuery || questionText,
                content: response.response,
                images: response.images?.map((img: ImageData) => img.url),
                sources: response.sources,
                isExpanded: true
              }
            };
          }
          return n;
        });

        const { nodes: finalLayoutedNodes } = getLayoutedElements(transformedNodes, edges);
        setNodes(finalLayoutedNodes);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError' && activeRequestRef.current[node.id] === abortController) {
        console.error('Failed to process node click:', error);
        setNodes(prevNodes => prevNodes.map(n => {
          if (n.id === node.id) {
            return {
              ...node,
              data: { ...node.data, isExpanded: false },
              style: { ...node.style, opacity: 1 }
            };
          }
          return n;
        }));
      }
    } finally {
      if (activeRequestRef.current[node.id] === abortController) {
        activeRequestRef.current[node.id] = null;
        setIsLoading(false);
      }
    }
  }, [nodes, edges, conversationHistory, setNodes, setEdges, setConversationHistory, setIsLoading, getFollowUpMode, getLayoutedElements, nodeWidth, nodeHeight]);

  return {
    handleNodeClick,
    activeRequestRef
  };
}
