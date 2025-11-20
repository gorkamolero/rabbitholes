/**
 * Dexie database schema for RabbitHoles
 *
 * Local-first database with IndexedDB for offline-first experience
 */

import Dexie, { Table } from 'dexie';
import { Canvas, StoredNode, StoredEdge, Setting } from './types';

export class RabbitHolesDB extends Dexie {
  // Tables
  canvases!: Table<Canvas, string>;
  nodes!: Table<StoredNode, string>;
  edges!: Table<StoredEdge, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('RabbitHolesDB');

    // Define schema
    this.version(1).stores({
      // Canvas: indexed by id, searchable by name and updatedAt
      canvases: 'id, name, updatedAt, createdAt',

      // Nodes: indexed by id, searchable by canvasId for efficient queries
      nodes: 'id, canvasId, type, updatedAt, createdAt, [canvasId+type]',

      // Edges: indexed by id, searchable by canvasId, source, and target
      edges: 'id, canvasId, source, target, updatedAt, createdAt, [canvasId+source], [canvasId+target]',

      // Settings: key-value store
      settings: 'key, updatedAt'
    });
  }
}

// Create singleton instance
export const db = new RabbitHolesDB();

// Initialize database (called on app start)
export async function initializeDatabase() {
  try {
    await db.open();
    console.log('✅ RabbitHoles database initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
}

// Get database info for debugging
export async function getDatabaseInfo() {
  const canvasCount = await db.canvases.count();
  const nodeCount = await db.nodes.count();
  const edgeCount = await db.edges.count();
  const settingCount = await db.settings.count();

  return {
    name: db.name,
    version: db.verno,
    isOpen: db.isOpen(),
    tables: {
      canvases: canvasCount,
      nodes: nodeCount,
      edges: edgeCount,
      settings: settingCount
    }
  };
}
