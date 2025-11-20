'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
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
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="mb-4 flex flex-col gap-2 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
          <NodeTypeButton type={NodeType.CHAT} onClick={() => handleCreate(NodeType.CHAT)} />
          <NodeTypeButton type={NodeType.NOTE} onClick={() => handleCreate(NodeType.NOTE)} />
          <NodeTypeButton type={NodeType.QUERY} onClick={() => handleCreate(NodeType.QUERY)} />
          <NodeTypeButton type={NodeType.THOUGHT} onClick={() => handleCreate(NodeType.THOUGHT)} />
        </div>
      )}
      <Button
        size="lg"
        className="h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-8 w-8" /> : <Plus className="h-8 w-8" />}
      </Button>
    </div>
  );
}
