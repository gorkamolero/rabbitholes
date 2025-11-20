/**
 * React hooks for canvas persistence with IndexedDB
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import {
  createCanvas,
  getAllCanvases,
  saveCanvasState,
  loadCanvasState,
  deleteCanvas,
  duplicateCanvas,
  updateCanvas,
  exportCanvas,
  importCanvas,
  exportDatabase,
  importDatabase
} from '../lib/db/repository';
import type { Canvas, CanvasExport, DatabaseExport } from '../lib/db/types';

// ============================================================================
// useCanvasList - Manage list of all canvases
// ============================================================================

export function useCanvasList() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allCanvases = await getAllCanvases();
      setCanvases(allCanvases);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load canvases'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (name: string, description?: string) => {
    const canvas = await createCanvas(name, description);
    await refresh();
    return canvas;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteCanvas(id);
    await refresh();
  }, [refresh]);

  const duplicate = useCallback(async (id: string, newName?: string) => {
    const canvas = await duplicateCanvas(id, newName);
    await refresh();
    return canvas;
  }, [refresh]);

  const rename = useCallback(async (id: string, name: string) => {
    await updateCanvas(id, { name });
    await refresh();
  }, [refresh]);

  return {
    canvases,
    loading,
    error,
    refresh,
    create,
    remove,
    duplicate,
    rename
  };
}

// ============================================================================
// useCanvasLoader - Load a specific canvas
// ============================================================================

export function useCanvasLoader(canvasId: string | null) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const state = await loadCanvasState(id);
      setCanvas(state.canvas);
      setNodes(state.nodes);
      setEdges(state.edges);
      return state;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load canvas'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canvasId) {
      load(canvasId);
    }
  }, [canvasId, load]);

  return {
    canvas,
    nodes,
    edges,
    loading,
    error,
    reload: () => canvasId && load(canvasId)
  };
}

// ============================================================================
// useAutoSave - Debounced auto-save for canvas state
// ============================================================================

export function useAutoSave(
  canvasId: string | null,
  nodes: Node[],
  edges: Edge[],
  options: {
    enabled?: boolean;
    debounceMs?: number;
    onSave?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    enabled = true,
    debounceMs = 1000,
    onSave,
    onError
  } = options;

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastStateRef = useRef<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });

  const save = useCallback(async () => {
    if (!canvasId || !enabled) return;

    try {
      setSaving(true);
      await saveCanvasState(canvasId, nodes, edges);
      setLastSaved(new Date());
      lastStateRef.current = { nodes, edges };
      onSave?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save canvas');
      onError?.(error);
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [canvasId, nodes, edges, enabled, onSave, onError]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !canvasId) return;

    // Check if state has actually changed
    const hasChanged =
      JSON.stringify(lastStateRef.current.nodes) !== JSON.stringify(nodes) ||
      JSON.stringify(lastStateRef.current.edges) !== JSON.stringify(edges);

    if (!hasChanged) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule save
    saveTimeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, enabled, canvasId, debounceMs, save]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save on unmount (async but fire-and-forget)
      if (canvasId && enabled) {
        saveCanvasState(canvasId, nodes, edges).catch(console.error);
      }
    };
  }, [canvasId, nodes, edges, enabled]);

  return {
    saving,
    lastSaved,
    saveNow: save
  };
}

// ============================================================================
// useCanvasExport - Export/Import canvas data
// ============================================================================

export function useCanvasExport() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const exportToJson = useCallback(async (canvasId: string) => {
    try {
      setExporting(true);
      const data = await exportCanvas(canvasId);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.canvas.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return data;
    } finally {
      setExporting(false);
    }
  }, []);

  const importFromJson = useCallback(async (file: File) => {
    try {
      setImporting(true);
      const text = await file.text();
      const data: CanvasExport = JSON.parse(text);
      const canvas = await importCanvas(data);
      return canvas;
    } finally {
      setImporting(false);
    }
  }, []);

  const exportDatabaseToJson = useCallback(async () => {
    try {
      setExporting(true);
      const data = await exportDatabase();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rabbitholes_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return data;
    } finally {
      setExporting(false);
    }
  }, []);

  const importDatabaseFromJson = useCallback(async (file: File, merge = false) => {
    try {
      setImporting(true);
      const text = await file.text();
      const data: DatabaseExport = JSON.parse(text);
      await importDatabase(data, merge);
    } finally {
      setImporting(false);
    }
  }, []);

  return {
    exporting,
    importing,
    exportToJson,
    importFromJson,
    exportDatabaseToJson,
    importDatabaseFromJson
  };
}

// ============================================================================
// useCurrentCanvas - Manage current active canvas
// ============================================================================

export function useCurrentCanvas() {
  const [currentCanvasId, setCurrentCanvasId] = useState<string | null>(() => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currentCanvasId');
    }
    return null;
  });

  const setCanvas = useCallback((id: string | null) => {
    setCurrentCanvasId(id);
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('currentCanvasId', id);
      } else {
        localStorage.removeItem('currentCanvasId');
      }
    }
  }, []);

  return {
    currentCanvasId,
    setCurrentCanvasId: setCanvas
  };
}
