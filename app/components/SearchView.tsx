'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Node, Edge, MarkerType, Position } from '@xyflow/react';
import dagre from 'dagre';
import RabbitFlow from './RabbitFlow';
import MainNode from './nodes/MainNode';
import { ChatNode } from './nodes/ChatNode';
import { NoteNode } from './nodes/NoteNode';
import { searchRabbitHole, getSuggestions } from '../services/api';
import { NodeCreationModal } from './NodeCreationModal';
import { CanvasManager } from './CanvasManager';
import { EmptyCanvasWelcome } from './canvas/EmptyCanvasWelcome';
import { FloatingActionMenu } from './canvas/FloatingActionMenu';
import { useCurrentCanvas, useAutoSave } from '../hooks/useCanvasSync';
import { createCanvas, loadCanvasState } from '../lib/db/repository';
import { NodeType } from '../lib/nodeTypes';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 600;
const nodeHeight = 500;
const questionNodeWidth = 300;
const questionNodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 800,
    ranksep: 500,
    marginx: 100,
    align: 'DL',
    ranker: 'tight-tree'
  });

  const allNodes = dagreGraph.nodes();
  allNodes.forEach(node => dagreGraph.removeNode(node));

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.id === 'main' ? nodeWidth : questionNodeWidth,
      height: node.id === 'main' ? nodeHeight : questionNodeHeight
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.id === 'main' ? nodeWidth / 2 : questionNodeWidth / 2),
        y: nodeWithPosition.y - (node.id === 'main' ? nodeHeight / 2 : questionNodeHeight / 2)
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right
    };
  });

  return { nodes: newNodes, edges };
};

interface Source {
  title: string;
  url: string;
  uri: string;
  author: string;
  image: string;
}

interface ImageData {
  url: string;
  thumbnail: string;
  description: string;
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

const nodeTypes = {
  mainNode: MainNode,
  chat: ChatNode,
  note: NoteNode,
};

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentConcept] = useState<string>('');
  const activeRequestRef = useRef<{ [key: string]: AbortController | null }>({});

  // Modal state for drag-to-create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSourceNode, setModalSourceNode] = useState<Node | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Canvas persistence
  const { currentCanvasId, setCurrentCanvasId } = useCurrentCanvas();
  const { saving, lastSaved } = useAutoSave(currentCanvasId, nodes, edges, {
    enabled: currentCanvasId !== null,
    debounceMs: 2000
  });

  // Removed deck refs and state - no longer needed

  useEffect(() => {
    const activeRef = activeRequestRef.current;
    return () => {
      Object.values(activeRef).forEach(controller => {
        if (controller) {
          controller.abort();
        }
      });
    };
  }, []);

  const handleNodeClick = async (node: Node) => {
    if (!node.id.startsWith('question-') || node.data.isExpanded) return;

    // Check if there are any active requests
    const hasActiveRequests = Object.values(activeRequestRef.current).some(controller => controller !== null);
    if (hasActiveRequests) return;

    if (activeRequestRef.current[node.id]) {
      activeRequestRef.current[node.id]?.abort();
    }

    const abortController = new AbortController();
    activeRequestRef.current[node.id] = abortController;

    const questionText = String(node.data.label || '');
    setIsLoading(true);

    try {
      const lastMainNode = nodes.find(n => n.type === 'mainNode');
      if (lastMainNode) {
        const newHistoryEntry: ConversationMessage = {
          user: String(lastMainNode.data.label || ''),
          assistant: String(lastMainNode.data.content || '')
        };
        setConversationHistory(prev => [...prev, newHistoryEntry]);
      }

      setNodes(prevNodes => prevNodes.map(n => {
        if (n.id === node.id) {
          return {
            ...n,
            type: 'mainNode',
            style: {
              ...n.style,
              width: nodeWidth,
              height: nodeHeight
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

      const response = await searchRabbitHole({
        query: questionText,
        previousConversation: conversationHistory,
        concept: currentConcept,
        followUpMode: 'expansive'
      }, abortController.signal);

      if (activeRequestRef.current[node.id] === abortController) {
        // Transform the clicked node into a mainNode with the response content
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

        // Relayout the graph with the updated node (no automatic children)
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
              data: {
                ...node.data,
                isExpanded: false
              },
              style: {
                ...node.style,
                opacity: 1
              }
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
  };

  // Handle drag-to-create functionality
  const handleConnectEnd = (_event: MouseEvent | TouchEvent, connectionState: { fromNode: Node | null }) => {
    if (connectionState.fromNode) {
      setModalSourceNode(connectionState.fromNode);
      setIsModalOpen(true);
      setSuggestions([]);
    }
  };

  // Handle manual node creation
  const handleCreateNode = (nodeType: NodeType, position?: { x: number; y: number }) => {
    const nodeId = `${nodeType}-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: nodeType,
      data: {
        label: nodeType === NodeType.NOTE ? 'Untitled Note' : 'New Chat',
        content: '',
        conversationThread: [],
      },
      position: position || {
        // Center of viewport if no position provided
        x: window.innerWidth / 2 - 200,
        y: window.innerHeight / 2 - 200,
      },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  // Handle node creation at specific position (from context menu)
  const handleCreateNodeAtPosition = (nodeType: NodeType, position: { x: number; y: number }) => {
    handleCreateNode(nodeType, position);
  };

  const handleRequestSuggestions = async () => {
    if (!modalSourceNode) return;

    setIsLoadingSuggestions(true);
    try {
      // Build conversation history for context
      const historyForSuggestions = conversationHistory.map(entry => [
        { role: 'user' as const, content: entry.user || '' },
        { role: 'assistant' as const, content: entry.assistant || '' }
      ]).flat();

      const response = await getSuggestions({
        query: String(modalSourceNode.data.label || ''),
        conversationHistory: historyForSuggestions,
        mode: 'expansive'
      });

      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const createNodeFromQuestion = async (question: string) => {
    if (!modalSourceNode) return;

    setIsModalOpen(false);
    setIsLoading(true);

    const abortController = new AbortController();
    const nodeId = `question-${modalSourceNode.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    activeRequestRef.current[nodeId] = abortController;

    try {
      // Update conversation history with the source node's content
      const newHistoryEntry: ConversationMessage = {
        user: String(modalSourceNode.data.label || ''),
        assistant: String(modalSourceNode.data.content || '')
      };
      setConversationHistory(prev => [...prev, newHistoryEntry]);

      // Create a temporary question node
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

      // Create edge connecting source node to new question node
      const newEdge: Edge = {
        id: `edge-${nodeId}`,
        source: modalSourceNode.id,
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

      // Add the node and edge, then relayout
      setEdges(prevEdges => {
        const allEdges = [...prevEdges, newEdge];
        const allNodes = [...nodes, tempQuestionNode];
        const { nodes: layoutedNodes } = getLayoutedElements(allNodes, allEdges);
        setNodes(layoutedNodes);
        return allEdges;
      });
    } catch (error) {
      console.error('Failed to create node:', error);
    } finally {
      if (activeRequestRef.current[nodeId] === abortController) {
        activeRequestRef.current[nodeId] = null;
        setIsLoading(false);
      }
    }
  };

  // Canvas management handlers
  const handleNewCanvas = async () => {
    setNodes([]);
    setEdges([]);
    setSearchResult(null);
    setConversationHistory([]);
    setCurrentCanvasId(null);
  };

  const handleLoadCanvas = async (canvasId: string) => {
    try {
      const state = await loadCanvasState(canvasId);
      setNodes(state.nodes);
      setEdges(state.edges);
      setCurrentCanvasId(canvasId);
      // If there are nodes, show the result view
      if (state.nodes.length > 0) {
        setSearchResult({ response: '', followUpQuestions: [], sources: [], images: [], contextualQuery: '' });
      }
    } catch (error) {
      console.error('Failed to load canvas:', error);
      alert('Failed to load canvas');
    }
  };

  const handleSaveAs = async (name: string) => {
    try {
      const canvas = await createCanvas(name);
      setCurrentCanvasId(canvas.id);
      // Save will happen automatically via useAutoSave
    } catch (error) {
      console.error('Failed to save canvas:', error);
      alert('Failed to save canvas');
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const loadingNode: Node = {
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

      setNodes([loadingNode]);
      setEdges([]);

      const response = await searchRabbitHole({
        query,
        previousConversation: conversationHistory,
        concept: currentConcept,
        followUpMode: 'expansive'
      });
      setSearchResult(response);

      const mainNode: Node = {
        ...loadingNode,
        data: {
          label: response.contextualQuery || query,
          content: response.response,
          images: response.images?.map((img: ImageData) => img.url),
          sources: response.sources,
          isExpanded: true
        }
      };

      // No automatic follow-up nodes - users will drag to create them
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        [mainNode],
        []
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      // Auto-create and save as new canvas if not already saved
      if (!currentCanvasId) {
        const canvas = await createCanvas(query);
        setCurrentCanvasId(canvas.id);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // No need for the mystical deck UI - EmptyCanvasWelcome handles empty state

  return (
    <div className="min-h-screen bg-background">
      <CanvasManager
        currentCanvasId={currentCanvasId}
        onLoadCanvas={handleLoadCanvas}
        onNewCanvas={handleNewCanvas}
        onSaveAs={handleSaveAs}
      />
      {/* Save Status Indicator */}
      {currentCanvasId && (
        <div className="fixed bottom-6 right-6 z-40 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-white/60 flex items-center gap-2">
          {saving ? (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
            </>
          ) : null}
        </div>
      )}
      <RabbitFlow
        initialNodes={nodes}
        initialEdges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onConnectEnd={handleConnectEnd}
        onCreateNodeAtPosition={handleCreateNodeAtPosition}
      />

      {/* Show welcome screen when canvas is empty */}
      {nodes.length === 0 && (
        <EmptyCanvasWelcome onAction={handleCreateNode} />
      )}

      {/* Floating action menu - always visible */}
      <FloatingActionMenu onCreateNode={handleCreateNode} />

      <NodeCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateWithSuggestions={handleRequestSuggestions}
        onCreateCustom={createNodeFromQuestion}
        suggestions={suggestions}
        isLoadingSuggestions={isLoadingSuggestions}
      />
    </div>
  );
};

export default SearchView;
