import { useCallback, useState } from 'react';
import { Node, Connection, addEdge, Edge, useReactFlow } from '@xyflow/react';
import { usePostHog } from 'posthog-js/react';
import { NodeType } from '../lib/nodeTypes';

export function useRabbitFlowHandlers(
  nodes: Node[],
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void,
  onNodeClick?: (node: Node) => void,
  onConnectEnd?: (event: MouseEvent | TouchEvent, connectionState: { fromNode: Node | null }) => void,
  onCreateNodeAtPosition?: (type: NodeType, position: { x: number; y: number }) => void,
  selectedNodeType?: NodeType | null
) {
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();
  const posthog = usePostHog();

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    // Don't prevent default - let Radix UI handle the context menu
    // Just track the position for node creation
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleCreateNode = useCallback(
    (type: NodeType, screenPosition: { x: number; y: number }) => {
      if (onCreateNodeAtPosition) {
        const flowPosition = screenToFlowPosition({
          x: screenPosition.x,
          y: screenPosition.y,
        });
        onCreateNodeAtPosition(type, flowPosition);
      }
    },
    [onCreateNodeAtPosition, screenToFlowPosition]
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true
          },
          eds
        )
      ),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (posthog) {
        posthog.capture('node_clicked', {
          nodeId: node.id,
          nodeType: node.type,
          label: node.data?.label || '',
          position: node.position,
        });
      }

      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick, posthog]
  );

  const handleConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: { isValid: boolean; fromNode: { id: string } | null }) => {
      if (!connectionState.isValid && connectionState.fromNode) {
        const fromNode = nodes.find(n => n.id === connectionState.fromNode?.id);
        if (fromNode && onConnectEnd) {
          onConnectEnd(event, { fromNode });
        }
      }
    },
    [nodes, onConnectEnd]
  );

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedNodeType || !onCreateNodeAtPosition) return;

      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onCreateNodeAtPosition(selectedNodeType, flowPosition);
    },
    [selectedNodeType, onCreateNodeAtPosition, screenToFlowPosition]
  );

  return {
    contextMenuPosition,
    handleContextMenu,
    handleCreateNode,
    onConnect,
    handleNodeClick,
    handleConnectEnd,
    handlePaneClick
  };
}
