'use client';

import React, { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import RabbitFlow from './RabbitFlow';
import { NodeCreationModal } from './NodeCreationModal';
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
import { nodeTypes } from './SearchView/nodeTypes';
import type { ConversationMessage } from './SearchView/types';
import { NodeType } from '../lib/nodeTypes';
import { SuggestionPanel, type Suggestion } from './ai/SuggestionPanel';
import { CanvasSearch } from './search/CanvasSearch';

const SearchView: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [_isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

  // Suggestion panel handlers
  const handleAcceptSuggestion = (suggestion: Suggestion) => {
    console.log('Accepted suggestion:', suggestion);
    // TODO: Implement suggestion acceptance logic
  };

  const handleDismissSuggestion = (suggestion: Suggestion) => {
    console.log('Dismissed suggestion:', suggestion);
  };

  const handleRefreshSuggestions = () => {
    console.log('Refresh suggestions requested');
  };

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

      {/* AI Suggestion Panel */}
      <SuggestionPanel
        currentNode={selectedNode}
        onAccept={handleAcceptSuggestion}
        onDismiss={handleDismissSuggestion}
        onRefresh={handleRefreshSuggestions}
      />

      {/* Canvas Search (Cmd+K) */}
      <CanvasSearch nodes={nodes} />
    </div>
  );
};

export default SearchView;
