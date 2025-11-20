'use client';

import { type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader } from '@/app/components/base-node';
import { LabeledHandle } from '@/app/components/labeled-handle';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface NoteNodeData {
  label: string;
  content?: string;
}

export function NoteNode({ id, data }: NodeProps<NoteNodeData>) {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');

  const saveContent = () => {
    updateNodeData(id, { ...data, content });
    setIsEditing(false);
  };

  return (
    <BaseNode className="w-[400px]">
      <BaseNodeHeader className="border-b">
        <Input
          value={data.label || 'Untitled Note'}
          onChange={(e) => updateNodeData(id, { ...data, label: e.target.value })}
          className="border-0 bg-transparent focus-visible:ring-0 nodrag"
          placeholder="Note title..."
        />
      </BaseNodeHeader>

      <BaseNodeContent className="min-h-[200px]">
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={saveContent}
            className="w-full h-full min-h-[200px] resize-none nodrag"
            placeholder="Write your notes here..."
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-text min-h-[200px] prose prose-sm dark:prose-invert max-w-none"
          >
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">Click to add notes...</p>
            )}
          </div>
        )}
      </BaseNodeContent>

      <BaseNodeFooter className="bg-muted/50 px-0 py-1 justify-between">
        <LabeledHandle type="target" position={Position.Left} />
        <LabeledHandle type="source" position={Position.Right} />
      </BaseNodeFooter>
    </BaseNode>
  );
}
