# RabbitHoles AI Feature Specification

## Priority Classification
- 🔴 **Very Important** - Core features essential for MVP
- 🟡 **Important** - Key features for full product experience
- 🟢 **Nice to Have** - Enhancements for better UX

---

## 🔴 Very Important Features

### Gap 3: Manual vs Automated Exploration
**Feature**: User-Controlled Node Creation & Exploration
- Allow users to manually create new nodes at any point
- Enable users to decide which paths to explore (not just automated)
- Provide toggle between manual exploration and AI-suggested paths
- Let users edit node content after creation
- Support user-driven branching decisions

### Gap 11: Manual Node Creation
**Feature**: Create Custom Chat Nodes
- Add button to create empty chat node anywhere on canvas
- Support different node types: chat, note, query, idea
- Allow nodes to start blank for user input
- Enable node creation by clicking on canvas
- Support quick node creation with keyboard shortcut

---

## 🟡 Important Features

### Gap 2: Conversation Management
**Feature**: Multi-threaded Chat System
- Each node represents a complete conversation thread
- Maintain conversation history within each node
- Support continuing conversations from any point
- Display conversation flow visually
- Allow forking conversations into new threads

### Gap 8: Image Generation Integration
**Feature**: AI Image Generation Nodes
- Add dedicated image generation node type
- Support text-to-image prompts
- Display generated images inline in nodes
- Allow image-to-image references between nodes
- Store generation parameters with images

### Gap 9: Infinite Canvas System
**Feature**: Unlimited 2D Workspace
- Remove viewport boundaries for infinite scrolling
- Add minimap for navigation
- Support zoom levels from 10% to 200%
- Implement smooth panning and navigation
- Show current position indicator

### Gap 10: Multiple Canvas Support
**Feature**: Workspace Management
- Create unlimited separate canvases
- Name and organize canvases by project
- Switch between canvases quickly
- Save canvas state automatically
- Support canvas templates for common workflows

### Gap 12: Conversation Branching
**Feature**: Branch From Any Node
- Add "Branch Conversation" button to each node
- Create visual branch points in the flow
- Maintain parent-child relationships
- Show branch indicators on canvas
- Support merging branches back together

### Gap 13: Node Connection System
**Feature**: Manual Context Sharing
- Draw connections between any nodes
- Choose which connections share context
- Visual indicators for active connections
- Control context flow direction
- Support many-to-one connections

### Gap 14: Canvas Search
**Feature**: Find Content Across Canvas
- Global search bar for all nodes
- Search by content, title, or tags
- Highlight matching nodes
- Navigate directly to search results
- Filter search by node type

### Gap 15: PDF Processing
**Feature**: PDF Upload & Display
- Upload PDF files to canvas
- Extract text content for context
- Display PDF preview in nodes
- Link PDFs to conversation nodes
- Support multi-page navigation

### Gap 20: JSON Export
**Feature**: Export Canvas Data
- Export entire canvas as JSON file
- Include all node relationships
- Preserve conversation history
- Export selected nodes only option
- Include metadata and timestamps

### Gap 21: Markdown Export
**Feature**: Export as Formatted Text
- Convert canvas to markdown document
- Maintain conversation structure
- Include citations and sources
- Format for readability
- Support partial exports

### Gap 22: System Prompt Customization
**Feature**: Custom Instructions Per Node
- Add system prompt field to each node
- Save and reuse prompt templates
- Override global prompts locally
- Display active prompt indicator
- Support prompt variables

### Gap 25: Context Cherry-Picking
**Feature**: Selective Context Control
- Choose which connected nodes provide context
- Visual checkboxes for context selection
- Show token count for selected context
- Preview combined context
- Save context configurations

---

## 🟢 Nice to Have Features

### Gap 27: Voice Input
**Feature**: Speech-to-Text Input
- Microphone button for voice input
- Real-time transcription display
- Support multiple languages
- Edit transcribed text before sending
- Voice activation option

### Gap 28: Keyboard Shortcuts
**Feature**: Power User Controls
- Define shortcuts for common actions
- Customizable keybindings
- Show shortcut hints in UI
- Quick command palette (Cmd/Ctrl+K)
- Navigation shortcuts for canvas

---

## Implementation Priority Order

### Phase 1: Core Canvas & Nodes
1. Gap 11 - Manual Node Creation
2. Gap 3 - Manual vs Automated Exploration
3. Gap 9 - Infinite Canvas System
4. Gap 2 - Conversation Management

### Phase 2: Branching & Connections
5. Gap 12 - Conversation Branching
6. Gap 13 - Node Connection System
7. Gap 25 - Context Cherry-Picking

### Phase 3: Multi-Canvas & Search
8. Gap 10 - Multiple Canvas Support
9. Gap 14 - Canvas Search

### Phase 4: Content & Export
10. Gap 15 - PDF Processing
11. Gap 20 - JSON Export
12. Gap 21 - Markdown Export

### Phase 5: Advanced Features
13. Gap 22 - System Prompt Customization
14. Gap 8 - Image Generation Integration

### Phase 6: UX Enhancements
15. Gap 28 - Keyboard Shortcuts
16. Gap 27 - Voice Input

---

## Core User Flows

### Creating a Research Session
1. User creates new canvas or opens existing
2. Creates initial query node manually or via search
3. AI suggests follow-up questions
4. User selects which branches to explore
5. User can add manual notes/ideas at any point

### Managing Conversations
1. Each node maintains its conversation thread
2. User can branch at any decision point
3. Connections between nodes share context
4. User cherry-picks which context to include
5. Export final research as JSON/Markdown

### Exploring Ideas
1. Mix of manual and automated exploration
2. User controls depth and breadth
3. Visual map shows exploration paths
4. Search helps find previous discoveries
5. Multiple canvases organize different projects

---

## Additional Feature: Todo List

### Todo List Integration
**Feature**: Task Management Per Canvas
- Each canvas has an associated todo list
- Create tasks directly from exploration nodes
- Link todos to specific nodes/conversations
- Track research tasks and progress
- Export todos with canvas data
- Checkbox completion tracking
- Priority levels for tasks
- Due dates and reminders (optional)
- Tag todos by category/project
- Filter and sort todo items
