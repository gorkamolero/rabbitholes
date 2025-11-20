'use client';

import { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from '@xyflow/react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Link2, Link2Off, ArrowRight, ArrowLeftRight, Zap, Check, Plus } from 'lucide-react';

export type ConnectionType = 'leads-to' | 'related' | 'contradicts' | 'supports' | 'expands';

const connectionTypes: Record<ConnectionType, { icon: any, color: string, label: string }> = {
  'leads-to': { icon: ArrowRight, color: '#3b82f6', label: 'Leads to' },
  'related': { icon: ArrowLeftRight, color: '#8b5cf6', label: 'Related to' },
  'contradicts': { icon: Zap, color: '#ef4444', label: 'Contradicts' },
  'supports': { icon: Check, color: '#10b981', label: 'Supports' },
  'expands': { icon: Plus, color: '#f59e0b', label: 'Expands on' },
};

export function ContextualEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  ...props
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [sharesContext, setSharesContext] = useState(data?.sharesContext ?? true);
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    data?.connectionType || 'leads-to'
  );

  const typeConfig = connectionTypes[connectionType];
  const TypeIcon = typeConfig.icon;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const updateEdgeData = (updates: any) => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                ...edge.data,
                ...updates,
              },
            }
          : edge
      )
    );
  };

  const handleContextToggle = () => {
    const newValue = !sharesContext;
    setSharesContext(newValue);
    updateEdgeData({ sharesContext: newValue });
  };

  const handleTypeChange = (newType: ConnectionType) => {
    setConnectionType(newType);
    updateEdgeData({ connectionType: newType });
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: sharesContext ? typeConfig.color : '#666',
          strokeWidth: 2,
          opacity: sharesContext ? 1 : 0.5,
        }}
        {...props}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex gap-1"
        >
          <Button
            size="sm"
            variant={sharesContext ? "default" : "outline"}
            className="h-8 w-8 p-0"
            onClick={handleContextToggle}
          >
            {sharesContext ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 px-2">
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(connectionTypes).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleTypeChange(key as ConnectionType)}
                >
                  <config.icon className="mr-2 h-4 w-4" />
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
