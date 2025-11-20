'use client';

import React, { useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Position,
  ReactFlowProvider,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';

import { CanvasContextMenu } from './canvas/CanvasContextMenu';
import { NodeType } from '../lib/nodeTypes';
import { useRabbitFlowHandlers } from '../hooks/useRabbitFlowHandlers';
import { FlowConfig } from './RabbitFlow/FlowConfig';

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

  const hasExpandedNodes = nodes.some(node => node.type === 'mainNode' && node.data.isExpanded);

  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 100,
    ranksep: hasExpandedNodes ? 200 : 100,
    marginx: 200,
    marginy: hasExpandedNodes ? 200 : 100,
    align: 'UL',
    ranker: 'tight-tree'
  });

  nodes.forEach((node) => {
    const isMainNode = node.type === 'mainNode';
    dagreGraph.setNode(node.id, {
      width: isMainNode ? 600 : 300,
      height: isMainNode ? 500 : 100
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
    contextMenuPosition,
    handleContextMenu,
    handleCreateNode,
    onConnect,
    handleNodeClick,
    handleConnectEnd,
    handlePaneClick
  } = useRabbitFlowHandlers(
    nodes,
    setEdges,
    onNodeClick,
    onConnectEnd,
    onCreateNodeAtPosition,
    selectedNodeType
  );

  React.useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
            <FlowConfig />
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
