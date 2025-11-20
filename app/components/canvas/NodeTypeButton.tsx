'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { NodeType, nodeTypeMetadata } from '@/app/lib/nodeTypes';

interface NodeTypeButtonProps {
  type: NodeType;
  onClick: () => void;
}

export function NodeTypeButton({ type, onClick }: NodeTypeButtonProps) {
  const metadata = nodeTypeMetadata[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className={`${metadata.color} ${metadata.hoverColor} text-white justify-start gap-3 h-12 transition-all hover:scale-105 hover:shadow-lg`}
          >
            <span className="text-xl">{metadata.icon}</span>
            <span className="font-medium">{metadata.label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[200px]" suppressHydrationWarning>
          <p>{metadata.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
