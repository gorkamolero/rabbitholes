'use client';

import { type NodeProps, type Node, Position, useReactFlow } from '@xyflow/react';
import { BaseNode, BaseNodeContent, BaseNodeFooter, BaseNodeHeader } from '@/app/components/base-node';
import { LabeledHandle } from '@/app/components/labeled-handle';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit3, Check, FileText } from 'lucide-react';

interface NoteNodeDataType extends Record<string, unknown> {
  label: string;
  content?: string;
}

type NoteNodeType = Node<NoteNodeDataType>;

export function NoteNode({ id, data }: NodeProps<NoteNodeType>) {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const saveContent = () => {
    updateNodeData(id, { ...data, content });
    setIsEditing(false);
  };

  return (
    <BaseNode className="w-[500px] shadow-xl border-green-500/20 hover:border-green-500/40 transition-colors">
      <BaseNodeHeader className="border-b bg-gradient-to-r from-green-500/5 to-emerald-500/5 py-4">
        <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
        {isEditingTitle ? (
          <Input
            value={data.label || 'Untitled Note'}
            onChange={(e) => updateNodeData(id, { ...data, label: e.target.value })}
            onBlur={() => setIsEditingTitle(false)}
            className="border-0 bg-transparent focus-visible:ring-0 nodrag text-lg font-semibold"
            placeholder="Note title..."
            autoFocus
          />
        ) : (
          <h3
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 text-lg font-semibold cursor-text hover:text-green-600 transition-colors"
          >
            {data.label || 'Untitled Note'}
          </h3>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Edit3 className="h-4 w-4" />
          )}
        </Button>
      </BaseNodeHeader>

      <BaseNodeContent className="min-h-[250px] p-4">
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={saveContent}
            className="w-full h-full min-h-[250px] resize-none nodrag border-0 focus-visible:ring-1 focus-visible:ring-green-500/50 font-mono text-sm"
            placeholder="Write your notes here...

Supports **markdown**:
- Lists
- **Bold** and *italic*
- Links and more"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-text min-h-[250px] prose prose-sm dark:prose-invert max-w-none hover:bg-accent/30 -m-4 p-4 rounded-lg transition-colors"
          >
            {content ? (
              <ReactMarkdown className="leading-relaxed">{content}</ReactMarkdown>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">Click to start writing...</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Markdown supported</p>
              </div>
            )}
          </div>
        )}
      </BaseNodeContent>

      <BaseNodeFooter className="bg-muted/30 px-3 py-2 justify-between border-t">
        <LabeledHandle type="target" position={Position.Left} title="in" />
        <div className="text-xs text-muted-foreground">
          {content ? `${content.split(/\s+/).length} words` : 'Empty note'}
        </div>
        <LabeledHandle type="source" position={Position.Right} title="out" />
      </BaseNodeFooter>
    </BaseNode>
  );
}
