'use client';

import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  ConnectionLineType,
  Position,
  MiniMap,
  Connection,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';

import { usePostHog } from 'posthog-js/react';
import { CanvasContextMenu } from './canvas/CanvasContextMenu';
import { NodeType } from '../lib/nodeTypes';

interface RabbitFlowProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  nodeTypes: NodeTypes;
  onNodeClick?: (node: Node) => void;
  onConnectEnd?: (event: MouseEvent | TouchEvent, connectionState: { fromNode: Node | null }) => void;
  onCreateNodeAtPosition?: (type: NodeType, position: { x: number; y: number }) => void;
  selectedNodeType?: NodeType | null;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Check if any nodes are expanded
  const hasExpandedNodes = nodes.some(node => node.type === 'mainNode' && node.data.isExpanded);

  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 100,
    ranksep: hasExpandedNodes ? 200 : 100,  // Adjust vertical spacing based on expansion
    marginx: 200,
    marginy: hasExpandedNodes ? 200 : 100,
    align: 'UL',
    ranker: 'tight-tree'
  });

  // Add nodes to the graph with their actual dimensions
  nodes.forEach((node) => {
    const isMainNode = node.type === 'mainNode';
    dagreGraph.setNode(node.id, {
      width: isMainNode ? 600 : 300,
      height: isMainNode ? 500 : 100
    });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Apply layout
  dagre.layout(dagreGraph);

  // Get the positioned nodes
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isMainNode = node.type === 'mainNode';
    const width = isMainNode ? 600 : 300;
    const height = isMainNode ? 500 : 100;
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    };
  });

  return { nodes: newNodes, edges };
};

const RabbitFlowInner: React.FC<RabbitFlowProps> = ({
  initialNodes,
  initialEdges,
  nodeTypes,
  onNodeClick,
  onConnectEnd,
  onCreateNodeAtPosition,
  selectedNodeType
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  React.useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleCreateNode = useCallback(
    (type: NodeType, screenPosition: { x: number; y: number }) => {
      if (onCreateNodeAtPosition) {
        // Convert screen coordinates to flow coordinates
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
            type: ConnectionLineType.SmoothStep,
            animated: true
          },
          eds
        )
      ),
    [setEdges]
  );

  const posthog = usePostHog();

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
    [onNodeClick, posthog]  // important: add posthog to dependency array
  );

  const handleConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      // Only trigger if connection didn't complete to another node
      if (!connectionState.isValid && connectionState.fromNode) {
        const fromNode = nodes.find(n => n.id === connectionState.fromNode.nodeId);
        if (fromNode && onConnectEnd) {
          onConnectEnd(event, { fromNode });
        }
      }
    },
    [nodes, onConnectEnd]
  );

  // Handle click-to-create when in crosshair mode
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

  return (
    <div ref={reactFlowWrapper} style={{ width: '100vw', height: '100vh' }}>
      <CanvasContextMenu
        onCreateNode={handleCreateNode}
        position={contextMenuPosition}
      >
        <div style={{ width: '100%', height: '100%' }} onContextMenu={handleContextMenu}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectEnd={handleConnectEnd}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: 'rgba(255, 255, 255, 0.3)' }
            }}
            fitView
            // Infinite canvas configuration
            minZoom={0.1}
            maxZoom={2}
            translateExtent={[
              [-Infinity, -Infinity],
              [Infinity, Infinity]
            ]}
            nodeExtent={[
              [-Infinity, -Infinity],
              [Infinity, Infinity]
            ]}
            // Pan and zoom settings
            zoomOnScroll={true}
            panOnScroll={false}
            zoomOnPinch={true}
            preventScrolling={false}
            panOnDrag={true}
            zoomOnDoubleClick={false}
            style={{
              backgroundColor: '#000000',
              cursor: selectedNodeType ? 'crosshair' : 'default'
            }}
          >
            <Controls
              className="!bg-[#111111] !border-gray-800"
            />
            <MiniMap
              style={{
                backgroundColor: '#111111',
                border: '1px solid #333333',
                borderRadius: '4px',
              }}
              nodeColor="#666666"
              maskColor="rgba(0, 0, 0, 0.7)"
              className="!bottom-4 !right-4"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color="rgba(255, 255, 255, 0.05)"
            />
          </ReactFlow>
        </div>
      </CanvasContextMenu>
    </div>
  );
};

const RabbitFlow: React.FC<RabbitFlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <RabbitFlowInner {...props} />
    </ReactFlowProvider>
  );
};

export default RabbitFlow;
