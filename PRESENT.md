# RabbitHoles AI - Complete Implementation Plan

## Executive Summary

This document provides a complete, ordered implementation roadmap for transforming RabbitHoles from its current state into a full-featured AI-powered knowledge exploration platform with infinite canvas, multi-workspace support, and advanced conversation management.

**Current State:**
- ✅ Basic search & AI response generation
- ✅ Drag-to-create node system
- ✅ Conversation history tracking
- ✅ Graph visualization with Dagre layout
- ✅ Image carousel & source display
- ✅ Dark-themed UI with animations

**Missing Infrastructure:**
- ❌ Persistence layer (no database/storage)
- ❌ Canvas/workspace management
- ❌ Node type system
- ❌ Context control mechanism
- ❌ Export/import functionality
- ❌ Search & filtering

---

## Priority Classification

- 🔴 **Critical** - Core features essential for MVP (Phases 1-2)
- 🟡 **Important** - Key features for full product experience (Phases 3-4)
- 🟢 **Enhancement** - Nice-to-have UX improvements (Phases 5-6)

---

## Technical Foundation Requirements

### Database Schema Design

**Storage Technology:** IndexedDB (client-side) + optional backend sync

```typescript
// Core Data Models

interface Canvas {
  id: string;                          // UUID
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;                  // Base64 preview
  tags?: string[];
  isArchived: boolean;
}

interface CanvasState {
  canvasId: string;
  nodes: Node[];                       // ReactFlow nodes
  edges: Edge[];                       // ReactFlow edges
  viewport: {                          // Current view position
    x: number;
    y: number;
    zoom: number;
  };
  conversationHistory: ConversationMessage[];
  metadata: {
    nodeCount: number;
    lastEditedAt: Date;
    version: number;
  };
}

interface NodeData {
  id: string;
  type: NodeType;                      // 'chat' | 'note' | 'query' | 'pdf' | 'image'
  label: string;
  content: string;                     // Markdown content

  // Chat-specific
  conversationThread?: ConversationMessage[];
  systemPrompt?: string;

  // Context control
  contextSources?: string[];           // Node IDs providing context

  // Media
  images?: ImageData[];
  sources?: SourceLink[];
  pdfData?: PDFData;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  position: { x: number; y: number };
  isExpanded: boolean;
}

interface Todo {
  id: string;
  canvasId: string;
  nodeId?: string;                     // Optional link to node
  content: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  createdAt: Date;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  sharesContext: boolean;              // Controls if context flows
  contextDirection?: 'bidirectional' | 'source-to-target' | 'target-to-source';
}
```

---

## Implementation Phases

---

# PHASE 1: Persistence & Multi-Canvas Foundation
**Priority:** 🔴 Critical
**Estimated Time:** 2-3 weeks
**Dependencies:** None (foundational)

## Goals
- Establish data persistence layer
- Enable multiple canvas creation/management
- Implement save/load system
- Create canvas switcher UI

---

## 1.1 IndexedDB Storage Layer

**New Files:**
- `app/lib/db/schema.ts` - Database schema definitions
- `app/lib/db/canvasStore.ts` - Canvas CRUD operations
- `app/lib/db/nodeStore.ts` - Node data management
- `app/lib/db/todoStore.ts` - Todo list storage
- `app/hooks/useCanvas.ts` - Canvas state management hook
- `app/hooks/useAutoSave.ts` - Auto-save hook with debouncing

**Technical Specs:**
```typescript
// app/lib/db/schema.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface RabbitHolesDB extends DBSchema {
  canvases: {
    key: string;
    value: Canvas;
    indexes: { 'by-updated': Date; 'by-created': Date };
  };
  canvasStates: {
    key: string;
    value: CanvasState;
  };
  todos: {
    key: string;
    value: Todo;
    indexes: { 'by-canvas': string; 'by-node': string };
  };
}

export async function initDB(): Promise<IDBPDatabase<RabbitHolesDB>> {
  return openDB<RabbitHolesDB>('rabbitholes-db', 1, {
    upgrade(db) {
      // Canvas store
      const canvasStore = db.createObjectStore('canvases', { keyPath: 'id' });
      canvasStore.createIndex('by-updated', 'updatedAt');
      canvasStore.createIndex('by-created', 'createdAt');

      // Canvas state store
      db.createObjectStore('canvasStates', { keyPath: 'canvasId' });

      // Todo store
      const todoStore = db.createObjectStore('todos', { keyPath: 'id' });
      todoStore.createIndex('by-canvas', 'canvasId');
      todoStore.createIndex('by-node', 'nodeId');
    },
  });
}
```

**Dependencies to Install:**
```bash
npm install idb uuid
npm install --save-dev @types/uuid
```

**Auto-Save Implementation:**
```typescript
// app/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export function useAutoSave(
  canvasId: string,
  nodes: Node[],
  edges: Edge[],
  conversationHistory: ConversationMessage[],
  viewport: Viewport
) {
  const saveCanvas = useRef(
    debounce(async (state: CanvasState) => {
      await canvasStore.saveState(state);
    }, 2000) // Save 2s after last change
  ).current;

  useEffect(() => {
    saveCanvas({
      canvasId,
      nodes,
      edges,
      viewport,
      conversationHistory,
      metadata: {
        nodeCount: nodes.length,
        lastEditedAt: new Date(),
        version: 1,
      },
    });
  }, [nodes, edges, conversationHistory, viewport]);

  return { saveNow: () => saveCanvas.flush() };
}
```

**Complexity:** Medium
**Testing Needs:** IndexedDB transactions, error handling, migration

---

## 1.2 Canvas Management UI

**New Files:**
- `app/components/CanvasSwitcher.tsx` - Dropdown/sidebar for canvas selection
- `app/components/CanvasManager.tsx` - Create/rename/delete canvases
- `app/components/CanvasCard.tsx` - Canvas preview card
- `app/components/CanvasSettings.tsx` - Canvas-level settings

**Modified Files:**
- `app/components/SearchView.tsx` - Add canvas ID prop, integrate switcher
- `app/page.tsx` - Show canvas manager on first load

**UI Specification:**

```typescript
// app/components/CanvasSwitcher.tsx
import { Canvas } from '@/lib/db/schema';

interface CanvasSwitcherProps {
  currentCanvas: Canvas;
  onSwitch: (canvasId: string) => void;
}

export function CanvasSwitcher({ currentCanvas, onSwitch }: CanvasSwitcherProps) {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load all canvases from IndexedDB
    canvasStore.getAll().then(setCanvases);
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg"
      >
        <FolderIcon className="w-4 h-4" />
        <span>{currentCanvas.name}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl">
          <div className="p-2">
            <button
              onClick={() => {/* Create new canvas */}}
              className="w-full px-3 py-2 text-left hover:bg-zinc-800 rounded flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New Canvas
            </button>
          </div>

          <div className="border-t border-zinc-800 max-h-96 overflow-y-auto">
            {canvases.map(canvas => (
              <CanvasCard
                key={canvas.id}
                canvas={canvas}
                isActive={canvas.id === currentCanvas.id}
                onClick={() => {
                  onSwitch(canvas.id);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Features:**
- ✅ Create new blank canvas
- ✅ Switch between canvases (loads state from IndexedDB)
- ✅ Rename canvas (double-click name)
- ✅ Delete canvas (with confirmation)
- ✅ Canvas thumbnail generation (canvas screenshot)
- ✅ Last edited timestamp
- ✅ Node count display

**Complexity:** Medium
**Design Notes:** Use Radix UI Dropdown Menu for accessibility

---

## 1.3 Load/Save Integration

**Modified Files:**
- `app/components/SearchView.tsx`

**Key Changes:**

```typescript
// SearchView.tsx - Add canvas state management
function SearchView({ canvasId }: { canvasId: string }) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  // Auto-save hook
  useAutoSave(canvasId, nodes, edges, conversationHistory, viewport);

  // Load canvas on mount or canvasId change
  useEffect(() => {
    async function loadCanvas() {
      const canvasData = await canvasStore.get(canvasId);
      const state = await canvasStore.getState(canvasId);

      if (!state) {
        // First time - create default state
        await canvasStore.saveState({
          canvasId,
          nodes: [],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          conversationHistory: [],
          metadata: {
            nodeCount: 0,
            lastEditedAt: new Date(),
            version: 1,
          },
        });
      } else {
        // Restore state
        setNodes(state.nodes);
        setEdges(state.edges);
        setConversationHistory(state.conversationHistory);
        setViewport(state.viewport);
      }

      setCanvas(canvasData);
    }

    loadCanvas();
  }, [canvasId]);

  // ... rest of component
}
```

**Testing:**
- Create canvas → add nodes → reload page → verify state persists
- Switch between canvases → verify correct state loads
- Concurrent tab testing → verify IndexedDB transactions

**Complexity:** Low-Medium

---

## Deliverables - Phase 1

✅ IndexedDB schema & CRUD operations
✅ Canvas switcher UI component
✅ Auto-save system with debouncing
✅ Load/restore canvas state
✅ Create/delete canvas functionality
✅ Canvas thumbnail generation

**Success Criteria:**
- User can create unlimited canvases
- State persists across page reloads
- Auto-save works without user intervention
- Canvas switching is instant (<100ms)

---

# PHASE 2: Manual Node Creation & Node Type System
**Priority:** 🔴 Critical
**Estimated Time:** 2-3 weeks
**Dependencies:** Phase 1 (storage layer)

## Goals
- Click-to-create nodes anywhere on canvas
- Multiple node types (chat, note, query, PDF, image)
- Edit node content after creation
- Keyboard shortcuts for node creation

---

## 2.1 Node Type System

**New Files:**
- `app/components/nodes/ChatNode.tsx` - Interactive chat node
- `app/components/nodes/NoteNode.tsx` - Plain text/markdown note
- `app/components/nodes/QueryNode.tsx` - Question node (existing, refactored)
- `app/components/nodes/PDFNode.tsx` - PDF display node (Phase 4)
- `app/components/nodes/ImageNode.tsx` - Image generation node (Phase 5)
- `app/lib/nodeFactory.ts` - Factory pattern for node creation

**Modified Files:**
- `app/components/SearchView.tsx` - Register new node types

**Node Type Specifications:**

```typescript
// app/lib/nodeFactory.ts

export enum NodeType {
  CHAT = 'chat',
  NOTE = 'note',
  QUERY = 'query',
  PDF = 'pdf',
  IMAGE = 'image',
}

export interface BaseNodeData {
  id: string;
  type: NodeType;
  label: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  position: XYPosition;
  isExpanded: boolean;
}

export interface ChatNodeData extends BaseNodeData {
  type: NodeType.CHAT;
  conversationThread: ConversationMessage[];
  systemPrompt?: string;
  model?: string;
  contextSources?: string[];  // Node IDs
}

export interface NoteNodeData extends BaseNodeData {
  type: NodeType.NOTE;
  backgroundColor?: string;
  fontSize?: number;
}

export interface QueryNodeData extends BaseNodeData {
  type: NodeType.QUERY;
  isProcessed: boolean;
  sources?: SourceLink[];
  images?: ImageData[];
}

export function createNode(
  type: NodeType,
  position: XYPosition,
  initialData?: Partial<BaseNodeData>
): Node {
  const id = generateId();

  const baseNode = {
    id,
    position,
    data: {
      id,
      type,
      label: initialData?.label || 'Untitled',
      content: initialData?.content || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpanded: true,
      ...initialData,
    },
  };

  switch (type) {
    case NodeType.CHAT:
      return {
        ...baseNode,
        type: 'chatNode',
        data: {
          ...baseNode.data,
          conversationThread: [],
          systemPrompt: undefined,
        } as ChatNodeData,
      };

    case NodeType.NOTE:
      return {
        ...baseNode,
        type: 'noteNode',
        data: {
          ...baseNode.data,
          backgroundColor: '#1a1a1a',
        } as NoteNodeData,
      };

    case NodeType.QUERY:
      return {
        ...baseNode,
        type: 'queryNode',
        data: {
          ...baseNode.data,
          isProcessed: false,
          sources: [],
          images: [],
        } as QueryNodeData,
      };

    default:
      return baseNode as Node;
  }
}
```

**ChatNode Component:**

```typescript
// app/components/nodes/ChatNode.tsx
export function ChatNode({ id, data }: NodeProps<ChatNodeData>) {
  const [messages, setMessages] = useState<ConversationMessage[]>(data.conversationThread || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get context from connected nodes if enabled
      const contextNodes = data.contextSources || [];
      const context = await buildContextFromNodes(contextNodes);

      const response = await api.searchRabbitHole({
        query: input,
        previousConversation: [...messages, userMessage],
        concept: data.label,
        followUpMode: 'focused',
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update node data
      updateNodeData(id, {
        ...data,
        conversationThread: [...messages, userMessage, assistantMessage],
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseNode className="w-[500px]">
      <BaseNodeHeader>
        <input
          value={data.label}
          onChange={(e) => updateNodeData(id, { ...data, label: e.target.value })}
          className="bg-transparent border-none outline-none w-full"
        />
      </BaseNodeHeader>

      <BaseNodeContent className="h-[400px] flex flex-col">
        {/* Message history */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600/20 ml-8'
                  : 'bg-zinc-800 mr-8'
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {isLoading && <LoadingSpinner />}
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </BaseNodeContent>

      <BaseNodeFooter>
        <LabeledHandle type="target" position={Position.Left} label="Input" />
        <LabeledHandle type="source" position={Position.Right} label="Output" />
      </BaseNodeFooter>
    </BaseNode>
  );
}
```

**NoteNode Component:**

```typescript
// app/components/nodes/NoteNode.tsx
export function NoteNode({ id, data }: NodeProps<NoteNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content);

  const saveContent = () => {
    updateNodeData(id, {
      ...data,
      content,
      updatedAt: new Date(),
    });
    setIsEditing(false);
  };

  return (
    <BaseNode className="w-[400px]" style={{ backgroundColor: data.backgroundColor }}>
      <BaseNodeHeader>
        <input
          value={data.label}
          onChange={(e) => updateNodeData(id, { ...data, label: e.target.value })}
          className="bg-transparent border-none outline-none w-full"
        />
      </BaseNodeHeader>

      <BaseNodeContent className="min-h-[200px]">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={saveContent}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-text prose prose-invert"
          >
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p className="text-zinc-500">Click to add notes...</p>
            )}
          </div>
        )}
      </BaseNodeContent>

      <BaseNodeFooter>
        <LabeledHandle type="target" position={Position.Left} />
        <LabeledHandle type="source" position={Position.Right} />
      </BaseNodeFooter>
    </BaseNode>
  );
}
```

**Complexity:** Medium
**Testing:** Node creation, data persistence, type-specific behavior

---

## 2.2 Click-to-Create System

**New Files:**
- `app/components/NodeCreationToolbar.tsx` - Floating toolbar for node types
- `app/hooks/useCanvasClick.ts` - Handle canvas click events

**Modified Files:**
- `app/components/RabbitFlow.tsx` - Add canvas click handler

**Implementation:**

```typescript
// app/components/NodeCreationToolbar.tsx
export function NodeCreationToolbar({ onCreateNode }: { onCreateNode: (type: NodeType) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="mb-2 flex flex-col gap-2">
          <button
            onClick={() => onCreateNode(NodeType.CHAT)}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <MessageSquareIcon className="w-4 h-4" />
            Chat Node
          </button>
          <button
            onClick={() => onCreateNode(NodeType.NOTE)}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <StickyNoteIcon className="w-4 h-4" />
            Note
          </button>
          <button
            onClick={() => onCreateNode(NodeType.QUERY)}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <SearchIcon className="w-4 h-4" />
            Query
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-zinc-900 border-2 border-zinc-700 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
      >
        {isOpen ? <XIcon /> : <PlusIcon className="w-6 h-6" />}
      </button>
    </div>
  );
}
```

```typescript
// app/hooks/useCanvasClick.ts
export function useCanvasClick(
  reactFlowInstance: ReactFlowInstance,
  onCreateNode: (type: NodeType, position: XYPosition) => void
) {
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedNodeType) return;

      // Convert screen coordinates to flow coordinates
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onCreateNode(selectedNodeType, position);
      setSelectedNodeType(null);
    },
    [selectedNodeType, reactFlowInstance, onCreateNode]
  );

  return { handlePaneClick, selectedNodeType, setSelectedNodeType };
}
```

**Modified RabbitFlow.tsx:**

```typescript
function RabbitFlow({ nodes, edges, onNodesChange, onEdgesChange, onCreateNode }) {
  const reactFlowInstance = useReactFlow();
  const { handlePaneClick, selectedNodeType, setSelectedNodeType } = useCanvasClick(
    reactFlowInstance,
    onCreateNode
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        style={{ cursor: selectedNodeType ? 'crosshair' : 'default' }}
        // ... other props
      />

      <NodeCreationToolbar
        onCreateNode={(type) => setSelectedNodeType(type)}
      />
    </>
  );
}
```

**User Flow:**
1. Click floating + button
2. Select node type from menu
3. Canvas cursor changes to crosshair
4. Click anywhere on canvas
5. Node created at click position
6. Cursor resets to normal

**Complexity:** Low-Medium

---

## 2.3 Keyboard Shortcuts

**New Files:**
- `app/hooks/useKeyboardShortcuts.ts`
- `app/components/ShortcutHelpDialog.tsx`

**Implementation:**

```typescript
// app/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts(actions: {
  createChatNode: () => void;
  createNoteNode: () => void;
  createQueryNode: () => void;
  deleteSelectedNodes: () => void;
  duplicateSelectedNodes: () => void;
  toggleSearch: () => void;
  saveCanvas: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + N - New chat node
      if (isMod && e.key === 'n') {
        e.preventDefault();
        actions.createChatNode();
      }

      // Cmd/Ctrl + Shift + N - New note
      if (isMod && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        actions.createNoteNode();
      }

      // Cmd/Ctrl + K - Search
      if (isMod && e.key === 'k') {
        e.preventDefault();
        actions.toggleSearch();
      }

      // Delete/Backspace - Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        actions.deleteSelectedNodes();
      }

      // Cmd/Ctrl + D - Duplicate
      if (isMod && e.key === 'd') {
        e.preventDefault();
        actions.duplicateSelectedNodes();
      }

      // Cmd/Ctrl + S - Save
      if (isMod && e.key === 's') {
        e.preventDefault();
        actions.saveCanvas();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}
```

**Keyboard Shortcuts:**
- `Cmd/Ctrl + N` - Create chat node at center
- `Cmd/Ctrl + Shift + N` - Create note node
- `Cmd/Ctrl + K` - Open search palette
- `Delete/Backspace` - Delete selected nodes
- `Cmd/Ctrl + D` - Duplicate selected nodes
- `Cmd/Ctrl + S` - Manual save (auto-save also active)
- `?` - Show shortcuts help dialog

**Complexity:** Low

---

## Deliverables - Phase 2

✅ Node type system (Chat, Note, Query)
✅ ChatNode with conversation threading
✅ NoteNode with inline editing
✅ Click-to-create on canvas
✅ Floating toolbar for node creation
✅ Keyboard shortcuts system
✅ Shortcuts help dialog

**Success Criteria:**
- User can create nodes anywhere on canvas
- Chat nodes maintain independent conversation threads
- Note nodes support markdown editing
- Keyboard shortcuts work reliably
- Node data persists in IndexedDB

---

# PHASE 3: Infinite Canvas & Navigation
**Priority:** 🟡 Important
**Estimated Time:** 1-2 weeks
**Dependencies:** Phase 1, Phase 2

## Goals
- Truly infinite canvas (remove boundaries)
- Minimap for navigation
- Zoom controls UI
- Current position indicator
- Smooth panning

---

## 3.1 Infinite Canvas Configuration

**Modified Files:**
- `app/components/RabbitFlow.tsx`

**Implementation:**

```typescript
// RabbitFlow.tsx - Configure infinite canvas
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}

  // INFINITE CANVAS SETTINGS
  minZoom={0.1}          // 10% zoom out
  maxZoom={2}            // 200% zoom in
  defaultViewport={{ x: 0, y: 0, zoom: 1 }}

  // Remove boundaries
  translateExtent={[
    [-Infinity, -Infinity],
    [Infinity, Infinity]
  ]}
  nodeExtent={[
    [-Infinity, -Infinity],
    [Infinity, Infinity]
  ]}

  // Panning settings
  panOnDrag={true}
  panOnScroll={false}
  zoomOnScroll={true}
  zoomOnPinch={true}
  zoomOnDoubleClick={false}

  // Prevent node dragging off canvas
  autoPanOnNodeDrag={true}

  // Save viewport on change
  onViewportChange={(viewport) => {
    setViewport(viewport);
  }}

  // ... other props
>
  {/* Children components */}
</ReactFlow>
```

**Complexity:** Low (mostly configuration)

---

## 3.2 Minimap Component

**New Files:**
- `app/components/CanvasMinimap.tsx`

**Implementation:**

```typescript
// RabbitFlow.tsx
import { MiniMap } from '@xyflow/react';

<ReactFlow {...props}>
  <MiniMap
    nodeColor={(node) => {
      switch (node.type) {
        case 'chatNode': return '#3b82f6';  // Blue
        case 'noteNode': return '#10b981';  // Green
        case 'queryNode': return '#a855f7'; // Purple
        default: return '#6b7280';          // Gray
      }
    }}
    maskColor="rgba(0, 0, 0, 0.6)"
    style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #3f3f46',
      borderRadius: '8px',
    }}
    position="bottom-right"
  />

  <Controls
    position="top-right"
    showZoom={true}
    showFitView={true}
    showInteractive={true}
    style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #3f3f46',
      borderRadius: '8px',
    }}
  />

  <Background
    color="#27272a"
    gap={16}
    variant={BackgroundVariant.Dots}
  />
</ReactFlow>
```

**Features:**
- Color-coded nodes by type
- Viewport indicator (draggable)
- Position in bottom-right corner
- Click to jump to area

**Complexity:** Low (using ReactFlow built-in components)

---

## 3.3 Navigation Toolbar

**New Files:**
- `app/components/NavigationToolbar.tsx`

**Implementation:**

```typescript
// app/components/NavigationToolbar.tsx
export function NavigationToolbar() {
  const reactFlowInstance = useReactFlow();
  const [viewport, setViewport] = useState(reactFlowInstance.getViewport());

  const zoomIn = () => reactFlowInstance.zoomIn();
  const zoomOut = () => reactFlowInstance.zoomOut();
  const fitView = () => reactFlowInstance.fitView({ padding: 0.2 });
  const resetView = () => reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });

  useEffect(() => {
    const unsubscribe = reactFlowInstance.onViewportChange((vp) => {
      setViewport(vp);
    });
    return unsubscribe;
  }, [reactFlowInstance]);

  return (
    <div className="fixed top-4 right-4 bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex flex-col gap-2">
      <button onClick={zoomIn} className="p-2 hover:bg-zinc-800 rounded">
        <ZoomInIcon className="w-5 h-5" />
      </button>
      <button onClick={zoomOut} className="p-2 hover:bg-zinc-800 rounded">
        <ZoomOutIcon className="w-5 h-5" />
      </button>
      <button onClick={fitView} className="p-2 hover:bg-zinc-800 rounded" title="Fit View">
        <MaximizeIcon className="w-5 h-5" />
      </button>
      <button onClick={resetView} className="p-2 hover:bg-zinc-800 rounded" title="Reset View">
        <HomeIcon className="w-5 h-5" />
      </button>

      <div className="border-t border-zinc-800 pt-2 text-xs text-zinc-400 text-center">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
```

**Features:**
- Zoom in/out buttons
- Fit view (show all nodes)
- Reset to origin
- Current zoom percentage display

**Complexity:** Low

---

## 3.4 Position Indicator

**New Files:**
- `app/components/PositionIndicator.tsx`

**Implementation:**

```typescript
// app/components/PositionIndicator.tsx
export function PositionIndicator() {
  const reactFlowInstance = useReactFlow();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribe = reactFlowInstance.onViewportChange((viewport) => {
      setPosition({ x: Math.round(viewport.x), y: Math.round(viewport.y) });
    });
    return unsubscribe;
  }, [reactFlowInstance]);

  return (
    <div className="fixed bottom-4 left-4 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono">
      X: {position.x} Y: {position.y}
    </div>
  );
}
```

**Complexity:** Low

---

## Deliverables - Phase 3

✅ Infinite canvas boundaries removed
✅ Minimap with color-coded nodes
✅ Zoom controls (in/out/fit/reset)
✅ Background grid pattern
✅ Position indicator
✅ Smooth panning & zooming

**Success Criteria:**
- Canvas has no boundaries (can pan infinitely)
- Minimap shows entire graph
- Zoom controls work smoothly
- Users can navigate large graphs easily

---

# PHASE 4: Context Control & Branching
**Priority:** 🟡 Important
**Estimated Time:** 2-3 weeks
**Dependencies:** Phase 2 (node types)

## Goals
- Manual connection drawing between nodes
- Context sharing control per connection
- Visual indicators for context flow
- Branch conversation from any node
- Cherry-pick context sources

---

## 4.1 Manual Connection System

**Modified Files:**
- `app/components/RabbitFlow.tsx`
- `app/components/nodes/ChatNode.tsx`

**Implementation:**

```typescript
// Custom Edge Type
// app/components/edges/ContextEdge.tsx
export function ContextEdge({ id, source, target, data }: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [sharesContext, setSharesContext] = useState(data?.sharesContext ?? true);

  const toggleContext = () => {
    const newValue = !sharesContext;
    setSharesContext(newValue);
    updateEdgeData(id, { sharesContext: newValue });
  };

  return (
    <>
      <path
        id={id}
        className={sharesContext ? 'stroke-blue-500' : 'stroke-zinc-700'}
        style={{ strokeWidth: 2 }}
        d={edgePath}
      />

      <foreignObject
        width={40}
        height={40}
        x={labelX - 20}
        y={labelY - 20}
      >
        <button
          onClick={toggleContext}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
            sharesContext
              ? 'bg-blue-600 border-blue-500'
              : 'bg-zinc-800 border-zinc-700'
          }`}
          title={sharesContext ? 'Context Enabled' : 'Context Disabled'}
        >
          {sharesContext ? (
            <LinkIcon className="w-4 h-4" />
          ) : (
            <LinkSlashIcon className="w-4 h-4" />
          )}
        </button>
      </foreignObject>
    </>
  );
}
```

**EdgeTypes Registration:**

```typescript
// SearchView.tsx
const edgeTypes = {
  context: ContextEdge,
};

// In ReactFlow component
<ReactFlow
  edgeTypes={edgeTypes}
  defaultEdgeOptions={{
    type: 'context',
    animated: true,
    style: { strokeWidth: 2 },
  }}
  connectionLineStyle={{ strokeWidth: 2, stroke: '#3b82f6' }}
  // ... other props
/>
```

**Context Building Function:**

```typescript
// app/lib/contextBuilder.ts
export async function buildContextFromNodes(
  nodeIds: string[],
  currentCanvasId: string
): Promise<string> {
  const db = await initDB();
  const canvasState = await db.get('canvasStates', currentCanvasId);

  if (!canvasState) return '';

  const contextParts: string[] = [];

  for (const nodeId of nodeIds) {
    const node = canvasState.nodes.find(n => n.id === nodeId);
    if (!node) continue;

    const nodeData = node.data as ChatNodeData | NoteNodeData | QueryNodeData;

    contextParts.push(`## ${nodeData.label}\n${nodeData.content}\n`);

    // Include conversation thread for chat nodes
    if (nodeData.type === NodeType.CHAT && nodeData.conversationThread) {
      const thread = nodeData.conversationThread
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      contextParts.push(thread);
    }
  }

  return contextParts.join('\n---\n');
}
```

**Usage in ChatNode:**

```typescript
// ChatNode.tsx - sendMessage function
const contextNodes = data.contextSources || [];

// Get all incoming edges
const incomingEdges = edges.filter(e =>
  e.target === id &&
  e.data?.sharesContext === true
);

// Extract source node IDs
const contextSourceIds = incomingEdges.map(e => e.source);

// Build context
const context = await buildContextFromNodes(contextSourceIds, canvasId);

// Include in API call
const response = await api.searchRabbitHole({
  query: input,
  previousConversation: [
    ...(context ? [{ role: 'system', content: `Context:\n${context}` }] : []),
    ...messages,
    userMessage,
  ],
  concept: data.label,
});
```

**Complexity:** Medium

---

## 4.2 Context Cherry-Picking UI

**New Files:**
- `app/components/ContextSourcesPanel.tsx`

**Implementation:**

```typescript
// app/components/ContextSourcesPanel.tsx
interface ContextSourcesPanelProps {
  nodeId: string;
  currentSources: string[];
  availableNodes: Node[];
  onUpdateSources: (sources: string[]) => void;
}

export function ContextSourcesPanel({
  nodeId,
  currentSources,
  availableNodes,
  onUpdateSources,
}: ContextSourcesPanelProps) {
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(currentSources)
  );

  const toggleSource = (sourceId: string) => {
    const newSources = new Set(selectedSources);
    if (newSources.has(sourceId)) {
      newSources.delete(sourceId);
    } else {
      newSources.add(sourceId);
    }
    setSelectedSources(newSources);
    onUpdateSources(Array.from(newSources));
  };

  // Calculate total token count (rough estimate)
  const estimatedTokens = Array.from(selectedSources).reduce((acc, sourceId) => {
    const node = availableNodes.find(n => n.id === sourceId);
    if (!node) return acc;
    return acc + (node.data.content?.length || 0) / 4; // Rough estimate
  }, 0);

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Context Sources</h3>
        <span className="text-xs text-zinc-400">
          ~{Math.round(estimatedTokens)} tokens
        </span>
      </div>

      <div className="space-y-2">
        {availableNodes
          .filter(n => n.id !== nodeId) // Exclude self
          .map(node => (
            <label
              key={node.id}
              className="flex items-center gap-2 p-2 hover:bg-zinc-800 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSources.has(node.id)}
                onChange={() => toggleSource(node.id)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{node.data.label}</div>
                <div className="text-xs text-zinc-400">
                  {node.data.content?.slice(0, 60)}...
                </div>
              </div>
              <span className="text-xs text-zinc-500">
                {Math.round((node.data.content?.length || 0) / 4)} tokens
              </span>
            </label>
          ))}
      </div>
    </div>
  );
}
```

**Integration in ChatNode:**

Add a "Context" button in the header that opens a modal with the ContextSourcesPanel.

**Complexity:** Medium

---

## 4.3 Conversation Branching

**New Files:**
- `app/components/BranchButton.tsx`

**Modified Files:**
- `app/components/nodes/ChatNode.tsx`

**Implementation:**

```typescript
// app/components/BranchButton.tsx
interface BranchButtonProps {
  nodeId: string;
  conversationThread: ConversationMessage[];
  label: string;
  onBranch: (newNodeId: string) => void;
}

export function BranchButton({ nodeId, conversationThread, label, onBranch }: BranchButtonProps) {
  const createBranch = () => {
    // Create new chat node
    const newNode = createNode(NodeType.CHAT, {
      x: position.x + 600,
      y: position.y,
    }, {
      label: `${label} (Branch)`,
      conversationThread: [...conversationThread], // Clone thread
    });

    // Add node to canvas
    addNode(newNode);

    // Create edge from parent
    const edge = {
      id: `${nodeId}-${newNode.id}`,
      source: nodeId,
      target: newNode.id,
      type: 'context',
      data: { sharesContext: true },
    };
    addEdge(edge);

    onBranch(newNode.id);
  };

  return (
    <button
      onClick={createBranch}
      className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded flex items-center gap-1"
      title="Branch conversation from this point"
    >
      <GitBranchIcon className="w-3 h-3" />
      Branch
    </button>
  );
}
```

**Add to ChatNode header:**

```typescript
// ChatNode.tsx
<BaseNodeHeader>
  <input value={data.label} ... />
  <div className="ml-auto flex gap-2">
    <BranchButton
      nodeId={id}
      conversationThread={messages}
      label={data.label}
      onBranch={(newId) => {/* Optional: focus new node */}}
    />
  </div>
</BaseNodeHeader>
```

**Visual Branch Indicators:**

Use different edge styles for branches:

```typescript
// Custom edge styling based on metadata
const edgeStyle = edge.data?.isBranch
  ? { strokeDasharray: '5,5', stroke: '#a855f7' } // Purple dashed
  : { stroke: '#3b82f6' }; // Blue solid
```

**Complexity:** Medium

---

## Deliverables - Phase 4

✅ Manual connection drawing
✅ Context toggle per edge
✅ Context sources panel with token estimation
✅ Branch conversation button
✅ Visual branch indicators
✅ Context building from connected nodes

**Success Criteria:**
- Users can draw connections between any nodes
- Context sharing can be toggled per connection
- Branching creates independent conversation threads
- Context sources are clearly visible and configurable

---

# PHASE 5: Search, PDF, & Export
**Priority:** 🟡 Important
**Estimated Time:** 2-3 weeks
**Dependencies:** Phase 1, Phase 2

## Goals
- Canvas-wide search functionality
- PDF upload and display
- JSON export/import
- Markdown export

---

## 5.1 Canvas Search

**New Files:**
- `app/components/CanvasSearch.tsx`
- `app/hooks/useSearch.ts`

**Implementation:**

```typescript
// app/hooks/useSearch.ts
export function useSearch(nodes: Node[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = nodes.filter(node => {
      const data = node.data as BaseNodeData;
      return (
        data.label?.toLowerCase().includes(query) ||
        data.content?.toLowerCase().includes(query)
      );
    });

    setSearchResults(results);
    setCurrentResultIndex(0);
  }, [searchQuery, nodes]);

  const goToResult = (index: number) => {
    if (searchResults.length === 0) return;

    const result = searchResults[index];
    if (!result) return;

    // Center on node
    const reactFlowInstance = useReactFlow();
    reactFlowInstance.fitView({
      nodes: [{ id: result.id }],
      duration: 400,
      padding: 0.3,
    });

    // Highlight node temporarily
    updateNodeData(result.id, {
      ...result.data,
      isHighlighted: true,
    });

    setTimeout(() => {
      updateNodeData(result.id, {
        ...result.data,
        isHighlighted: false,
      });
    }, 2000);
  };

  const nextResult = () => {
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    goToResult(nextIndex);
  };

  const prevResult = () => {
    const prevIndex = currentResultIndex === 0
      ? searchResults.length - 1
      : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    goToResult(prevIndex);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    currentResultIndex,
    nextResult,
    prevResult,
    goToResult,
  };
}
```

```typescript
// app/components/CanvasSearch.tsx
export function CanvasSearch({ nodes }: { nodes: Node[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    currentResultIndex,
    nextResult,
    prevResult,
  } = useSearch(nodes);

  // Cmd/Ctrl + K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-[600px] shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent border-none outline-none text-lg"
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>
                {currentResultIndex + 1} / {searchResults.length}
              </span>
              <button onClick={prevResult} className="p-1 hover:bg-zinc-800 rounded">
                <ChevronUpIcon className="w-4 h-4" />
              </button>
              <button onClick={nextResult} className="p-1 hover:bg-zinc-800 rounded">
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-zinc-800 rounded">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((node, index) => (
              <button
                key={node.id}
                onClick={() => {
                  goToResult(index);
                  setIsOpen(false);
                }}
                className={`w-full p-3 text-left hover:bg-zinc-800 border-b border-zinc-800 ${
                  index === currentResultIndex ? 'bg-zinc-800' : ''
                }`}
              >
                <div className="font-medium">{node.data.label}</div>
                <div className="text-sm text-zinc-400 truncate">
                  {node.data.content?.slice(0, 100)}...
                </div>
              </button>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <div className="p-8 text-center text-zinc-400">
            No nodes found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
```

**Features:**
- Cmd/Ctrl + K to open
- Search by node label or content
- Navigate results with arrow buttons or Enter
- Automatically centers on result
- Temporary highlight animation

**Complexity:** Low-Medium

---

## 5.2 PDF Processing

**New Files:**
- `app/components/nodes/PDFNode.tsx`
- `app/lib/pdfExtractor.ts`

**Dependencies:**
```bash
npm install pdfjs-dist
npm install --save-dev @types/pdfjs-dist
```

**Implementation:**

```typescript
// app/lib/pdfExtractor.ts
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export async function extractPDFText(file: File): Promise<{
  text: string;
  numPages: number;
  metadata: any;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const metadata = await pdf.getMetadata();
  const numPages = pdf.numPages;

  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }

  return {
    text: fullText,
    numPages,
    metadata: metadata.info,
  };
}

export async function renderPDFPage(
  file: File,
  pageNumber: number,
  canvas: HTMLCanvasElement
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale: 1.5 });
  const context = canvas.getContext('2d')!;

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;
}
```

```typescript
// app/components/nodes/PDFNode.tsx
interface PDFNodeData extends BaseNodeData {
  type: NodeType.PDF;
  pdfFile: string;        // Base64 or blob URL
  extractedText: string;
  numPages: number;
  currentPage: number;
}

export function PDFNode({ id, data }: NodeProps<PDFNodeData>) {
  const [currentPage, setCurrentPage] = useState(data.currentPage || 1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.pdfFile) return;

    // Reconstruct File from base64
    const blob = base64ToBlob(data.pdfFile);
    const file = new File([blob], 'document.pdf', { type: 'application/pdf' });

    renderPDFPage(file, currentPage, canvasRef.current);
  }, [currentPage, data.pdfFile]);

  return (
    <BaseNode className="w-[600px]">
      <BaseNodeHeader>
        <input
          value={data.label}
          onChange={(e) => updateNodeData(id, { ...data, label: e.target.value })}
          className="bg-transparent border-none outline-none w-full"
        />
      </BaseNodeHeader>

      <BaseNodeContent className="h-[700px]">
        <div className="flex flex-col h-full">
          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto bg-zinc-800 flex items-center justify-center">
            <canvas ref={canvasRef} />
          </div>

          {/* Page Controls */}
          <div className="flex items-center justify-between p-2 border-t border-zinc-700">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm">
              Page {currentPage} / {data.numPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(data.numPages, currentPage + 1))}
              disabled={currentPage === data.numPages}
              className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </BaseNodeContent>

      <BaseNodeFooter>
        <LabeledHandle type="target" position={Position.Left} />
        <LabeledHandle type="source" position={Position.Right} label="Text" />
      </BaseNodeFooter>
    </BaseNode>
  );
}
```

**PDF Upload Flow:**
1. User clicks "Upload PDF" in node creation toolbar
2. File picker opens
3. Extract text in background
4. Create PDFNode with embedded file (base64)
5. Extracted text available as context for connected nodes

**Complexity:** Medium-High

---

## 5.3 JSON Export/Import

**New Files:**
- `app/lib/export/jsonExporter.ts`
- `app/lib/export/jsonImporter.ts`
- `app/components/ExportDialog.tsx`

**Implementation:**

```typescript
// app/lib/export/jsonExporter.ts
export interface ExportData {
  version: string;
  exportedAt: Date;
  canvas: Canvas;
  state: CanvasState;
}

export async function exportCanvasAsJSON(canvasId: string): Promise<string> {
  const db = await initDB();
  const canvas = await db.get('canvases', canvasId);
  const state = await db.get('canvasStates', canvasId);
  const todos = await db.getAllFromIndex('todos', 'by-canvas', canvasId);

  if (!canvas || !state) {
    throw new Error('Canvas not found');
  }

  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: new Date(),
    canvas,
    state: {
      ...state,
      todos,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadJSON(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

```typescript
// app/lib/export/jsonImporter.ts
export async function importCanvasFromJSON(json: string): Promise<string> {
  const data: ExportData = JSON.parse(json);

  // Validate version
  if (data.version !== '1.0.0') {
    throw new Error('Unsupported export version');
  }

  const db = await initDB();

  // Generate new canvas ID
  const newCanvasId = generateId();

  // Import canvas
  const newCanvas: Canvas = {
    ...data.canvas,
    id: newCanvasId,
    name: `${data.canvas.name} (Imported)`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.add('canvases', newCanvas);

  // Import state
  const newState: CanvasState = {
    ...data.state,
    canvasId: newCanvasId,
  };

  await db.add('canvasStates', newState);

  // Import todos
  if (data.state.todos) {
    for (const todo of data.state.todos) {
      await db.add('todos', {
        ...todo,
        id: generateId(),
        canvasId: newCanvasId,
      });
    }
  }

  return newCanvasId;
}
```

```typescript
// app/components/ExportDialog.tsx
export function ExportDialog({ canvasId, canvasName }: { canvasId: string; canvasName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportJSON = async () => {
    const json = await exportCanvasAsJSON(canvasId);
    downloadJSON(json, `${canvasName.replace(/\s/g, '-')}.json`);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const json = await file.text();
    const newCanvasId = await importCanvasFromJSON(json);

    // Switch to imported canvas
    window.location.href = `/?canvas=${newCanvasId}`;
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="...">
        Export/Import
      </button>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Export & Import</h2>

            <div className="space-y-2">
              <h3 className="font-semibold">Export</h3>
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Export as JSON
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Import</h3>
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
                <div className="w-full px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-center cursor-pointer">
                  Import from JSON
                </div>
              </label>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
```

**Complexity:** Low-Medium

---

## 5.4 Markdown Export

**New Files:**
- `app/lib/export/markdownExporter.ts`

**Implementation:**

```typescript
// app/lib/export/markdownExporter.ts
export async function exportCanvasAsMarkdown(canvasId: string): Promise<string> {
  const db = await initDB();
  const canvas = await db.get('canvases', canvasId);
  const state = await db.get('canvasStates', canvasId);

  if (!canvas || !state) {
    throw new Error('Canvas not found');
  }

  let markdown = `# ${canvas.name}\n\n`;

  if (canvas.description) {
    markdown += `${canvas.description}\n\n`;
  }

  markdown += `**Created:** ${canvas.createdAt.toLocaleDateString()}\n`;
  markdown += `**Last Updated:** ${canvas.updatedAt.toLocaleDateString()}\n`;
  markdown += `**Nodes:** ${state.nodes.length}\n\n`;
  markdown += `---\n\n`;

  // Sort nodes by creation date
  const sortedNodes = [...state.nodes].sort((a, b) => {
    const aDate = new Date(a.data.createdAt || 0);
    const bDate = new Date(b.data.createdAt || 0);
    return aDate.getTime() - bDate.getTime();
  });

  for (const node of sortedNodes) {
    const data = node.data as BaseNodeData;

    markdown += `## ${data.label}\n\n`;

    if (data.type === NodeType.CHAT && data.conversationThread) {
      markdown += `**Type:** Chat\n\n`;

      for (const msg of data.conversationThread) {
        markdown += `**${msg.role === 'user' ? 'User' : 'Assistant'}:**\n\n`;
        markdown += `${msg.content}\n\n`;
      }
    } else {
      markdown += `**Type:** ${data.type}\n\n`;
      markdown += `${data.content}\n\n`;
    }

    // Add sources if available
    if (data.sources && data.sources.length > 0) {
      markdown += `**Sources:**\n\n`;
      for (const source of data.sources) {
        markdown += `- [${source.title}](${source.url})\n`;
      }
      markdown += `\n`;
    }

    markdown += `---\n\n`;
  }

  // Add todos
  const todos = await db.getAllFromIndex('todos', 'by-canvas', canvasId);
  if (todos.length > 0) {
    markdown += `## Todo List\n\n`;
    for (const todo of todos) {
      markdown += `- [${todo.completed ? 'x' : ' '}] ${todo.content}\n`;
    }
  }

  return markdown;
}

export function downloadMarkdown(markdown: string, filename: string) {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Add to ExportDialog:**

```typescript
const handleExportMarkdown = async () => {
  const markdown = await exportCanvasAsMarkdown(canvasId);
  downloadMarkdown(markdown, `${canvasName.replace(/\s/g, '-')}.md`);
};
```

**Complexity:** Low

---

## Deliverables - Phase 5

✅ Canvas search with Cmd/Ctrl+K
✅ PDF upload and display node
✅ PDF text extraction for context
✅ JSON export/import
✅ Markdown export
✅ Export dialog UI

**Success Criteria:**
- Search finds nodes by content
- PDFs display correctly with page navigation
- Exported JSON can be re-imported
- Markdown export is readable and well-formatted

---

# PHASE 6: Advanced Features & Polish
**Priority:** 🟢 Enhancement
**Estimated Time:** 2-3 weeks
**Dependencies:** All previous phases

## Goals
- System prompt customization per node
- Image generation integration
- Voice input
- Todo list integration
- Performance optimization

---

## 6.1 System Prompt Customization

**New Files:**
- `app/components/SystemPromptEditor.tsx`

**Modified Files:**
- `app/components/nodes/ChatNode.tsx`

**Implementation:**

```typescript
// app/components/SystemPromptEditor.tsx
export function SystemPromptEditor({
  nodeId,
  currentPrompt,
  onSave,
}: {
  nodeId: string;
  currentPrompt?: string;
  onSave: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState(currentPrompt || '');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  useEffect(() => {
    // Load saved templates from localStorage
    const saved = localStorage.getItem('promptTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  const saveAsTemplate = () => {
    const name = window.prompt('Template name:');
    if (!name) return;

    const newTemplate = { name, content: prompt };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('promptTemplates', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">System Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-40 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg"
          placeholder="You are a helpful assistant..."
        />
      </div>

      {templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Templates</label>
          <div className="space-y-1">
            {templates.map((template, i) => (
              <button
                key={i}
                onClick={() => setPrompt(template.content)}
                className="w-full px-3 py-2 text-left bg-zinc-800 hover:bg-zinc-700 rounded"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onSave(prompt)}
          className="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={saveAsTemplate}
          className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600"
        >
          Save as Template
        </button>
      </div>
    </div>
  );
}
```

**Integration in ChatNode:**

```typescript
// Add button to header
<button
  onClick={() => setShowPromptEditor(true)}
  className="p-1 hover:bg-zinc-800 rounded"
  title="Edit system prompt"
>
  <SettingsIcon className="w-4 h-4" />
</button>

// In sendMessage, prepend system prompt
const messages = [
  ...(data.systemPrompt ? [{ role: 'system', content: data.systemPrompt }] : []),
  ...conversationThread,
  userMessage,
];
```

**Complexity:** Low-Medium

---

## 6.2 Image Generation Integration

**New Files:**
- `app/components/nodes/ImageNode.tsx`
- `app/api/image/generate/route.ts`

**Dependencies:**
```bash
npm install openai  # Or other image gen API
```

**Implementation:**

```typescript
// app/api/image/generate/route.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    return Response.json({
      imageUrl: response.data[0].url,
      revisedPrompt: response.data[0].revised_prompt,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
```

```typescript
// app/components/nodes/ImageNode.tsx
interface ImageNodeData extends BaseNodeData {
  type: NodeType.IMAGE;
  prompt: string;
  imageUrl?: string;
  revisedPrompt?: string;
}

export function ImageNode({ id, data }: NodeProps<ImageNodeData>) {
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      updateNodeData(id, {
        ...data,
        prompt,
        imageUrl: result.imageUrl,
        revisedPrompt: result.revisedPrompt,
      });
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <BaseNode className="w-[500px]">
      <BaseNodeHeader>
        <input
          value={data.label}
          onChange={(e) => updateNodeData(id, { ...data, label: e.target.value })}
          className="bg-transparent border-none outline-none w-full"
        />
      </BaseNodeHeader>

      <BaseNodeContent className="h-[600px] flex flex-col">
        <div className="mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg resize-none"
          />
          <button
            onClick={generateImage}
            disabled={isGenerating || !prompt.trim()}
            className="mt-2 w-full px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {data.imageUrl && (
          <div className="flex-1 flex flex-col">
            <img
              src={data.imageUrl}
              alt={data.prompt}
              className="w-full h-auto rounded-lg"
            />
            {data.revisedPrompt && (
              <p className="mt-2 text-xs text-zinc-400">
                Revised: {data.revisedPrompt}
              </p>
            )}
          </div>
        )}
      </BaseNodeContent>

      <BaseNodeFooter>
        <LabeledHandle type="target" position={Position.Left} label="Prompt" />
        <LabeledHandle type="source" position={Position.Right} label="Image" />
      </BaseNodeFooter>
    </BaseNode>
  );
}
```

**Complexity:** Medium

---

## 6.3 Voice Input

**New Files:**
- `app/hooks/useVoiceInput.ts`
- `app/components/VoiceInputButton.tsx`

**Implementation:**

```typescript
// app/hooks/useVoiceInput.ts
export function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setTranscript(prev => prev + ' ' + final);
        onTranscript(final);
      } else {
        setTranscript(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
  };
}
```

```typescript
// app/components/VoiceInputButton.tsx
export function VoiceInputButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const { isListening, transcript, startListening, stopListening } = useVoiceInput(onTranscript);

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-full ${
          isListening
            ? 'bg-red-600 animate-pulse'
            : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        <MicIcon className="w-5 h-5" />
      </button>

      {isListening && transcript && (
        <div className="absolute bottom-full mb-2 left-0 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm whitespace-nowrap">
          {transcript}
        </div>
      )}
    </div>
  );
}
```

**Add to ChatNode input area:**

```typescript
<div className="flex gap-2">
  <VoiceInputButton onTranscript={(text) => setInput(prev => prev + ' ' + text)} />
  <input ... />
  <button>Send</button>
</div>
```

**Complexity:** Low-Medium

---

## 6.4 Todo List Integration

**New Files:**
- `app/components/TodoPanel.tsx`
- `app/hooks/useTodos.ts`

**Implementation:**

```typescript
// app/hooks/useTodos.ts
export function useTodos(canvasId: string) {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    loadTodos();
  }, [canvasId]);

  const loadTodos = async () => {
    const db = await initDB();
    const allTodos = await db.getAllFromIndex('todos', 'by-canvas', canvasId);
    setTodos(allTodos);
  };

  const addTodo = async (content: string, nodeId?: string) => {
    const db = await initDB();
    const todo: Todo = {
      id: generateId(),
      canvasId,
      nodeId,
      content,
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
    };

    await db.add('todos', todo);
    setTodos(prev => [...prev, todo]);
  };

  const toggleTodo = async (todoId: string) => {
    const db = await initDB();
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const updated = { ...todo, completed: !todo.completed };
    await db.put('todos', updated);
    setTodos(prev => prev.map(t => t.id === todoId ? updated : t));
  };

  const deleteTodo = async (todoId: string) => {
    const db = await initDB();
    await db.delete('todos', todoId);
    setTodos(prev => prev.filter(t => t.id !== todoId));
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
```

```typescript
// app/components/TodoPanel.tsx
export function TodoPanel({ canvasId }: { canvasId: string }) {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos(canvasId);
  const [newTodo, setNewTodo] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    if (!newTodo.trim()) return;
    addTodo(newTodo);
    setNewTodo('');
  };

  const incompleteTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-2"
      >
        <CheckSquareIcon className="w-4 h-4" />
        Todos ({incompleteTodos.length})
      </button>

      {isOpen && (
        <div className="fixed left-4 bottom-16 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-h-[600px] flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold mb-2">Todo List</h3>
            <div className="flex gap-2">
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add a todo..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
              />
              <button
                onClick={handleAdd}
                className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {incompleteTodos.map(todo => (
              <div
                key={todo.id}
                className="flex items-start gap-2 p-2 bg-zinc-800 rounded"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleTodo(todo.id)}
                  className="mt-1"
                />
                <span className="flex-1">{todo.content}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            {completedTodos.length > 0 && (
              <>
                <div className="text-sm text-zinc-500 mt-4 mb-2">Completed</div>
                {completedTodos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-2 p-2 bg-zinc-800/50 rounded opacity-50"
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleTodo(todo.id)}
                      className="mt-1"
                    />
                    <span className="flex-1 line-through">{todo.content}</span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

**Complexity:** Low-Medium

---

## 6.5 Performance Optimization

**Optimizations:**

1. **Virtual Rendering for Large Graphs**
```typescript
// Only render nodes within viewport + buffer
import { useOnViewportChange } from '@xyflow/react';

function RabbitFlow({ nodes, edges }) {
  const [visibleNodes, setVisibleNodes] = useState(nodes);

  useOnViewportChange({
    onChange: (viewport) => {
      const visible = nodes.filter(node => {
        // Check if node is within viewport
        return isNodeVisible(node, viewport);
      });
      setVisibleNodes(visible);
    },
  });

  return <ReactFlow nodes={visibleNodes} edges={edges} />;
}
```

2. **Debounced Auto-Save** (already implemented in Phase 1)

3. **Lazy Load Images**
```typescript
<img
  src={imageUrl}
  loading="lazy"
  decoding="async"
/>
```

4. **Memoize Node Components**
```typescript
export const ChatNode = memo(({ id, data }: NodeProps<ChatNodeData>) => {
  // ... component
}, (prev, next) => {
  return prev.data === next.data;
});
```

5. **IndexedDB Cursor Pagination**
```typescript
// Load canvases in batches
async function loadCanvasesPaginated(limit: number = 20, offset: number = 0) {
  const db = await initDB();
  const tx = db.transaction('canvases', 'readonly');
  const index = tx.store.index('by-updated');

  const canvases: Canvas[] = [];
  let cursor = await index.openCursor(null, 'prev'); // Newest first
  let skipped = 0;

  while (cursor && canvases.length < limit) {
    if (skipped >= offset) {
      canvases.push(cursor.value);
    }
    skipped++;
    cursor = await cursor.continue();
  }

  return canvases;
}
```

**Complexity:** Medium

---

## Deliverables - Phase 6

✅ System prompt editor with templates
✅ Image generation node (DALL-E integration)
✅ Voice input with speech recognition
✅ Todo list panel per canvas
✅ Performance optimizations
✅ Virtual rendering for large graphs

**Success Criteria:**
- Custom system prompts work per node
- Image generation produces quality results
- Voice input transcribes accurately
- Todos persist and sync with canvas
- App handles 100+ nodes smoothly

---

# POST-LAUNCH: Future Enhancements

## Collaboration Features
- Real-time multiplayer editing (WebSocket/Yjs)
- Share canvas via public link
- Comments on nodes
- User presence indicators

## AI Enhancements
- Multiple AI model selection per node
- Function calling for tool use
- RAG (Retrieval Augmented Generation) from canvas
- Auto-summarization of long conversations

## Advanced Canvas Features
- Canvas templates (research, brainstorming, etc.)
- Node grouping/containers
- Sticky notes layer
- Drawing tools (freehand annotations)

## Integrations
- Import from Notion, Obsidian, Roam
- Export to presentation format
- Zapier/Make.com webhooks
- Browser extension for quick capture

## Mobile
- React Native mobile app
- Touch-optimized interface
- Offline-first sync

---

# Technical Debt & Testing Strategy

## Unit Tests
- Node factory functions
- Context builder
- Export/import functions
- IndexedDB operations

## Integration Tests
- Canvas creation flow
- Node creation and editing
- Search functionality
- Auto-save system

## E2E Tests (Playwright)
- Complete user journey: create canvas → add nodes → search → export
- Multi-canvas switching
- Large graph performance

## Accessibility
- Keyboard navigation for all features
- Screen reader support for nodes
- ARIA labels on interactive elements
- Focus management in modals

---

# Deployment Checklist

## Production Optimizations
- [ ] Enable Next.js image optimization
- [ ] Set up CDN for static assets
- [ ] Implement service worker for offline support
- [ ] Add error boundaries
- [ ] Set up Sentry for error tracking
- [ ] Configure CSP headers
- [ ] Optimize bundle size (code splitting)
- [ ] Enable gzip/brotli compression

## Environment Variables
```bash
# Required
OPENROUTER_API_KEY=
TAVILY_API_KEY=

# Optional
OPENAI_API_KEY=           # For image generation
NEXT_PUBLIC_POSTHOG_KEY=  # Analytics
SENTRY_DSN=               # Error tracking
```

## Monitoring
- Set up PostHog for analytics
- Track key metrics:
  - Canvas creation rate
  - Node creation rate
  - Search usage
  - Export frequency
  - Performance metrics (LCP, FID, CLS)

---

# Summary: Implementation Order

## Phase 1 (Weeks 1-3): Foundation
1. IndexedDB schema & storage layer
2. Canvas management UI
3. Auto-save system
4. Load/restore functionality

## Phase 2 (Weeks 4-6): Node System
1. Node type architecture
2. ChatNode & NoteNode components
3. Click-to-create system
4. Keyboard shortcuts

## Phase 3 (Weeks 7-8): Canvas
1. Infinite canvas configuration
2. Minimap & controls
3. Navigation toolbar

## Phase 4 (Weeks 9-11): Context & Branching
1. Manual connections
2. Context toggle per edge
3. Context cherry-picking UI
4. Branch conversation feature

## Phase 5 (Weeks 12-14): Search & Export
1. Canvas search
2. PDF processing
3. JSON export/import
4. Markdown export

## Phase 6 (Weeks 15-17): Polish
1. System prompt customization
2. Image generation
3. Voice input
4. Todo list
5. Performance optimization

---

**Total Estimated Timeline:** 17-20 weeks (4-5 months)

**Team Size Recommendation:** 1-2 full-stack developers

**Key Success Metrics:**
- User can create unlimited canvases ✅
- State persists reliably ✅
- Manual node creation works intuitively ✅
- Context control is granular ✅
- Export/import maintains data integrity ✅
- Performance handles 100+ nodes ✅
