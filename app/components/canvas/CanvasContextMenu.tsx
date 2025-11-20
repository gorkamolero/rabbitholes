'use client';

import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuLabel,
} from '@/app/components/ui/context-menu';
import { MessageSquare, StickyNote, Search } from 'lucide-react';
import { NodeType, nodeTypeMetadata } from '@/app/lib/nodeTypes';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onCreateNode: (type: NodeType, position: { x: number; y: number }) => void;
  position: { x: number; y: number };
}

export function CanvasContextMenu({ children, onCreateNode, position }: CanvasContextMenuProps) {
  const nodeTypes = [
    { type: NodeType.NOTE, icon: StickyNote },
    { type: NodeType.CHAT, icon: MessageSquare },
    { type: NodeType.QUERY, icon: Search },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Create Node</ContextMenuLabel>
        <ContextMenuSeparator />
        {nodeTypes.map(({ type, icon: Icon }) => {
          const metadata = nodeTypeMetadata[type];
          return (
            <ContextMenuItem
              key={type}
              onClick={() => onCreateNode(type, position)}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{metadata.label}</div>
                <div className="text-xs text-muted-foreground">{metadata.description}</div>
              </div>
              <span className="text-lg">{metadata.icon}</span>
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}
