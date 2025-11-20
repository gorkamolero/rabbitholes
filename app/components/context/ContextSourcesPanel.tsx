'use client';

import { useState } from 'react';
import { Node } from '@xyflow/react';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';

interface ContextSourcesPanelProps {
  nodeId: string;
  currentSources: string[];
  availableNodes: Node[];
  onUpdateSources: (sources: string[]) => void;
}

export function ContextSourcesPanel({
  nodeId,
  currentSources,
  availableNodes,
  onUpdateSources,
}: ContextSourcesPanelProps) {
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(currentSources)
  );

  const toggleSource = (sourceId: string) => {
    const newSources = new Set(selectedSources);
    if (newSources.has(sourceId)) {
      newSources.delete(sourceId);
    } else {
      newSources.add(sourceId);
    }
    setSelectedSources(newSources);
    onUpdateSources(Array.from(newSources));
  };

  const estimatedTokens = Array.from(selectedSources).reduce((acc, sourceId) => {
    const node = availableNodes.find(n => n.id === sourceId);
    return acc + ((node?.data.content?.length || 0) / 4);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Context Sources</CardTitle>
          <Badge variant="secondary">~{Math.round(estimatedTokens)} tokens</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {availableNodes
              .filter(n => n.id !== nodeId)
              .map(node => (
                <label
                  key={node.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSources.has(node.id)}
                    onCheckedChange={() => toggleSource(node.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{node.data.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {node.data.content || 'No content'}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round((node.data.content?.length || 0) / 4)}
                  </Badge>
                </label>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
