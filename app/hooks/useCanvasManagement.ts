import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useCurrentCanvas, useAutoSave } from './useCanvasSync';
import { createCanvas, loadCanvasState } from '../lib/db/repository';
import type { ConversationMessage } from '../components/SearchView/types';

export function useCanvasManagement(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  setConversationHistory: (history: ConversationMessage[]) => void
) {
  const { currentCanvasId, setCurrentCanvasId } = useCurrentCanvas();
  const { saving, lastSaved } = useAutoSave(currentCanvasId, nodes, edges, {
    enabled: currentCanvasId !== null,
    debounceMs: 2000
  });

  const handleNewCanvas = useCallback(async () => {
    setNodes([]);
    setEdges([]);
    setConversationHistory([]);
    setCurrentCanvasId(null);
  }, [setNodes, setEdges, setConversationHistory, setCurrentCanvasId]);

  const handleLoadCanvas = useCallback(async (canvasId: string) => {
    try {
      const canvasData = await loadCanvasState(canvasId);
      if (canvasData) {
        setNodes(canvasData.nodes || []);
        setEdges(canvasData.edges || []);
        setConversationHistory([]);
        setCurrentCanvasId(canvasId);
      }
    } catch (error) {
      console.error('Failed to load canvas:', error);
    }
  }, [setNodes, setEdges, setConversationHistory, setCurrentCanvasId]);

  const handleSaveAs = useCallback(async (name: string) => {
    try {
      const canvas = await createCanvas(name);
      setCurrentCanvasId(canvas.id);
    } catch (error) {
      console.error('Failed to save canvas:', error);
      throw error;
    }
  }, [setCurrentCanvasId]);

  return {
    currentCanvasId,
    saving,
    lastSaved,
    handleNewCanvas,
    handleLoadCanvas,
    handleSaveAs,
  };
}
