import { useState, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { NodeType } from '../lib/nodeTypes';

export function useNodeCreation() {
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);

  const createNode = useCallback((
    nodeType: NodeType,
    position: { x: number; y: number }
  ): Node => {
    const nodeId = `${nodeType}-${Date.now()}`;

    return {
      id: nodeId,
      type: nodeType,
      data: {
        label: nodeType === NodeType.NOTE ? 'Untitled Note' :
               nodeType === NodeType.CHAT ? 'New Chat' :
               nodeType === NodeType.QUERY ? 'Research Query' : 'New Node',
        content: '',
        conversationThread: [],
      },
      position,
    };
  }, []);

  const handleCreateNode = useCallback((
    nodeType: NodeType,
    position?: { x: number; y: number },
    onNodeCreated?: (node: Node) => void
  ) => {
    // If no position provided, enter crosshair mode for click-to-place
    if (!position) {
      setSelectedNodeType(nodeType);
      return null;
    }

    const newNode = createNode(nodeType, position);
    setSelectedNodeType(null); // Clear crosshair mode

    if (onNodeCreated) {
      onNodeCreated(newNode);
    }

    return newNode;
  }, [createNode]);

  return {
    selectedNodeType,
    setSelectedNodeType,
    createNode,
    handleCreateNode,
  };
}
