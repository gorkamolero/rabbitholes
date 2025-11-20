'use client';

import { Skeleton } from '../ui/skeleton';
import { FolderOpen } from 'lucide-react';
import { CanvasListItem } from './CanvasListItem';
import { useCanvasList } from '../../hooks/useCanvasSync';
import { toast } from 'sonner';

interface CanvasListProps {
  currentCanvasId: string | null;
  onLoadCanvas: (id: string) => void;
}

export function CanvasList({
  currentCanvasId,
  onLoadCanvas
}: CanvasListProps) {
  const { canvases, loading, remove, duplicate, rename } = useCanvasList();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (canvases.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground font-medium mb-2">No saved canvases yet</p>
        <p className="text-sm text-muted-foreground">Create your first canvas to get started!</p>
      </div>
    );
  }

  const handleRename = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      await rename(id, name);
      toast.success('Canvas renamed');
    } catch (error) {
      toast.error('Failed to rename canvas');
      throw error;
    }
  };

  const handleDelete = (id: string) => {
    remove(id);
    toast.success('Canvas deleted');
  };

  return (
    <>
      {canvases.map((canvas) => (
        <CanvasListItem
          key={canvas.id}
          canvas={canvas}
          isActive={canvas.id === currentCanvasId}
          onLoad={onLoadCanvas}
          onRename={handleRename}
          onDuplicate={duplicate}
          onDelete={handleDelete}
          formatDate={formatDate}
        />
      ))}
    </>
  );
}
