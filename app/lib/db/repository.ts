/**
 * Repository layer for database operations
 *
 * Provides high-level API for working with canvases, nodes, and edges
 */

import { Node, Edge } from '@xyflow/react';
import { db } from './schema';
import type { Canvas, StoredNode, StoredEdge, Setting, CanvasExport, DatabaseExport } from './types';

// ============================================================================
// Canvas Operations
// ============================================================================

/**
 * Create a new canvas
 */
export async function createCanvas(name: string, description?: string): Promise<Canvas> {
  const canvas: Canvas = {
    id: `canvas_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await db.canvases.add(canvas);
  return canvas;
}

/**
 * Get all canvases, sorted by most recently updated
 */
export async function getAllCanvases(): Promise<Canvas[]> {
  return db.canvases.orderBy('updatedAt').reverse().toArray();
}

/**
 * Get a single canvas by ID
 */
export async function getCanvas(id: string): Promise<Canvas | undefined> {
  return db.canvases.get(id);
}

/**
 * Update canvas metadata
 */
export async function updateCanvas(
  id: string,
  updates: Partial<Omit<Canvas, 'id' | 'createdAt'>>
): Promise<void> {
  await db.canvases.update(id, {
    ...updates,
    updatedAt: Date.now()
  });
}

/**
 * Delete a canvas and all its nodes and edges
 */
export async function deleteCanvas(id: string): Promise<void> {
  await db.transaction('rw', [db.canvases, db.nodes, db.edges], async () => {
    await db.canvases.delete(id);
    await db.nodes.where('canvasId').equals(id).delete();
    await db.edges.where('canvasId').equals(id).delete();
  });
}

/**
 * Duplicate a canvas with all its nodes and edges
 */
export async function duplicateCanvas(id: string, newName?: string): Promise<Canvas> {
  const originalCanvas = await getCanvas(id);
  if (!originalCanvas) {
    throw new Error(`Canvas ${id} not found`);
  }

  const nodes = await getCanvasNodes(id);
  const edges = await getCanvasEdges(id);

  const newCanvas = await createCanvas(
    newName || `${originalCanvas.name} (Copy)`,
    originalCanvas.description
  );

  // Copy nodes
  for (const node of nodes) {
    await saveNode(newCanvas.id, node);
  }

  // Copy edges
  for (const edge of edges) {
    await saveEdge(newCanvas.id, edge);
  }

  return newCanvas;
}

// ============================================================================
// Node Operations
// ============================================================================

/**
 * Save a node to a canvas
 */
export async function saveNode(canvasId: string, node: Node): Promise<StoredNode> {
  const now = Date.now();
  const storedNode: StoredNode = {
    ...node,
    canvasId,
    createdAt: now,
    updatedAt: now
  };

  await db.nodes.put(storedNode);
  await updateCanvas(canvasId, {}); // Touch canvas updatedAt
  return storedNode;
}

/**
 * Save multiple nodes at once
 */
export async function saveNodes(canvasId: string, nodes: Node[]): Promise<void> {
  const now = Date.now();
  const storedNodes: StoredNode[] = nodes.map(node => ({
    ...node,
    canvasId,
    createdAt: now,
    updatedAt: now
  }));

  await db.transaction('rw', [db.nodes, db.canvases], async () => {
    await db.nodes.bulkPut(storedNodes);
    await updateCanvas(canvasId, {});
  });
}

/**
 * Get all nodes for a canvas
 */
export async function getCanvasNodes(canvasId: string): Promise<StoredNode[]> {
  return db.nodes.where('canvasId').equals(canvasId).toArray();
}

/**
 * Delete a node
 */
export async function deleteNode(canvasId: string, nodeId: string): Promise<void> {
  await db.transaction('rw', [db.nodes, db.edges, db.canvases], async () => {
    await db.nodes.delete(nodeId);
    // Delete connected edges
    await db.edges.where('source').equals(nodeId).delete();
    await db.edges.where('target').equals(nodeId).delete();
    await updateCanvas(canvasId, {});
  });
}

// ============================================================================
// Edge Operations
// ============================================================================

/**
 * Save an edge to a canvas
 */
export async function saveEdge(canvasId: string, edge: Edge): Promise<StoredEdge> {
  const now = Date.now();
  const storedEdge: StoredEdge = {
    ...edge,
    canvasId,
    createdAt: now,
    updatedAt: now
  };

  await db.edges.put(storedEdge);
  await updateCanvas(canvasId, {}); // Touch canvas updatedAt
  return storedEdge;
}

/**
 * Save multiple edges at once
 */
export async function saveEdges(canvasId: string, edges: Edge[]): Promise<void> {
  const now = Date.now();
  const storedEdges: StoredEdge[] = edges.map(edge => ({
    ...edge,
    canvasId,
    createdAt: now,
    updatedAt: now
  }));

  await db.transaction('rw', [db.edges, db.canvases], async () => {
    await db.edges.bulkPut(storedEdges);
    await updateCanvas(canvasId, {});
  });
}

/**
 * Get all edges for a canvas
 */
export async function getCanvasEdges(canvasId: string): Promise<StoredEdge[]> {
  return db.edges.where('canvasId').equals(canvasId).toArray();
}

/**
 * Delete an edge
 */
export async function deleteEdge(canvasId: string, edgeId: string): Promise<void> {
  await db.transaction('rw', [db.edges, db.canvases], async () => {
    await db.edges.delete(edgeId);
    await updateCanvas(canvasId, {});
  });
}

// ============================================================================
// Complete Canvas State Operations
// ============================================================================

/**
 * Save complete canvas state (nodes + edges)
 */
export async function saveCanvasState(
  canvasId: string,
  nodes: Node[],
  edges: Edge[]
): Promise<void> {
  await db.transaction('rw', [db.nodes, db.edges, db.canvases], async () => {
    // Delete existing nodes and edges
    await db.nodes.where('canvasId').equals(canvasId).delete();
    await db.edges.where('canvasId').equals(canvasId).delete();

    // Save new state
    await saveNodes(canvasId, nodes);
    await saveEdges(canvasId, edges);
  });
}

/**
 * Load complete canvas state
 */
export async function loadCanvasState(canvasId: string): Promise<{
  canvas: Canvas;
  nodes: Node[];
  edges: Edge[];
}> {
  const canvas = await getCanvas(canvasId);
  if (!canvas) {
    throw new Error(`Canvas ${canvasId} not found`);
  }

  const nodes = await getCanvasNodes(canvasId);
  const edges = await getCanvasEdges(canvasId);

  // Convert StoredNode/StoredEdge back to Node/Edge (remove db-specific fields)
  const cleanNodes: Node[] = nodes.map(({ canvasId, createdAt, updatedAt, ...node }) => node);
  const cleanEdges: Edge[] = edges.map(({ canvasId, createdAt, updatedAt, ...edge }) => edge);

  return {
    canvas,
    nodes: cleanNodes,
    edges: cleanEdges
  };
}

// ============================================================================
// Settings Operations
// ============================================================================

/**
 * Get a setting value
 */
export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const setting = await db.settings.get(key);
  return setting?.value as T | undefined;
}

/**
 * Set a setting value
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({
    key,
    value,
    updatedAt: Date.now()
  });
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key);
}

// ============================================================================
// Export/Import Operations
// ============================================================================

/**
 * Export a single canvas to JSON
 */
export async function exportCanvas(canvasId: string): Promise<CanvasExport> {
  const { canvas, nodes, edges } = await loadCanvasState(canvasId);

  return {
    version: '1.0',
    canvas,
    nodes: nodes.map(node => ({ ...node, canvasId, createdAt: Date.now(), updatedAt: Date.now() })),
    edges: edges.map(edge => ({ ...edge, canvasId, createdAt: Date.now(), updatedAt: Date.now() })),
    exportedAt: Date.now()
  };
}

/**
 * Import a canvas from JSON
 */
export async function importCanvas(data: CanvasExport): Promise<Canvas> {
  // Create new canvas with imported name
  const canvas = await createCanvas(
    `${data.canvas.name} (Imported)`,
    data.canvas.description
  );

  // Import nodes and edges
  await saveNodes(canvas.id, data.nodes);
  await saveEdges(canvas.id, data.edges);

  return canvas;
}

/**
 * Export entire database to JSON
 */
export async function exportDatabase(): Promise<DatabaseExport> {
  const canvases = await db.canvases.toArray();
  const nodes = await db.nodes.toArray();
  const edges = await db.edges.toArray();
  const settings = await db.settings.toArray();

  return {
    version: '1.0',
    canvases,
    nodes,
    edges,
    settings,
    exportedAt: Date.now()
  };
}

/**
 * Import entire database from JSON (replaces all data!)
 */
export async function importDatabase(data: DatabaseExport, merge = false): Promise<void> {
  await db.transaction('rw', [db.canvases, db.nodes, db.edges, db.settings], async () => {
    if (!merge) {
      // Clear existing data
      await db.canvases.clear();
      await db.nodes.clear();
      await db.edges.clear();
      await db.settings.clear();
    }

    // Import data
    await db.canvases.bulkPut(data.canvases);
    await db.nodes.bulkPut(data.nodes);
    await db.edges.bulkPut(data.edges);
    await db.settings.bulkPut(data.settings);
  });
}

/**
 * Clear all data from database
 */
export async function clearDatabase(): Promise<void> {
  await db.transaction('rw', [db.canvases, db.nodes, db.edges, db.settings], async () => {
    await db.canvases.clear();
    await db.nodes.clear();
    await db.edges.clear();
    await db.settings.clear();
  });
}
