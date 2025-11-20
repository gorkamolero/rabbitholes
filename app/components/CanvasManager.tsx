/**
 * Canvas Manager Component - Beautiful Modern Design
 *
 * Provides UI for managing saved canvases with a stunning visual interface
 */

'use client';

import React, { useState } from 'react';
import { useCanvasList, useCanvasExport } from '../hooks/useCanvasSync';
import type { Canvas } from '../lib/db/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  FolderOpen,
  Plus,
  Download,
  Upload,
  Save,
  Edit2,
  Copy,
  Trash2,
  X,
  Check,
  Sparkles,
  Grid3x3,
  Database
} from 'lucide-react';

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
    await onSaveAs(saveName);
    setSaveName('');
    setShowSaveDialog(false);
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await rename(id, editName);
    setEditingId(null);
    setEditName('');
  };

  const handleExportCanvas = async (id: string) => {
    await exportToJson(id);
  };

  const handleImportCanvas = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const canvas = await importFromJson(file);
      onLoadCanvas(canvas.id);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import canvas. Please check the file format.');
    }
    event.target.value = '';
  };

  const handleExportDatabase = async () => {
    await exportDatabaseToJson();
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
      alert('Database imported successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import database. Please check the file format.');
    }
    event.target.value = '';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 group"
        variant="outline"
        size="default"
      >
        <Grid3x3 className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
        <span>Canvases</span>
        <Badge variant="secondary" className="ml-2">
          {canvases.length}
        </Badge>
      </Button>

      {/* Main Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Main Container */}
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    My Canvases
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </h2>
                  <p className="text-sm text-white/50">
                    {canvases.length} {canvases.length === 1 ? 'canvas' : 'canvases'} saved
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button onClick={onNewCanvas} variant="default" className="w-full">
                  <Plus className="w-4 h-4" />
                  New Canvas
                </Button>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!currentCanvasId}
                  variant="secondary"
                  className="w-full"
                >
                  <Save className="w-4 h-4" />
                  Save As
                </Button>
                <label className="w-full">
                  <Button variant="outline" className="w-full cursor-pointer" asChild>
                    <div>
                      <Upload className="w-4 h-4" />
                      Import
                    </div>
                  </Button>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImportCanvas}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
                <Button
                  onClick={handleExportDatabase}
                  disabled={exporting}
                  variant="outline"
                  className="w-full"
                >
                  <Database className="w-4 h-4" />
                  Export All
                </Button>
              </div>
            </div>

            {/* Canvas Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-white/50">Loading canvases...</p>
                  </div>
                </div>
              ) : canvases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4">
                    <FolderOpen className="w-12 h-12 text-white/30" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No canvases yet</h3>
                  <p className="text-white/50 mb-6 max-w-sm">
                    Create your first canvas to start exploring ideas and building knowledge graphs
                  </p>
                  <Button onClick={onNewCanvas} variant="default">
                    <Plus className="w-4 h-4" />
                    Create Your First Canvas
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {canvases.map((canvas) => (
                    <Card
                      key={canvas.id}
                      className={`group hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer transition-all duration-300 ${
                        canvas.id === currentCanvasId
                          ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20'
                          : ''
                      }`}
                      onClick={() => canvas.id !== currentCanvasId && onLoadCanvas(canvas.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          {editingId === canvas.id ? (
                            <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full"
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
                                  variant="default"
                                  className="flex-1"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => setEditingId(null)}
                                  size="sm"
                                  variant="ghost"
                                  className="flex-1"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <CardTitle className="text-lg line-clamp-2 flex-1">
                                {canvas.name}
                              </CardTitle>
                              {canvas.id === currentCanvasId && (
                                <Badge variant="default" className="shrink-0">
                                  Active
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        {canvas.description && !editingId && (
                          <CardDescription className="line-clamp-2">
                            {canvas.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDate(canvas.updatedAt)}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => {
                            setEditingId(canvas.id);
                            setEditName(canvas.name);
                          }}
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => duplicate(canvas.id)}
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleExportCanvas(canvas.id)}
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm(`Delete "${canvas.name}"?`)) {
                              remove(canvas.id);
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="flex-1 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save As Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setShowSaveDialog(false)}
          />
          <Card className="relative w-full max-w-md animate-in zoom-in-95 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Canvas As
              </CardTitle>
              <CardDescription>
                Create a copy of the current canvas with a new name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter canvas name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveAs();
                  if (e.key === 'Escape') setShowSaveDialog(false);
                }}
              />
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAs}
                disabled={!saveName.trim()}
                variant="default"
              >
                <Check className="w-4 h-4" />
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
