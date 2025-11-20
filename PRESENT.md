# RabbitHoles AI - Manual Exploration System
## Complete Implementation Roadmap

---

## Executive Summary

This document provides a complete, ordered implementation roadmap for transforming RabbitHoles from an automated exploration tool into a **user-controlled research experience** where AI suggestions enhance rather than dictate the exploration path. Users should feel in complete control of their research journey, with AI acting as an intelligent assistant.

**Vision:** Transform the current automated exploration into a user-driven research tool where users have complete agency over node creation, connections, and exploration paths.

---

## Core Principles

### 1. User Agency First
- Every node creation is a deliberate user choice
- AI suggestions are always optional and dismissible
- Users can ignore, modify, or replace any AI-generated content
- The canvas is user-controlled - they build their research map

### 2. Flexible Exploration Modes
- **Manual Mode**: Full user control, AI assists only when asked
- **Guided Mode**: AI suggests, user decides
- **Hybrid Mode**: Mix of manual creation and AI exploration
- **Classic Mode**: Current auto-exploration (kept as option)

### 3. Non-Linear Thinking
- Support jumping between ideas without forced connections
- Allow orphan nodes (nodes without connections)
- Enable retrospective linking (connect ideas after creation)
- Support multiple exploration threads simultaneously

---

## Current State Assessment

**Already Implemented:**
- ✅ Basic IndexedDB sync (useCurrentCanvas, useAutoSave)
- ✅ Canvas Manager component
- ✅ Node creation modal
- ✅ Repository functions (createCanvas, loadCanvasState)
- ✅ Dagre layout for graph visualization
- ✅ MainNode component with content display
- ✅ Conversation history tracking
- ✅ AI response generation (OpenRouter/Gemini)
- ✅ Tavily search integration

**Missing for Manual Exploration:**
- ❌ Click-to-create nodes anywhere on canvas
- ❌ Multiple node types (Chat, Note, Query, etc.)
- ❌ AI suggestion panel (collapsible)
- ❌ Manual connection drawing
- ❌ Context control per connection
- ❌ Node templates and macros
- ❌ Exploration modes (Manual/Guided/Hybrid/Classic)
- ❌ Enhanced node interaction (inline editing, branching)

---

## Implementation Phases

---

# PHASE 1: Manual Node Creation & UI Foundation ✅
**Status:** ✅ **COMPLETED** (2025-01-20)
**PR:** #13
**Goal:** Enable full user control over node creation and placement

**See CHANGELOG.md for detailed implementation notes.**

### Completed Features:
- ✅ Empty canvas welcome screen (EmptyCanvasWelcome with gamified deck UI)
- ✅ Context menu for node creation (right-click canvas)
- ✅ Floating action menu (+) button
- ✅ Multiple node types: ChatNode, NoteNode, QueryNode, MainNode
- ✅ Node type registry with metadata (app/lib/nodeTypes.ts)
- ✅ Complete shadcn/ui component library (15+ components)
- ✅ Theme provider with dark mode support
- ✅ Infinite canvas with pan/zoom controls
- ✅ Enhanced CanvasManager with Toast notifications

### Known Tech Debt:
- ⚠️ Duplicate utils.ts in app/lib/ and lib/
- ⚠️ Duplicate UI components in app/components/ui/ and components/ui/
- ⚠️ QueryNode needs full implementation
- ⚠️ ExplorationModeSelector not yet implemented
- ⚠️ Keyboard shortcuts not yet implemented

---

# PHASE 2: AI Suggestion System (Non-Intrusive)
**Priority:** 🔴 Critical
**Estimated Time:** 2 weeks
**Goal:** Add optional AI suggestions that enhance without dictating

## 2.1 Collapsible Suggestion Panel

**Objective:** AI suggests next steps, but users control visibility and acceptance.

**New Component:**

```typescript
// app/components/ai/SuggestionPanel.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Suggestion {
  type: 'question' | 'connection' | 'expansion';
  content: string;
  reasoning?: string;
}

export function SuggestionPanel({
  currentNode,
  onAccept,
  onDismiss,
  onRefresh,
}: {
  currentNode: Node | null;
  onAccept: (suggestion: Suggestion) => void;
  onDismiss: (suggestion: Suggestion) => void;
  onRefresh: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentNode && isOpen) {
      loadSuggestions();
    }
  }, [currentNode, isOpen]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify({ nodeId: currentNode?.id }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed right-4 top-1/2 -translate-y-1/2"
        onClick={() => setIsOpen(true)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg overflow-y-auto">
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">AI Suggestions</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {!currentNode && (
          <p className="text-sm text-muted-foreground">
            Select a node to see suggestions
          </p>
        )}

        {isLoading && <div className="text-sm">Loading suggestions...</div>}

        {suggestions.map((suggestion, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary">{suggestion.type}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onDismiss(suggestion)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{suggestion.content}</p>
              {suggestion.reasoning && (
                <p className="text-xs text-muted-foreground">
                  {suggestion.reasoning}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onAccept(suggestion)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {/* Open edit dialog */}}
                >
                  Modify
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {suggestions.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onRefresh}
          >
            Request Different Suggestions
          </Button>
        )}
      </div>
    </div>
  );
}
```

**Install components:**
```bash
npx shadcn@latest add badge
```

---

## 2.2 Contextual AI Actions (Right-Click Menu)

**New Component:**

```typescript
// app/components/ai/ContextualActions.tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  Search,
  CheckCheck,
  Link2
} from "lucide-react";

export function NodeContextMenu({
  children,
  node,
  onAction
}: {
  children: React.ReactNode;
  node: Node;
  onAction: (action: string) => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onAction('raise-questions')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          What questions does this raise?
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('find-contradictions')}>
          <AlertTriangle className="mr-2 h-4 w-4" />
          Find contradicting viewpoints
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('suggest-connections')}>
          <Link2 className="mr-2 h-4 w-4" />
          Suggest connections
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onAction('expand')}>
          <Lightbulb className="mr-2 h-4 w-4" />
          Expand this idea
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('find-evidence')}>
          <Search className="mr-2 h-4 w-4" />
          Find supporting evidence
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onAction('fact-check')}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Fact-check this claim
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

**Install:**
```bash
npx shadcn@latest add context-menu
```

---

## 2.3 Smart Connection Suggestions

**Implementation:**

```typescript
// app/components/ai/ConnectionSuggestions.tsx
import { useEffect, useState } from 'react';
import { useReactFlow, Node, Edge } from '@xyflow/react';

interface SuggestedConnection {
  source: string;
  target: string;
  reason: string;
  confidence: number;
}

export function useConnectionSuggestions(nodes: Node[], edges: Edge[]) {
  const [suggestions, setSuggestions] = useState<SuggestedConnection[]>([]);
  const { addEdges } = useReactFlow();

  useEffect(() => {
    if (nodes.length < 2) return;

    // Call AI to analyze potential connections
    analyzePotentialConnections(nodes, edges).then(setSuggestions);
  }, [nodes, edges]);

  const acceptSuggestion = (suggestion: SuggestedConnection) => {
    addEdges({
      id: `${suggestion.source}-${suggestion.target}`,
      source: suggestion.source,
      target: suggestion.target,
      type: 'suggested',
      animated: true,
      style: { strokeDasharray: '5,5' },
    });

    setSuggestions(prev =>
      prev.filter(s => s.source !== suggestion.source || s.target !== suggestion.target)
    );
  };

  return { suggestions, acceptSuggestion };
}

async function analyzePotentialConnections(
  nodes: Node[],
  edges: Edge[]
): Promise<SuggestedConnection[]> {
  // AI analyzes node content and suggests connections
  const response = await fetch('/api/analyze-connections', {
    method: 'POST',
    body: JSON.stringify({ nodes, existingEdges: edges }),
  });

  return response.json();
}
```

**Visual Representation:**

```typescript
// Show dotted lines for suggested connections
const SuggestedEdge = ({ id, source, target, data }) => {
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeDasharray: '5,5',
          stroke: '#666',
          opacity: 0.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <Button size="sm" onClick={() => data.onAccept()}>
            Connect?
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
```

---

## Deliverables - Phase 2

✅ Collapsible AI suggestion panel
✅ Contextual right-click AI actions
✅ Smart connection suggestions with dotted preview
✅ Accept/modify/dismiss for all suggestions
✅ Request alternative suggestions
✅ Suggestion reasoning display

**Success Criteria:**
- AI suggestions are helpful but never intrusive
- Users can dismiss or hide all suggestions
- Suggestions adapt based on exploration mode
- Connection suggestions are visually distinct

---

# PHASE 3: Manual Connections & Context Control
**Priority:** 🔴 Critical
**Estimated Time:** 2 weeks
**Goal:** Full control over node connections and context sharing

## 3.1 Drag-to-Connect with Connection Types

**Implementation using React Flow UI:**

```bash
npx shadcn@latest add https://ui.reactflow.dev/data-edge
```

**Enhanced Edge Component:**

```typescript
// app/components/edges/ContextualEdge.tsx
import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, LinkOff, ArrowRight, ArrowLeftRight, Zap, Check, Plus } from 'lucide-react';

type ConnectionType = 'leads-to' | 'related' | 'contradicts' | 'supports' | 'expands';

const connectionTypes = {
  'leads-to': { icon: ArrowRight, color: '#3b82f6', label: 'Leads to' },
  'related': { icon: ArrowLeftRight, color: '#8b5cf6', label: 'Related to' },
  'contradicts': { icon: Zap, color: '#ef4444', label: 'Contradicts' },
  'supports': { icon: Check, color: '#10b981', label: 'Supports' },
  'expands': { icon: Plus, color: '#f59e0b', label: 'Expands on' },
};

export function ContextualEdge({ id, source, target, data, ...props }: EdgeProps) {
  const [sharesContext, setSharesContext] = useState(data?.sharesContext ?? true);
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    data?.connectionType || 'leads-to'
  );

  const typeConfig = connectionTypes[connectionType];
  const TypeIcon = typeConfig.icon;

  return (
    <>
      <BaseEdge
        {...props}
        style={{
          stroke: sharesContext ? typeConfig.color : '#666',
          strokeWidth: 2,
          opacity: sharesContext ? 1 : 0.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex gap-1"
        >
          <Button
            size="sm"
            variant={sharesContext ? "default" : "outline"}
            className="h-8 w-8 p-0"
            onClick={() => {
              const newValue = !sharesContext;
              setSharesContext(newValue);
              updateEdgeData(id, { sharesContext: newValue });
            }}
          >
            {sharesContext ? <Link className="h-4 w-4" /> : <LinkOff className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 px-2">
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(connectionTypes).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => {
                    setConnectionType(key as ConnectionType);
                    updateEdgeData(id, { connectionType: key });
                  }}
                >
                  <config.icon className="mr-2 h-4 w-4" />
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
```

---

## 3.2 Context Sources Panel

**Component:**

```typescript
// app/components/context/ContextSourcesPanel.tsx
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ContextSourcesPanel({
  nodeId,
  currentSources,
  availableNodes,
  onUpdateSources,
}: {
  nodeId: string;
  currentSources: string[];
  availableNodes: Node[];
  onUpdateSources: (sources: string[]) => void;
}) {
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

  const estimatedTokens = Array.from(selectedSources).reduce((acc, sourceId) => {
    const node = availableNodes.find(n => n.id === sourceId);
    return acc + (node?.data.content?.length || 0) / 4;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Context Sources</CardTitle>
          <Badge variant="secondary">~{Math.round(estimatedTokens)} tokens</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {availableNodes
              .filter(n => n.id !== nodeId)
              .map(node => (
                <label
                  key={node.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSources.has(node.id)}
                    onCheckedChange={() => toggleSource(node.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{node.data.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {node.data.content || 'No content'}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round((node.data.content?.length || 0) / 4)}
                  </Badge>
                </label>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

**Install:**
```bash
npx shadcn@latest add checkbox scroll-area
```

---

## 3.3 Conversation Branching

**Implementation:**

```typescript
// app/components/nodes/BranchButton.tsx
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

export function BranchButton({
  nodeId,
  conversationThread,
  label
}: {
  nodeId: string;
  conversationThread: any[];
  label: string;
}) {
  const { getNode, addNodes, addEdges } = useReactFlow();

  const createBranch = () => {
    const parentNode = getNode(nodeId);
    if (!parentNode) return;

    const newNodeId = `${nodeId}-branch-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'chat',
      position: {
        x: parentNode.position.x + 600,
        y: parentNode.position.y,
      },
      data: {
        label: `${label} (Branch)`,
        conversationThread: [...conversationThread],
      },
    };

    addNodes(newNode);
    addEdges({
      id: `${nodeId}-${newNodeId}`,
      source: nodeId,
      target: newNodeId,
      type: 'contextual',
      data: {
        sharesContext: true,
        connectionType: 'expands',
        isBranch: true,
      },
      animated: true,
      style: { strokeDasharray: '5,5', stroke: '#a855f6' },
    });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={createBranch}
      className="gap-1"
    >
      <GitBranch className="h-3 w-3" />
      Branch
    </Button>
  );
}
```

---

## Deliverables - Phase 3

✅ Drag-to-connect between nodes
✅ Connection type selector (leads-to, contradicts, etc.)
✅ Context sharing toggle per edge
✅ Context sources panel with token estimation
✅ Branch conversation button
✅ Visual branch indicators

**Success Criteria:**
- Users can manually draw connections
- Context flow is clearly indicated
- Connection types are visually distinct
- Branching preserves conversation history

---

# PHASE 4: Infinite Canvas & Navigation
**Priority:** 🟡 Important
**Estimated Time:** 1 week
**Goal:** Truly infinite canvas with excellent navigation

## 4.1 Infinite Canvas Setup

**Implementation in RabbitFlow.tsx:**

```typescript
import { MiniMap, Controls, Background, BackgroundVariant } from '@xyflow/react';

<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}

  // Infinite canvas settings
  minZoom={0.1}
  maxZoom={2}
  translateExtent={[
    [-Infinity, -Infinity],
    [Infinity, Infinity]
  ]}
  nodeExtent={[
    [-Infinity, -Infinity],
    [Infinity, Infinity]
  ]}

  // Better panning
  panOnDrag={true}
  panOnScroll={false}
  zoomOnScroll={true}
  zoomOnPinch={true}
  zoomOnDoubleClick={false}
  autoPanOnNodeDrag={true}

  fitView
>
  {/* Minimap */}
  <MiniMap
    nodeColor={(node) => {
      const colors = {
        chat: '#3b82f6',
        note: '#10b981',
        query: '#a855f7',
        thought: '#f59e0b',
      };
      return colors[node.type] || '#6b7280';
    }}
    maskColor="rgba(0, 0, 0, 0.6)"
    className="!bg-background !border-border"
    position="bottom-right"
  />

  {/* Controls */}
  <Controls
    position="top-right"
    showZoom={true}
    showFitView={true}
    showInteractive={true}
    className="!bg-background !border-border !shadow-lg"
  />

  {/* Background */}
  <Background
    color="hsl(var(--muted))"
    gap={16}
    variant={BackgroundVariant.Dots}
  />
</ReactFlow>
```

---

## Deliverables - Phase 4

✅ Infinite canvas (no boundaries)
✅ Minimap with color-coded nodes
✅ Zoom controls
✅ Fit view functionality
✅ Dot grid background

---

# PHASE 5: Exploration Tools & Power Features
**Priority:** 🟡 Important
**Estimated Time:** 2 weeks
**Goal:** Advanced features for power users

## 5.1 Canvas Search (Cmd+K)

**Component:**

```typescript
// app/components/search/CanvasSearch.tsx
import { useState, useEffect } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useReactFlow } from '@xyflow/react';

export function CanvasSearch({ nodes }: { nodes: Node[] }) {
  const [open, setOpen] = useState(false);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const goToNode = (nodeId: string) => {
    fitView({ nodes: [{ id: nodeId }], duration: 400, padding: 0.3 });
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search nodes..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Nodes">
          {nodes.map((node) => (
            <CommandItem
              key={node.id}
              onSelect={() => goToNode(node.id)}
            >
              <span className="font-medium">{node.data.label}</span>
              <span className="ml-2 text-sm text-muted-foreground truncate">
                {node.data.content?.slice(0, 60)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

**Install:**
```bash
npx shadcn@latest add command
```

---

## 5.2 Node Templates

**Component:**

```typescript
// app/components/templates/NodeTemplates.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

const templates = [
  {
    id: 'research-question',
    name: 'Research Question',
    description: 'Structured research question template',
    nodeType: 'query',
    content: '## Research Question\n\n**Main Question:** \n\n**Sub-questions:**\n1. \n2. \n3. ',
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured meeting notes',
    nodeType: 'note',
    content: '## Meeting Notes\n\n**Date:** \n**Attendees:** \n\n### Agenda\n- \n\n### Discussion\n\n### Action Items\n- [ ] ',
  },
  // ... more templates
];

export function NodeTemplates({ onCreateFromTemplate }: {
  onCreateFromTemplate: (template: any) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Use Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Node Templates</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="p-4 cursor-pointer hover:bg-accent"
              onClick={() => onCreateFromTemplate(template)}
            >
              <h4 className="font-semibold">{template.name}</h4>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 5.3 Export/Import

**Implementation:**

```typescript
// app/components/export/ExportDialog.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Upload } from 'lucide-react';

export function ExportDialog({ canvasId, canvasName }: {
  canvasId: string;
  canvasName: string;
}) {
  const handleExportJSON = async () => {
    const json = await exportCanvasAsJSON(canvasId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvasName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = async () => {
    const markdown = await exportCanvasAsMarkdown(canvasId);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${canvasName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Export</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Canvas</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button className="w-full" onClick={handleExportJSON}>
            <Download className="mr-2 h-4 w-4" />
            Export as JSON
          </Button>
          <Button className="w-full" variant="outline" onClick={handleExportMarkdown}>
            <Download className="mr-2 h-4 w-4" />
            Export as Markdown
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Deliverables - Phase 5

✅ Canvas search with Cmd+K
✅ Node templates library
✅ Export to JSON/Markdown
✅ Import from JSON
✅ Keyboard shortcuts panel

---

# PHASE 6: Polish & Performance
**Priority:** 🟢 Enhancement
**Estimated Time:** 1-2 weeks

## 6.1 Animations & Transitions

**Using GSAP (already installed):**

```typescript
// Animate node creation
const animateNodeCreation = (nodeElement: HTMLElement) => {
  gsap.from(nodeElement, {
    scale: 0,
    opacity: 0,
    duration: 0.3,
    ease: 'back.out(1.7)',
  });
};

// Animate edge creation
const animateEdgeCreation = (edgePath: SVGPathElement) => {
  const length = edgePath.getTotalLength();
  gsap.from(edgePath, {
    strokeDasharray: length,
    strokeDashoffset: length,
    duration: 0.5,
    ease: 'power2.out',
  });
};
```

---

## 6.2 Performance Optimizations

**Virtual Rendering:**

```typescript
import { memo } from 'react';

// Memoize expensive node components
export const ChatNode = memo(ChatNodeComponent, (prev, next) => {
  return prev.data === next.data;
});

// Only render visible nodes
const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set());

useOnViewportChange({
  onChange: (viewport) => {
    const visible = nodes
      .filter(node => isNodeInViewport(node, viewport))
      .map(n => n.id);
    setVisibleNodeIds(new Set(visible));
  },
});
```

---

## Deliverables - Phase 6

✅ Smooth animations for node/edge creation
✅ Virtual rendering for large graphs
✅ Optimized re-renders
✅ Lazy loading for images
✅ IndexedDB query optimization

---

# Implementation Timeline

## Week 1-2: Phase 1 Foundation
- Empty canvas & click-to-create
- Node type system (Chat, Note, Query)
- Exploration mode selector

## Week 3-4: Phase 2 AI Suggestions
- Suggestion panel
- Contextual actions
- Smart connections

## Week 5-6: Phase 3 Context Control
- Manual connections
- Connection types
- Context sources panel
- Branching

## Week 7: Phase 4 Infinite Canvas
- Canvas configuration
- Minimap & controls
- Navigation

## Week 8-9: Phase 5 Power Features
- Canvas search
- Templates
- Export/Import

## Week 10-11: Phase 6 Polish
- Animations
- Performance
- Bug fixes

**Total Timeline:** 10-11 weeks

---

# Success Metrics

## User Agency Indicators
- 80%+ of nodes created manually (not from AI suggestions)
- Average 3+ modifications per AI suggestion before acceptance
- Users spend 70%+ time in Manual or Guided mode
- High template reuse rate

## Performance Benchmarks
- Canvas loads <100ms for 50 nodes
- Handles 200+ nodes smoothly (60fps)
- Search results <50ms
- Auto-save doesn't block UI

## Engagement Metrics
- Average 15+ nodes per canvas
- 5+ connections between nodes
- 60%+ canvas revisit rate
- Template creation by users

---

# Technical Stack Summary

**UI Framework:**
- shadcn/ui for all UI components
- React Flow UI for node/edge components
- Radix UI primitives (via shadcn)

**Visualization:**
- @xyflow/react for graph rendering
- Dagre for auto-layout (optional)
- GSAP for animations

**Data:**
- IndexedDB (idb library) for persistence
- React hooks for state management

**AI:**
- OpenRouter (Gemini) for AI responses
- Tavily for web search

**Styling:**
- Tailwind CSS 4
- CSS variables for theming

---

# Next Steps

1. **Install all shadcn components:**
```bash
npx shadcn@latest add button card dialog dropdown-menu input textarea select tooltip badge checkbox scroll-area command context-menu
```

2. **Install React Flow UI components:**
```bash
npx shadcn@latest add https://ui.reactflow.dev/base-node
npx shadcn@latest add https://ui.reactflow.dev/labeled-handle
npx shadcn@latest add https://ui.reactflow.dev/data-edge
```

3. **Start with Phase 1.1:** Empty Canvas Welcome component

Would you like me to begin implementation?
