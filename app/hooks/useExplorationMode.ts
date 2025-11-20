import { useState } from 'react';

export type ExplorationMode = 'manual' | 'guided' | 'hybrid' | 'classic';

export function useExplorationMode(defaultMode: ExplorationMode = 'hybrid') {
  const [explorationMode, setExplorationMode] = useState<ExplorationMode>(defaultMode);

  // Map exploration mode to AI follow-up mode
  const getFollowUpMode = () => {
    switch (explorationMode) {
      case 'manual':
        return 'focused'; // More specific, user-directed
      case 'guided':
        return 'focused'; // AI suggests specific paths
      case 'hybrid':
        return 'expansive'; // Mix of breadth and depth
      case 'classic':
        return 'expansive'; // Original auto-exploration
      default:
        return 'expansive';
    }
  };

  return {
    explorationMode,
    setExplorationMode,
    getFollowUpMode,
  };
}
