'use client';

import { CanvasManager } from '../CanvasManager';
import { ExplorationModeSelector } from '../canvas/ExplorationModeSelector';
import type { ExplorationMode } from '../../hooks/useExplorationMode';

interface ToolbarProps {
  currentCanvasId: string | null;
  onLoadCanvas: (canvasId: string) => void;
  onNewCanvas: () => void;
  onSaveAs: (name: string) => Promise<void>;
  explorationMode: ExplorationMode;
  onExplorationModeChange: (mode: ExplorationMode) => void;
}

export function Toolbar({
  currentCanvasId,
  onLoadCanvas,
  onNewCanvas,
  onSaveAs,
  explorationMode,
  onExplorationModeChange,
}: ToolbarProps) {
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
      <CanvasManager
        currentCanvasId={currentCanvasId}
        onLoadCanvas={onLoadCanvas}
        onNewCanvas={onNewCanvas}
        onSaveAs={onSaveAs}
      />
      <ExplorationModeSelector
        value={explorationMode}
        onChange={onExplorationModeChange}
      />
    </div>
  );
}
