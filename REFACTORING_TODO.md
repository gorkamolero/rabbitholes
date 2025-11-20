# Component Refactoring TODO

## Goal
All components should be under 200 lines per CLAUDE.md standards.

## Current Status

### Components Over 200 Lines
1. **SearchView.tsx** - 571 lines → Target: <200 lines
2. **CanvasManager.tsx** - 399 lines → Target: <200 lines
3. **RabbitFlow.tsx** - 282 lines → Target: <200 lines
4. **NodeCreationModal.tsx** - 208 lines → Target: <200 lines

## Progress

### SearchView.tsx Refactoring (In Progress)

**Already Extracted:**
- ✅ `useExplorationMode` hook (~29 lines)
- ✅ `useNodeCreation` hook (~59 lines)
- ✅ `useKeyboardShortcuts` hook (~37 lines)
- ✅ `useCanvasManagement` hook (~56 lines)
- ✅ `SearchHandlers.ts` helper functions (~97 lines)
- ✅ `Toolbar.tsx` component (~38 lines)
- ✅ `SaveStatusIndicator.tsx` component (~29 lines)

**Total Extracted:** ~345 lines

**Still To Do:**
- Integrate extracted pieces back into SearchView
- Extract node click handler logic
- Extract search/query handler
- Extract modal management
- Test thoroughly

### Planned Refactorings

#### CanvasManager.tsx (399 lines)
- Extract canvas list rendering to `CanvasList.tsx`
- Extract canvas item to `CanvasListItem.tsx`
- Extract export/import dialogs to separate components
- Move canvas operations to `useCanvasOperations` hook

#### RabbitFlow.tsx (282 lines)
- Extract layout logic to `useGraphLayout` hook
- Extract event handlers to `useFlowHandlers` hook
- Split into `RabbitFlowInner` and wrapper
- Consider extracting controls/minimap to config

#### NodeCreationModal.tsx (208 lines)
- Extract suggestions list to `SuggestionsList.tsx`
- Extract modal form logic to `useModalForm` hook
- Keep modal wrapper slim

## Files Created (Ready for Integration)

```
app/hooks/
  ├── useCanvasManagement.ts ✅
  ├── useExplorationMode.ts ✅
  ├── useNodeCreation.ts ✅
  └── useKeyboardShortcuts.ts ✅

app/components/SearchView/
  ├── SearchHandlers.ts ✅
  ├── Toolbar.tsx ✅
  └── SaveStatusIndicator.tsx ✅
```

## Integration Strategy

1. **Phase 1:** Integrate SearchView extracted pieces
   - Import new hooks and components
   - Remove duplicate code from SearchView
   - Test build and functionality

2. **Phase 2:** Refactor CanvasManager
   - Extract components
   - Create hooks
   - Test canvas operations

3. **Phase 3:** Refactor RabbitFlow
   - Extract hooks
   - Simplify component
   - Test graph interactions

4. **Phase 4:** Refactor NodeCreationModal
   - Extract sub-components
   - Create form hook
   - Test modal workflow

## Testing Checklist

After each refactoring:
- [ ] `npm run build` passes
- [ ] No TypeScript errors
- [ ] Manual testing of affected features
- [ ] All user flows still work
- [ ] No regressions introduced

## Size Verification

Run before committing:
```bash
find app/components -name "*.tsx" -type f -exec wc -l {} + | awk '$1 > 200 {print $2 " has " $1 " lines (max 200)"}'
```
