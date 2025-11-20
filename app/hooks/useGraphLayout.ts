import { Node, Edge, Position } from '@xyflow/react';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 600;
const nodeHeight = 500;
const questionNodeWidth = 300;
const questionNodeHeight = 100;

export function useGraphLayout() {
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

  return {
    getLayoutedElements,
    nodeWidth,
    nodeHeight,
    questionNodeWidth,
    questionNodeHeight
  };
}
