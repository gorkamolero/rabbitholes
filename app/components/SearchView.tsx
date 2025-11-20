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
import { useConnectionSuggestions } from '../hooks/useConnectionSuggestions';
import { Toolbar } from './SearchView/Toolbar';
import { SaveStatusIndicator } from './SearchView/SaveStatusIndicator';
import { SuggestionPanel } from './ai/SuggestionPanel';
import { ConnectionSuggestionsOverlay } from './ai/ConnectionSuggestionsOverlay';
import { createLoadingNode, performInitialSearch, createMainNodeFromResponse } from './SearchView/InitialSearchHandler';
import { nodeTypes } from './SearchView/nodeTypes';
import type { ConversationMessage, SearchResponse, ImageData } from './SearchView/types';
import { createCanvas } from '../lib/db/repository';
import { NodeType } from '../lib/nodeTypes';
import { toast } from 'sonner';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentConcept] = useState<string>('');

  // Phase 2: AI suggestion state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Custom hooks
  const { explorationMode, setExplorationMode, getFollowUpMode } = useExplorationMode('hybrid');
  const { selectedNodeType, setSelectedNodeType, createNode: createNodeFromType } = useNodeCreation();
  const { getLayoutedElements, nodeWidth, nodeHeight, questionNodeWidth } = useGraphLayout();

  // Phase 2: Connection suggestions
  const {
    suggestions: connectionSuggestions,
    isLoading: isLoadingConnections,
    acceptSuggestion: acceptConnectionSuggestion,
    dismissSuggestion: dismissConnectionSuggestion,
    refreshSuggestions: refreshConnectionSuggestions,
  } = useConnectionSuggestions(nodes, edges, explorationMode !== 'manual');

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
    // If no position provided, enter crosshair mode for click-to-place
    if (!position) {
      setSelectedNodeType(nodeType);
      return;
    }

    const newNode = createNodeFromType(nodeType, position);
    setNodes((prevNodes) => [...prevNodes, newNode]);
    setSelectedNodeType(null); // Clear crosshair mode
  };

  // Handle node creation at specific position (from context menu)
  const handleCreateNodeAtPosition = (nodeType: NodeType, position: { x: number; y: number }) => {
    handleCreateNode(nodeType, position);
  };

  // Phase 2: Handle AI suggestion acceptance
  const handleAcceptSuggestion = async (suggestion: any) => {
    toast.success('Suggestion accepted');
    // Implementation will depend on suggestion type
    if (suggestion.type === 'question') {
      createNodeFromQuestion(suggestion.content);
    } else if (suggestion.type === 'expansion') {
      createNodeFromQuestion(suggestion.content);
    }
  };

  // Phase 2: Handle suggestion dismissal
  const handleDismissSuggestion = (suggestion: any) => {
    toast.info('Suggestion dismissed');
  };

  // Phase 2: Handle suggestion modification
  const handleModifySuggestion = (suggestion: any) => {
    // Open modal with pre-filled content
    createNodeFromQuestion(suggestion.content);
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
        onNodeClick={(node) => {
          handleNodeClick(node);
          setSelectedNode(node);
        }}
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

      {/* Phase 2: AI Suggestion Panel */}
      <SuggestionPanel
        currentNode={selectedNode}
        allNodes={nodes}
        onAccept={handleAcceptSuggestion}
        onDismiss={handleDismissSuggestion}
        onModify={handleModifySuggestion}
        explorationMode={explorationMode}
      />

      {/* Phase 2: Connection Suggestions Overlay */}
      <ConnectionSuggestionsOverlay
        suggestions={connectionSuggestions}
        isLoading={isLoadingConnections}
        onAccept={acceptConnectionSuggestion}
        onDismiss={dismissConnectionSuggestion}
        onRefresh={refreshConnectionSuggestions}
        enabled={explorationMode !== 'manual'}
      />

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
