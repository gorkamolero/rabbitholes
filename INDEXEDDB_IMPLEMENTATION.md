# IndexedDB Sync Implementation

## Overview

RabbitHoles now features a **local-first database** using IndexedDB with Dexie.js. All your canvases, nodes, and edges are automatically saved to your browser's storage and persist across sessions.

## Features

- ✅ **Auto-save**: Changes are automatically saved every 2 seconds
- ✅ **Canvas Management**: Create, load, rename, duplicate, and delete canvases
- ✅ **Export/Import**: Export individual canvases or entire database to JSON
- ✅ **Offline-first**: Everything works without internet connection
- ✅ **No data loss**: Your work is preserved even if you close the browser

## Architecture

### Database Schema

```typescript
// Canvases - workspace containers
Canvas {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

// Nodes - graph nodes with content
StoredNode extends ReactFlow.Node {
  canvasId: string;
  createdAt: number;
  updatedAt: number;
}

// Edges - connections between nodes
StoredEdge extends ReactFlow.Edge {
  canvasId: string;
  createdAt: number;
  updatedAt: number;
}

// Settings - key-value store
Setting {
  key: string;
  value: unknown;
  updatedAt: number;
}
```

### File Structure

```
app/
├── lib/
│   └── db/
│       ├── schema.ts      # Dexie database setup
│       ├── types.ts       # TypeScript types
│       └── repository.ts  # High-level API
├── hooks/
│   └── useCanvasSync.ts   # React hooks for persistence
└── components/
    ├── CanvasManager.tsx  # UI for managing canvases
    └── SearchView.tsx     # Updated with persistence
```

## Usage

### Auto-save

Auto-save is enabled automatically when you create a canvas. Changes to nodes and edges are debounced and saved every 2 seconds.

```typescript
// Auto-save is integrated automatically
const { saving, lastSaved } = useAutoSave(currentCanvasId, nodes, edges);
```

### Canvas Operations

```typescript
// Create a new canvas
const canvas = await createCanvas('My Canvas', 'Optional description');

// Load a canvas
const { canvas, nodes, edges } = await loadCanvasState(canvasId);

// Save canvas state
await saveCanvasState(canvasId, nodes, edges);

// Delete a canvas (and all its nodes/edges)
await deleteCanvas(canvasId);
```

### Export/Import

```typescript
// Export a single canvas
const data = await exportCanvas(canvasId);
// Download as JSON file

// Export entire database
const backup = await exportDatabase();
// Download as JSON file

// Import canvas
const canvas = await importCanvas(jsonData);

// Import database (replaces all data)
await importDatabase(jsonData, merge = false);
```

### React Hooks

```typescript
// List all canvases
const { canvases, loading, refresh, create, remove, duplicate, rename } = useCanvasList();

// Load a specific canvas
const { canvas, nodes, edges, loading, error, reload } = useCanvasLoader(canvasId);

// Auto-save
const { saving, lastSaved, saveNow } = useAutoSave(canvasId, nodes, edges);

// Export/Import
const { exportToJson, importFromJson, exportDatabaseToJson, importDatabaseFromJson } = useCanvasExport();

// Current canvas state
const { currentCanvasId, setCurrentCanvasId } = useCurrentCanvas();
```

## UI Components

### Canvas Manager

The Canvas Manager provides a sidebar UI for:
- Creating new canvases
- Loading saved canvases
- Renaming canvases
- Duplicating canvases
- Exporting canvases
- Deleting canvases
- Importing canvases
- Exporting entire database

Access it via the **"Canvases"** button in the top-left corner.

### Save Status Indicator

A status indicator in the bottom-right corner shows:
- 🔵 **Saving...** - Auto-save in progress
- 🟢 **Saved [time]** - Last save timestamp

## Storage Limits

IndexedDB storage varies by browser:
- **Chrome/Edge**: ~60% of available disk space (quotas apply)
- **Firefox**: ~50% of available disk space (quotas apply)
- **Safari**: 1GB max

For typical usage:
- Average canvas: ~50-100 KB
- 1000 canvases: ~50-100 MB
- Plenty of room for most use cases

## Data Persistence

Data is stored locally in your browser's IndexedDB:
- **Location**: Browser profile storage
- **Persistence**: Across browser sessions
- **Privacy**: Never leaves your device
- **Clearing**: Clear browser data will delete the database

## Best Practices

1. **Regular Backups**: Export your database periodically
2. **Naming**: Use descriptive canvas names for easy identification
3. **Organization**: Delete unused canvases to keep things tidy
4. **Browser Profile**: Use the same browser profile to access your data

## Troubleshooting

### Data not saving?
- Check browser console for errors
- Ensure IndexedDB is not disabled
- Check available storage space

### Canvas not loading?
- Try refreshing the canvas list
- Check browser console for errors
- Verify canvas ID is valid

### Export/Import failing?
- Ensure JSON file is valid
- Check file size (large files may take time)
- Try importing individual canvases instead of full database

## Testing

A standalone test page is available at `/test-db.html` to verify IndexedDB functionality without running the full app.

## Future Enhancements

Potential improvements:
- Cloud sync (Supabase, Firebase, etc.)
- Real-time collaboration
- Conflict resolution
- Image caching
- Compression for large canvases
- Selective sync
- Version history

## Technical Details

### Dependencies
- **Dexie.js** (v3.2.4+): IndexedDB wrapper with TypeScript support

### Browser Compatibility
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅
- Mobile browsers: ✅ (with limitations)

### Performance
- Auto-save debounce: 2 seconds
- Query performance: O(log n) for indexed fields
- Transaction support: ACID compliant
- Async/await: Non-blocking operations

## Migration Notes

If you were using the app before this update:
1. Your previous sessions were not persisted (this is new functionality)
2. Start fresh by creating a new canvas
3. No migration needed

## Support

For issues or questions:
- Check browser console for errors
- Review this documentation
- Open an issue on GitHub
