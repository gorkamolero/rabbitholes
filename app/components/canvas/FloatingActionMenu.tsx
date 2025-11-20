'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { Plus, X } from 'lucide-react';
import { NodeType } from '@/app/lib/nodeTypes';
import { NodeTypeButton } from './NodeTypeButton';

interface FloatingActionMenuProps {
  onCreateNode: (type: NodeType) => void;
}

export function FloatingActionMenu({ onCreateNode }: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = (type: NodeType) => {
    onCreateNode(type);
    setIsOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-8 right-8 z-50">
        {isOpen && (
          <div className="mb-4 flex flex-col gap-2 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
            <NodeTypeButton type={NodeType.CHAT} onClick={() => handleCreate(NodeType.CHAT)} />
            <NodeTypeButton type={NodeType.NOTE} onClick={() => handleCreate(NodeType.NOTE)} />
            <NodeTypeButton type={NodeType.QUERY} onClick={() => handleCreate(NodeType.QUERY)} />
            <NodeTypeButton type={NodeType.THOUGHT} onClick={() => handleCreate(NodeType.THOUGHT)} />
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-110 transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-8 w-8 transition-transform rotate-0" />
              ) : (
                <Plus className="h-8 w-8 transition-transform rotate-0 hover:rotate-90" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
            <p>{isOpen ? 'Close menu' : 'Create new node'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
