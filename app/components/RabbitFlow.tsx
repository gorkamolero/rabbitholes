'use client';

import React, { useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
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
import { ContextualEdge } from './edges/ContextualEdge';

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

const edgeTypes: EdgeTypes = {
  contextual: ContextualEdge,
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

  // Sync nodes and edges from parent, but preserve manual positioning
  React.useEffect(() => {
    // Only update if nodes/edges actually changed (not just reference)
    setNodes((currentNodes) => {
      // If no current nodes, layout the initial nodes
      if (currentNodes.length === 0 && initialNodes.length > 0) {
        const { nodes: layoutedNodes } = getLayoutedElements(initialNodes, initialEdges);
        return layoutedNodes;
      }

      // If new nodes were added, merge them with existing nodes
      const currentIds = new Set(currentNodes.map(n => n.id));
      const newNodes = initialNodes.filter(n => !currentIds.has(n.id));

      if (newNodes.length > 0) {
        // Add new nodes without re-layouting existing ones
        return [...currentNodes, ...newNodes];
      }

      // If nodes were removed, filter them out
      const initialIds = new Set(initialNodes.map(n => n.id));
      const filteredNodes = currentNodes.filter(n => initialIds.has(n.id));

      if (filteredNodes.length !== currentNodes.length) {
        return filteredNodes;
      }

      return currentNodes;
    });

    setEdges(initialEdges);
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
            edgeTypes={edgeTypes}
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
