/**
 * Database types for RabbitHoles IndexedDB storage
 */

import { Node, Edge } from '@xyflow/react';

/**
 * Canvas represents a saved graph/workspace
 */
export interface Canvas {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string; // Base64 encoded thumbnail image
  metadata?: Record<string, unknown>;
}

/**
 * StoredNode extends React Flow Node with canvas reference
 */
export interface StoredNode extends Node {
  canvasId: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * StoredEdge extends React Flow Edge with canvas reference
 */
export interface StoredEdge extends Edge {
  canvasId: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Settings for key-value configuration storage
 */
export interface Setting {
  key: string;
  value: unknown;
  updatedAt: number;
}

/**
 * Export format for backup/sync
 */
export interface CanvasExport {
  version: string;
  canvas: Canvas;
  nodes: StoredNode[];
  edges: StoredEdge[];
  exportedAt: number;
}

/**
 * Full database export
 */
export interface DatabaseExport {
  version: string;
  canvases: Canvas[];
  nodes: StoredNode[];
  edges: StoredEdge[];
  settings: Setting[];
  exportedAt: number;
}
