import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { requestSuggestions, createNodeAndEdgeFromQuestion } from '../components/SearchView/ModalHandlers';
import type { ConversationMessage } from '../components/SearchView/types';

export function useModalHandlers(
  nodes: Node[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void,
  conversationHistory: ConversationMessage[],
  setConversationHistory: (history: ConversationMessage[] | ((prev: ConversationMessage[]) => ConversationMessage[])) => void,
  setIsLoading: (loading: boolean) => void,
  getLayoutedElements: (nodes: Node[], edges: Edge[]) => { nodes: Node[]; edges: Edge[] },
  questionNodeWidth: number,
  activeRequestRef: React.MutableRefObject<{ [key: string]: AbortController | null }>
) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSourceNode, setModalSourceNode] = useState<Node | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleConnectEnd = useCallback((_event: MouseEvent | TouchEvent, connectionState: { fromNode: Node | null }) => {
    if (connectionState.fromNode) {
      setModalSourceNode(connectionState.fromNode);
      setIsModalOpen(true);
      setSuggestions([]);
    }
  }, []);

  const handleRequestSuggestions = useCallback(async () => {
    if (!modalSourceNode) return;

    setIsLoadingSuggestions(true);
    try {
      const suggestionsResult = await requestSuggestions(modalSourceNode, conversationHistory);
      setSuggestions(suggestionsResult);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [modalSourceNode, conversationHistory]);

  const createNodeFromQuestion = useCallback(async (question: string) => {
    if (!modalSourceNode) return;

    setIsModalOpen(false);
    setIsLoading(true);

    try {
      const newHistoryEntry: ConversationMessage = {
        user: String(modalSourceNode.data.label || ''),
        assistant: String(modalSourceNode.data.content || '')
      };
      setConversationHistory(prev => [...prev, newHistoryEntry]);

      const { node: tempQuestionNode, edge: newEdge } =
        createNodeAndEdgeFromQuestion(question, modalSourceNode, questionNodeWidth, activeRequestRef);

      setEdges(prevEdges => {
        const allEdges = [...prevEdges, newEdge];
        const allNodes = [...nodes, tempQuestionNode];
        const { nodes: layoutedNodes } = getLayoutedElements(allNodes, allEdges);
        setNodes(layoutedNodes);
        return allEdges;
      });
    } catch (error) {
      console.error('Failed to create node:', error);
      setIsLoading(false);
    }
  }, [modalSourceNode, nodes, conversationHistory, setNodes, setEdges, setConversationHistory, setIsLoading, getLayoutedElements, questionNodeWidth, activeRequestRef]);

  return {
    isModalOpen,
    setIsModalOpen,
    modalSourceNode,
    suggestions,
    isLoadingSuggestions,
    handleConnectEnd,
    handleRequestSuggestions,
    createNodeFromQuestion
  };
}
