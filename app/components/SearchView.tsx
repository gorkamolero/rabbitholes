'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import RabbitFlow from './RabbitFlow';
import { NodeCreationModal } from './NodeCreationModal';
import { EmptyCanvasWelcome } from './canvas/EmptyCanvasWelcome';
import { FloatingActionMenu } from './canvas/FloatingActionMenu';
import { useExplorationMode } from '../hooks/useExplorationMode';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useCanvasManagement } from '../hooks/useCanvasManagement';
import { useGraphLayout } from '../hooks/useGraphLayout';
import { useNodeInteractions } from '../hooks/useNodeInteractions';
import { useModalHandlers } from '../hooks/useModalHandlers';
import { Toolbar } from './SearchView/Toolbar';
import { SaveStatusIndicator } from './SearchView/SaveStatusIndicator';
import { createLoadingNode, performInitialSearch, createMainNodeFromResponse } from './SearchView/InitialSearchHandler';
import { nodeTypes } from './SearchView/nodeTypes';
import type { ConversationMessage, SearchResponse, ImageData } from './SearchView/types';
import { createCanvas } from '../lib/db/repository';
import { NodeType } from '../lib/nodeTypes';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentConcept] = useState<string>('');

  // Custom hooks
  const { explorationMode, setExplorationMode, getFollowUpMode } = useExplorationMode('hybrid');
  const { selectedNodeType, setSelectedNodeType, createNode: createNodeFromType } = useNodeCreation();
  const { getLayoutedElements, nodeWidth, nodeHeight, questionNodeWidth } = useGraphLayout();

  // Canvas persistence
  const {
    currentCanvasId,
    saving,
    lastSaved,
    handleNewCanvas,
    handleLoadCanvas,
    handleSaveAs,
  } = useCanvasManagement(nodes, edges, setNodes, setEdges, setConversationHistory);

  // Node interactions hook
  const { handleNodeClick, activeRequestRef } = useNodeInteractions(
    nodes,
    edges,
    setNodes,
    setEdges,
    conversationHistory,
    setConversationHistory,
    setIsLoading,
    getFollowUpMode,
    getLayoutedElements,
    nodeWidth,
    nodeHeight
  );

  // Modal handlers hook
  const {
    isModalOpen,
    setIsModalOpen,
    suggestions,
    isLoadingSuggestions,
    handleConnectEnd,
    handleRequestSuggestions,
    createNodeFromQuestion
  } = useModalHandlers(
    nodes,
    setNodes,
    setEdges,
    conversationHistory,
    setConversationHistory,
    setIsLoading,
    getLayoutedElements,
    questionNodeWidth,
    activeRequestRef
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onCreateNote: () => handleCreateNode(NodeType.NOTE),
    onCreateChat: () => handleCreateNode(NodeType.CHAT),
    onCreateQuery: () => handleCreateNode(NodeType.QUERY),
  });

  useEffect(() => {
    const activeRef = activeRequestRef.current;
    return () => {
      Object.values(activeRef).forEach(controller => {
        if (controller) {
          controller.abort();
        }
      });
    };
  }, [activeRequestRef]);

  // Handle manual node creation
  const handleCreateNode = (nodeType: NodeType, position?: { x: number; y: number }) => {
    // If no position provided, create at default center position
    const defaultPosition = position || {
      x: window.innerWidth / 2 - 150,  // Center horizontally (node width ~300px)
      y: window.innerHeight / 2 - 50   // Center vertically (node height ~100px)
    };

    const newNode = createNodeFromType(nodeType, defaultPosition);
    setNodes((prevNodes) => [...prevNodes, newNode]);
    setSelectedNodeType(null); // Clear crosshair mode if it was set
  };

  // Handle node creation at specific position (from context menu)
  const handleCreateNodeAtPosition = (nodeType: NodeType, position: { x: number; y: number }) => {
    handleCreateNode(nodeType, position);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const loadingNode = createLoadingNode(query, nodeWidth, nodeHeight);
      setNodes([loadingNode]);
      setEdges([]);

      const response = await performInitialSearch(query, conversationHistory, currentConcept, getFollowUpMode);
      setSearchResult(response);

      const mainNode = createMainNodeFromResponse(loadingNode, response, query);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements([mainNode], []);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      // Auto-create and save as new canvas if not already saved
      if (!currentCanvasId) {
        const canvas = await createCanvas(query);
        handleSaveAs(query);
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
      <Toolbar
        currentCanvasId={currentCanvasId}
        onLoadCanvas={handleLoadCanvas}
        onNewCanvas={handleNewCanvas}
        onSaveAs={handleSaveAs}
        explorationMode={explorationMode}
        onExplorationModeChange={setExplorationMode}
      />
      <SaveStatusIndicator
        currentCanvasId={currentCanvasId}
        saving={saving}
        lastSaved={lastSaved}
      />
      <RabbitFlow
        initialNodes={nodes}
        initialEdges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onConnectEnd={handleConnectEnd}
        onCreateNodeAtPosition={handleCreateNodeAtPosition}
        selectedNodeType={selectedNodeType}
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
