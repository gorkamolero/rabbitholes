'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Pencil, Copy, Trash2, FolderOpen, FileJson } from 'lucide-react';
import type { Canvas } from '../../lib/db/repository';

import { useCanvasExport } from '../../hooks/useCanvasSync';
import { toast } from 'sonner';

interface CanvasListItemProps {
  canvas: Canvas;
  isActive: boolean;
  onLoad: (id: string) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (timestamp: number) => string;
}

export function CanvasListItem({
  canvas,
  isActive,
  onLoad,
  onRename,
  onDuplicate,
  onDelete,
  formatDate
}: CanvasListItemProps) {
  const { exportToJson } = useCanvasExport();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(canvas.name);

  const handleRename = async () => {
    if (!editName.trim()) return;
    await onRename(canvas.id, editName);
    setEditing(false);
  };

  const handleExport = async () => {
    try {
      await exportToJson(canvas.id);
      toast.success('Canvas exported!');
    } catch (error) {
      toast.error('Failed to export canvas');
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isActive
          ? 'bg-primary/5 border-primary shadow-md'
          : 'bg-card border-border hover:border-primary/50 hover:shadow-sm'
      }`}
    >
      {editing ? (
        <div className="space-y-3">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="font-medium"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          <div className="flex gap-2">
            <Button onClick={handleRename} size="sm" className="flex-1">Save</Button>
            <Button onClick={() => setEditing(false)} size="sm" variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 cursor-pointer" onClick={() => onLoad(canvas.id)}>
              <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                {canvas.name}
              </h3>
              {canvas.description && (
                <p className="text-sm text-muted-foreground">{canvas.description}</p>
              )}
            </div>
            {isActive && <Badge variant="default" className="ml-2">Active</Badge>}
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Updated {formatDate(canvas.updatedAt)}
          </p>

          <div className="flex flex-wrap gap-2">
            {!isActive && (
              <Button onClick={() => onLoad(canvas.id)} size="sm" variant="default">
                <FolderOpen className="w-3 h-3 mr-1" />Load
              </Button>
            )}
            <Button onClick={() => { setEditing(true); setEditName(canvas.name); }} size="sm" variant="outline">
              <Pencil className="w-3 h-3 mr-1" />Rename
            </Button>
            <Button onClick={() => onDuplicate(canvas.id)} size="sm" variant="outline">
              <Copy className="w-3 h-3 mr-1" />Duplicate
            </Button>
            <Button onClick={handleExport} size="sm" variant="outline">
              <FileJson className="w-3 h-3 mr-1" />Export
            </Button>
            <Button
              onClick={() => {
                if (confirm(`Delete "${canvas.name}"?`)) onDelete(canvas.id);
              }}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
