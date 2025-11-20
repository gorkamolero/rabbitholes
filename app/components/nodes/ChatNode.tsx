'use client';

import { type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader, BaseNodeHeaderTitle } from '@/app/components/base-node';
import { LabeledHandle } from '@/app/components/labeled-handle';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatNodeData {
  label: string;
  conversationThread?: Array<{ role: string; content: string }>;
  systemPrompt?: string;
}

export function ChatNode({ id, data }: NodeProps<ChatNodeData>) {
  const { updateNodeData } = useReactFlow();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedThread = [...(data.conversationThread || []), userMessage];

    updateNodeData(id, { ...data, conversationThread: updatedThread });
    setInput('');
    setIsLoading(true);

    try {
      // Call AI API
      const response = await fetch('/api/rabbitholes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          previousConversation: updatedThread,
          followUpMode: 'focused',
        }),
      });

      const result = await response.json();

      const assistantMessage = { role: 'assistant', content: result.response };
      updateNodeData(id, {
        ...data,
        conversationThread: [...updatedThread, assistantMessage],
      });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [input, data, id, updateNodeData]);

  return (
    <BaseNode className="w-[500px]">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>{data.label || 'Chat'}</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent className="h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-3">
          {data.conversationThread?.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-600/20 ml-8' : 'bg-muted mr-8'
              }`}
            >
              <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && <div className="text-sm text-muted-foreground">Thinking...</div>}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="nodrag"
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            Send
          </Button>
        </div>
      </BaseNodeContent>

      <BaseNodeFooter className="bg-muted/50 px-0 py-1 justify-between">
        <LabeledHandle type="target" position={Position.Left} title="in" />
        <LabeledHandle type="source" position={Position.Right} title="out" />
      </BaseNodeFooter>
    </BaseNode>
  );
}
