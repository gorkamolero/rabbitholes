'use client';

import { useState, useEffect } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/app/components/ui/command';

interface CanvasSearchProps {
  nodes: Node[];
}

export function CanvasSearch({ nodes }: CanvasSearchProps) {
  const [open, setOpen] = useState(false);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const goToNode = (nodeId: string) => {
    fitView({ nodes: [{ id: nodeId }], duration: 400, padding: 0.3 });
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search nodes..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Nodes">
          {nodes.map((node) => (
            <CommandItem
              key={node.id}
              onSelect={() => goToNode(node.id)}
            >
              <span className="font-medium">{node.data.label}</span>
              <span className="ml-2 text-sm text-muted-foreground truncate">
                {node.data.content?.slice(0, 60)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
