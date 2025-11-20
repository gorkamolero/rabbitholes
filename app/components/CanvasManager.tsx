/**
 * Canvas Manager Component
 *
 * Provides UI for managing saved canvases (create, load, delete, export)
 */

'use client';

import React, { useState } from 'react';
import { useCanvasList, useCanvasExport } from '../hooks/useCanvasSync';
import type { Canvas } from '../lib/db/types';

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
    event.target.value = ''; // Reset input
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white/80 hover:text-white hover:bg-[#252525] transition-all duration-200 flex items-center gap-2"
        title="Manage Canvases"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="text-sm">Canvases</span>
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Panel */}
          <div className="relative w-96 bg-[#0A0A0A] border-r border-gray-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">My Canvases</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-b border-gray-800 space-y-2">
              <button
                onClick={onNewCanvas}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Canvas
              </button>

              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={!currentCanvasId}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save As...
              </button>

              <div className="flex gap-2">
                <label className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm">Import</span>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={handleImportCanvas}
                    className="hidden"
                    disabled={importing}
                  />
                </label>

                <button
                  onClick={handleExportDatabase}
                  disabled={exporting}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  title="Export All Data"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-sm">Export All</span>
                </button>
              </div>
            </div>

            {/* Canvas List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : canvases.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No saved canvases yet</p>
                  <p className="text-sm mt-2">Create your first canvas to get started!</p>
                </div>
              ) : (
                canvases.map((canvas) => (
                  <div
                    key={canvas.id}
                    className={`p-4 rounded-lg border transition-all ${
                      canvas.id === currentCanvasId
                        ? 'bg-blue-900/20 border-blue-600'
                        : 'bg-[#1a1a1a] border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {editingId === canvas.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1 bg-[#0A0A0A] border border-gray-600 rounded text-white text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(canvas.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRename(canvas.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium flex-1 cursor-pointer" onClick={() => onLoadCanvas(canvas.id)}>
                            {canvas.name}
                          </h3>
                          {canvas.id === currentCanvasId && (
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Active</span>
                          )}
                        </div>

                        {canvas.description && (
                          <p className="text-gray-400 text-sm mb-3">{canvas.description}</p>
                        )}

                        <p className="text-gray-500 text-xs mb-3">
                          Updated {formatDate(canvas.updatedAt)}
                        </p>

                        <div className="flex gap-2">
                          {canvas.id !== currentCanvasId && (
                            <button
                              onClick={() => onLoadCanvas(canvas.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                            >
                              Load
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(canvas.id);
                              setEditName(canvas.name);
                            }}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => duplicate(canvas.id)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleExportCanvas(canvas.id)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
                          >
                            Export
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${canvas.name}"?`)) {
                                remove(canvas.id);
                              }
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save As Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSaveDialog(false)}
          />
          <div className="relative bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Save Canvas As</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter canvas name..."
              className="w-full px-4 py-2 bg-[#0A0A0A] border border-gray-600 rounded text-white mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveAs();
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAs}
                disabled={!saveName.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
