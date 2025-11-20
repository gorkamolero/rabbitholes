import { useEffect } from 'react';
import { NodeType } from '../lib/nodeTypes';

interface UseKeyboardShortcutsProps {
  onCreateNote: () => void;
  onCreateChat: () => void;
  onCreateQuery: () => void;
}

export function useKeyboardShortcuts({
  onCreateNote,
  onCreateChat,
  onCreateQuery,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+N or Ctrl+N to create new note node
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        onCreateNote();
      }
      // Cmd+Shift+N or Ctrl+Shift+N to create new chat node
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        onCreateChat();
      }
      // Cmd+/ or Ctrl+/ to create new query node
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        onCreateQuery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCreateNote, onCreateChat, onCreateQuery]);
}
