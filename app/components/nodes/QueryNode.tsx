'use client';

import { type Node, type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Search, ExternalLink } from 'lucide-react';

interface QueryNodeDataType extends Record<string, unknown> {
  label: string;
  query?: string;
  response?: string;
  sources?: Array<{ title: string; url: string }>;
  isExecuted?: boolean;
}

type QueryNodeType = Node<QueryNodeDataType>;

export function QueryNode({ id, data }: NodeProps<QueryNodeType>) {
  const { updateNodeData } = useReactFlow();
  const [query, setQuery] = useState(data.query || '');
  const [isLoading, setIsLoading] = useState(false);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    updateNodeData(id, { query, isExecuted: false });

    try {
      // Call the search API
      const response = await fetch('/api/rabbitholes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          previousConversation: [],
          followUpMode: 'focused',
        }),
      });

      const result = await response.json();

      updateNodeData(id, {
        query,
        response: result.response,
        sources: result.sources || [],
        isExecuted: true,
      });
    } catch (error) {
      console.error('Query error:', error);
      updateNodeData(id, {
        query,
        response: 'Error executing query. Please try again.',
        isExecuted: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, id, updateNodeData]);

  return (
    <Card className="w-[500px] shadow-xl border-purple-600/30">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">
            <Input
              value={data.label}
              onChange={(e) => updateNodeData(id, { label: e.target.value })}
              className="border-0 bg-transparent focus-visible:ring-0 p-0 h-auto text-lg font-semibold"
              placeholder="Query title..."
            />
          </CardTitle>
        </div>
        <CardDescription>Research question with AI search</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {!data.isExecuted ? (
          <div className="space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
              placeholder="Enter your research question..."
              disabled={isLoading}
              className="w-full"
            />
            <Button
              onClick={executeQuery}
              disabled={isLoading || !query.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Execute Query
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-2">Query:</div>
              <div className="text-sm">{data.query}</div>
            </div>

            {data.response && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{data.response}</ReactMarkdown>
              </div>
            )}

            {data.sources && data.sources.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Sources:</div>
                <div className="flex flex-wrap gap-2">
                  {data.sources.slice(0, 3).map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-600/10 hover:bg-purple-600/20 rounded-md transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {source.title.substring(0, 30)}...
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setQuery(data.query || '');
                updateNodeData(id, { isExecuted: false });
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Run Again
            </Button>
          </div>
        )}

        <Badge variant="secondary" className="mt-2">
          {data.isExecuted ? 'Executed' : 'Pending'}
        </Badge>
      </CardContent>

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </Card>
  );
}
