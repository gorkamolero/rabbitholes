/**
 * Canvas Manager Component
 *
 * Provides UI for managing saved canvases (create, load, delete, export)
 */

'use client';

import React, { useState } from 'react';
import { useCanvasList, useCanvasExport } from '../hooks/useCanvasSync';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Menu,
  Plus,
  Save,
  Upload,
  Download,
  Database,
  Pencil,
  Copy,
  Trash2,
  FolderOpen,
  FileJson
} from 'lucide-react';
import { toast } from 'sonner';

interface CanvasManagerProps {
  currentCanvasId: string | null;
  onLoadCanvas: (canvasId: string) => void;
  onNewCanvas: () => void;
  onSaveAs: (name: string) => Promise<void>;
}

export function CanvasManager({
  currentCanvasId,
  onLoadCanvas,
  onNewCanvas,
  onSaveAs
}: CanvasManagerProps) {
  const { canvases, loading, remove, duplicate, rename } = useCanvasList();
  const { exportToJson, exportDatabaseToJson, importFromJson, importDatabaseFromJson, exporting, importing } = useCanvasExport();
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSaveAs = async () => {
    if (!saveName.trim()) return;
    try {
      await onSaveAs(saveName);
      setSaveName('');
      setShowSaveDialog(false);
      toast.success('Canvas saved successfully!');
    } catch (error) {
      toast.error('Failed to save canvas');
      console.error(error);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await rename(id, editName);
      setEditingId(null);
      setEditName('');
      toast.success('Canvas renamed');
    } catch (error) {
      toast.error('Failed to rename canvas');
      console.error(error);
    }
  };

  const handleExportCanvas = async (id: string) => {
    try {
      await exportToJson(id);
      toast.success('Canvas exported!');
    } catch (error) {
      toast.error('Failed to export canvas');
      console.error(error);
    }
  };

  const handleImportCanvas = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const canvas = await importFromJson(file);
      onLoadCanvas(canvas.id);
      toast.success('Canvas imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import canvas');
    }
    event.target.value = '';
  };

  const handleExportDatabase = async () => {
    try {
      await exportDatabaseToJson();
      toast.success('All data exported!');
    } catch (error) {
      toast.error('Failed to export database');
      console.error(error);
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('This will replace all your current data. Continue?')) {
      event.target.value = '';
      return;
    }

    try {
      await importDatabaseFromJson(file, false);
      toast.success('Database imported successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import database');
    }
    event.target.value = '';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="fixed top-6 left-6 z-50 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Menu className="w-4 h-4 mr-2" />
            Canvases
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[400px] sm:w-[540px] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="text-2xl">My Canvases</SheetTitle>
            <SheetDescription>
              Manage your saved exploration canvases
            </SheetDescription>
          </SheetHeader>

          <Separator />

          {/* Action Buttons */}
          <div className="px-6 py-4 space-y-2 border-b">
            <Button onClick={onNewCanvas} className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Canvas
            </Button>

            <Button
              onClick={() => setShowSaveDialog(true)}
              disabled={!currentCanvasId}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save As...
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Label htmlFor="import-canvas-input" className="cursor-pointer">
                <Button variant="outline" className="w-full pointer-events-none" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  id="import-canvas-input"
                  type="file"
                  accept="application/json"
                  onChange={handleImportCanvas}
                  className="hidden"
                  disabled={importing}
                />
              </Label>

              <Button
                onClick={handleExportDatabase}
                disabled={exporting}
                variant="outline"
                size="sm"
              >
                <Database className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Canvas List */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
              ) : canvases.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground font-medium mb-2">No saved canvases yet</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first canvas to get started!
                  </p>
                </div>
              ) : (
                canvases.map((canvas) => (
                  <div
                    key={canvas.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      canvas.id === currentCanvasId
                        ? 'bg-primary/5 border-primary shadow-md'
                        : 'bg-card border-border hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    {editingId === canvas.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="font-medium"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(canvas.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRename(canvas.id)}
                            size="sm"
                            className="flex-1"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingId(null)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 cursor-pointer" onClick={() => onLoadCanvas(canvas.id)}>
                            <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">
                              {canvas.name}
                            </h3>
                            {canvas.description && (
                              <p className="text-sm text-muted-foreground">{canvas.description}</p>
                            )}
                          </div>
                          {canvas.id === currentCanvasId && (
                            <Badge variant="default" className="ml-2">Active</Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">
                          Updated {formatDate(canvas.updatedAt)}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {canvas.id !== currentCanvasId && (
                            <Button
                              onClick={() => onLoadCanvas(canvas.id)}
                              size="sm"
                              variant="default"
                            >
                              <FolderOpen className="w-3 h-3 mr-1" />
                              Load
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              setEditingId(canvas.id);
                              setEditName(canvas.name);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Rename
                          </Button>
                          <Button
                            onClick={() => duplicate(canvas.id)}
                            size="sm"
                            variant="outline"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Duplicate
                          </Button>
                          <Button
                            onClick={() => handleExportCanvas(canvas.id)}
                            size="sm"
                            variant="outline"
                          >
                            <FileJson className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm(`Delete "${canvas.name}"?`)) {
                                remove(canvas.id);
                                toast.success('Canvas deleted');
                              }
                            }}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Save As Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Canvas As</DialogTitle>
            <DialogDescription>
              Give your canvas a memorable name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="canvas-name">Canvas Name</Label>
              <Input
                id="canvas-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="My Research Canvas..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveAs();
                  if (e.key === 'Escape') setShowSaveDialog(false);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSaveDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveAs} disabled={!saveName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
