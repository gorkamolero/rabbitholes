'use client';

import { Node } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/app/components/ui/context-menu";
import {
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Search,
  CheckCheck,
  Link2
} from "lucide-react";

interface NodeContextMenuProps {
  children: React.ReactNode;
  node: Node;
  onAction: (action: string, node: Node) => void;
}

export function NodeContextMenu({
  children,
  node,
  onAction
}: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onAction('raise-questions', node)}>
          <HelpCircle className="mr-2 h-4 w-4" />
          What questions does this raise?
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('find-contradictions', node)}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Find contradicting viewpoints
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('suggest-connections', node)}>
          <Link2 className="mr-2 h-4 w-4" />
          Suggest connections
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onAction('expand', node)}>
          <Lightbulb className="mr-2 h-4 w-4" />
          Expand this idea
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('find-evidence', node)}>
          <Search className="mr-2 h-4 w-4" />
          Find supporting evidence
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('fact-check', node)}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Fact-check this claim
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
