'use client';

import { Button } from '@/app/components/ui/button';
import { GitBranch } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

interface BranchButtonProps {
  nodeId: string;
  conversationThread: any[];
  label: string;
}

export function BranchButton({
  nodeId,
  conversationThread,
  label
}: BranchButtonProps) {
  const { getNode, addNodes, addEdges } = useReactFlow();

  const createBranch = () => {
    const parentNode = getNode(nodeId);
    if (!parentNode) return;

    const newNodeId = `${nodeId}-branch-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'chat',
      position: {
        x: parentNode.position.x + 600,
        y: parentNode.position.y,
      },
      data: {
        label: `${label} (Branch)`,
        conversationThread: [...conversationThread],
      },
    };

    addNodes(newNode);
    addEdges({
      id: `${nodeId}-${newNodeId}`,
      source: nodeId,
      target: newNodeId,
      type: 'contextual',
      data: {
        sharesContext: true,
        connectionType: 'expands',
        isBranch: true,
      },
      animated: true,
      style: { strokeDasharray: '5,5', stroke: '#a855f6' },
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={createBranch}
      className="gap-1"
    >
      <GitBranch className="h-3 w-3" />
      Branch
    </Button>
  );
}
