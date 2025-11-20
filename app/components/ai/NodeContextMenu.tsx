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
import {
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Search,
  CheckCheck,
  Link2,
  GitBranch,
  Sparkles,
  Trash2,
  Copy,
} from 'lucide-react';
import type { Node } from '@xyflow/react';

export type NodeContextAction =
  | 'raise-questions'
  | 'find-contradictions'
  | 'suggest-connections'
  | 'expand'
  | 'find-evidence'
  | 'fact-check'
  | 'branch'
  | 'duplicate'
  | 'delete';

interface NodeContextMenuProps {
  children: React.ReactNode;
  node: Node;
  onAction: (action: NodeContextAction, node: Node) => void;
  showAIActions?: boolean;
}

export function NodeContextMenu({
  children,
  node,
  onAction,
  showAIActions = true,
}: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Node Actions</ContextMenuLabel>
        <ContextMenuSeparator />

        {showAIActions && (
          <>
            <ContextMenuLabel className="text-xs text-muted-foreground flex items-center gap-2 px-2 py-1.5">
              <Sparkles className="h-3 w-3" />
              AI Actions
            </ContextMenuLabel>

            <ContextMenuItem
              onClick={() => onAction('raise-questions', node)}
              className="cursor-pointer"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              What questions does this raise?
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onAction('find-contradictions', node)}
              className="cursor-pointer"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Find contradicting viewpoints
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onAction('suggest-connections', node)}
              className="cursor-pointer"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Suggest connections
            </ContextMenuItem>

            <ContextMenuSeparator />

            <ContextMenuItem
              onClick={() => onAction('expand', node)}
              className="cursor-pointer"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Expand this idea
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onAction('find-evidence', node)}
              className="cursor-pointer"
            >
              <Search className="mr-2 h-4 w-4" />
              Find supporting evidence
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onAction('fact-check', node)}
              className="cursor-pointer"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Fact-check this claim
            </ContextMenuItem>

            <ContextMenuSeparator />
          </>
        )}

        <ContextMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
          Node Actions
        </ContextMenuLabel>

        <ContextMenuItem
          onClick={() => onAction('branch', node)}
          className="cursor-pointer"
        >
          <GitBranch className="mr-2 h-4 w-4" />
          Branch from here
        </ContextMenuItem>

        <ContextMenuItem
          onClick={() => onAction('duplicate', node)}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          Duplicate node
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => onAction('delete', node)}
          className="cursor-pointer text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
