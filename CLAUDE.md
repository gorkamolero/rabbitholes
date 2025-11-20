# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RabbitHoles is an AI-powered knowledge exploration tool that creates interactive mind maps. Users ask questions, and the system generates insightful responses with follow-up questions that branch into an expandable graph visualization. Built with Next.js 16, React 19, and powered by OpenRouter (Gemini) + Tavily search.

## Development Commands

```bash
# Development (runs on port 3001)
npm run dev

# Production build
npm run build

# Start production server (port 3001)
npm start

# Lint
npm run lint
```

## Required Environment Variables

Create a `.env` file with:

```bash
OPENROUTER_API_KEY=your_openrouter_key      # Required: AI responses via OpenRouter
TAVILY_API_KEY=your_tavily_key              # Required: Web search
NEXT_PUBLIC_POSTHOG_KEY=your_key            # Optional: Analytics
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
PORT=3001                                    # Server port
```

## Architecture Overview

### Core Data Flow: Query → Response → Graph

1. **User searches** → `SearchView.handleSearch()` creates loading node
2. **API endpoint** `/api/rabbitholes/search` orchestrates:
   - Tavily web search (3 results + images)
   - OpenRouter/Gemini generates response + 3 follow-up questions
   - Returns: `{ response, followUpQuestions, sources, images }`
3. **SearchView** converts response to ReactFlow graph:
   - 1 MainNode (expanded with content)
   - 3 question nodes (clickable to expand)
4. **Clicking question node** repeats flow with conversation history

### Key Components

**SearchView** (`app/components/SearchView.tsx`)
- Main orchestrator: manages nodes, edges, conversation history
- Handles search triggering and node expansion
- Uses Dagre layout algorithm to position nodes
- Contains mystical deck UI (Thoth/Anubis/Isis) for gamified entry

**API Route** (`app/api/rabbitholes/search/route.ts`)
- POST endpoint receiving: `{ query, previousConversation, followUpMode }`
- Calls Tavily search → OpenRouter LLM → extracts follow-up questions
- Returns structured SearchResponse

**AIService** (`app/services/aiService.ts`)
- Singleton pattern for OpenRouter API access
- Default model: `google/gemini-2.0-flash-001`
- Supports both streaming and non-streaming completions

**RabbitFlow** (`app/components/RabbitFlow.tsx`)
- ReactFlow wrapper with Dagre layout
- Left-to-right graph direction (main query left, follow-ups spread right)
- Adaptive spacing based on expanded nodes

**MainNode** (`app/components/nodes/MainNode.tsx`)
- Custom ReactFlow node type (600x500px)
- Displays: markdown content, bouncing image cards, source links
- Uses Google favicon service for source icons

**BounceCards** (`app/components/ui/bounce-cards.tsx`)
- GSAP-animated image carousel
- Staggered entrance with elastic bounce
- Hover scale effects

### Conversation History Pattern

**Critical:** When a follow-up question is clicked, the current MainNode is added to `conversationHistory`:

```typescript
const newHistoryEntry = {
  user: currentMainNode.data.label,      // The question
  assistant: currentMainNode.data.content // The AI response
};
setConversationHistory(prev => [...prev, newHistoryEntry]);
```

This history is passed to every subsequent API call, allowing the LLM to maintain context across explorations.

### Graph Layout (Dagre)

- **Direction:** Left-to-right (`rankdir: 'LR'`)
- **Node sizes:** MainNode 600x500, question nodes 300x100
- **Spacing:** Dynamic based on expanded nodes (100-200px)
- **Recalculation:** Entire graph re-layouted on each expansion

### Follow-up Question Extraction

API response must contain:
```
[Main content here]

Follow-up Questions:
1. First question?
2. Second question?
3. Third question?
```

Code parses by splitting on "Follow-up Questions:", extracting 3 lines with `?`.

### Abort Controller Pattern

Each node expansion creates an `AbortController` tracked by `activeRequestRef`. This prevents race conditions when users click multiple nodes rapidly. Always check if the controller is still active before updating UI.

## Image Handling

### Next.js Image Configuration

In development, image optimization is **disabled** (`unoptimized: true`) to prevent long filename cache errors. Production uses full optimization.

Remote patterns allow:
- Google favicons (`www.google.com/s2/favicons/**`)
- All HTTPS domains for search images

### Image Sources

1. **Tavily search images** → passed to MainNode → BounceCards (max 5)
2. **Source favicons** → Google favicon service with domain extraction
3. **Error handling** → Images removed from display on load failure

## AI Model Configuration

Default model in `aiService.ts`:
```typescript
private defaultModel: string = 'google/gemini-2.0-flash-001';
```

Can override per-request by passing model parameter. OpenRouter supports 50+ models (Claude, GPT, Llama, etc.).

### System Prompt Structure

API constructs prompt with:
- System role: Instructions for markdown format + follow-up generation
- User role: Previous conversation + Tavily search results + followUpMode

Follow-up mode:
- `"expansive"`: Broad, diverse questions
- `"focused"`: Specific, deep-dive questions

## Common Development Patterns

### Adding New Node Types

1. Create component in `app/components/nodes/`
2. Register in `nodeTypes` object
3. Pass to RabbitFlow via props
4. Use React Flow's `Handle` components for connections

### Modifying Search Behavior

Edit `/api/rabbitholes/search/route.ts`:
- **Tavily config:** `searchDepth`, `maxResults`, `includeImages`
- **AI prompt:** Modify system message for different response styles
- **Follow-up extraction:** Change regex/parsing logic

### Hydration Errors with Random Content

Use `suppressHydrationWarning` on elements with `Math.random()` or `Date.now()`:
```tsx
<div suppressHydrationWarning>{randomQuestion}</div>
```

This is the React/Next.js pattern for intentional server/client mismatches.

## Port Configuration

Development and production run on **port 3001** (configured in `package.json` scripts and `.env`). This avoids conflicts with other local services.

## Analytics

PostHog captures:
- Node click events (nodeId, type, label, position)
- Configured via PHProvider in `app/providers.tsx`
- Requires `NEXT_PUBLIC_POSTHOG_KEY` environment variable

## Tech Stack Specifics

- **Next.js 16** with App Router and Turbopack
- **React 19** with latest concurrent features
- **TypeScript** for type safety
- **Tailwind CSS** with typography plugin for markdown
- **ReactFlow 11** for graph visualization
- **Dagre** for automatic hierarchical layout
- **GSAP** for high-performance animations
- **Vercel AI SDK 6** (not actively used, but available)

## Important Notes

- **Git config:** Default repo is `gorkamolero/rabbitholes` (not the upstream fork)
- **No tests:** Project currently has no test suite
- **Markdown rendering:** Uses `react-markdown` with automatic HTML sanitization
- **API rate limits:** Free tier Gemini models are rate-limited; use paid version
- **Font loading:** Inter (body) + Cinzel (headers) from Google Fonts
