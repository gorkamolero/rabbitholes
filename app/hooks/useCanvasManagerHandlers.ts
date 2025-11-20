import { useState } from 'react';
import { useCanvasList, useCanvasExport } from './useCanvasSync';
import { toast } from 'sonner';

export function useCanvasManagerHandlers(
  onLoadCanvas: (canvasId: string) => void,
  onSaveAs: (name: string) => Promise<void>
) {
  const { canvases, loading, remove, duplicate, rename } = useCanvasList();
  const { exportToJson, exportDatabaseToJson, importFromJson, importDatabaseFromJson, exporting, importing } = useCanvasExport();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSaveAs = async () => {
    if (!saveName.trim()) return;
    try {
      await onSaveAs(saveName);
      setSaveName('');
      setShowSaveDialog(false);
      toast.success('Canvas saved successfully!');
    } catch (error) {
      toast.error('Failed to save canvas');
      console.error(error);
    }
  };

  const handleRename = async (id: string, name: string) => {
    if (!name.trim()) return;
    try {
      await rename(id, name);
      toast.success('Canvas renamed');
    } catch (error) {
      toast.error('Failed to rename canvas');
      console.error(error);
      throw error;
    }
  };

  const handleExportCanvas = async (id: string) => {
    try {
      await exportToJson(id);
      toast.success('Canvas exported!');
    } catch (error) {
      toast.error('Failed to export canvas');
      console.error(error);
    }
  };

  const handleImportCanvas = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const canvas = await importFromJson(file);
      onLoadCanvas(canvas.id);
      toast.success('Canvas imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import canvas');
    }
    event.target.value = '';
  };

  const handleExportDatabase = async () => {
    try {
      await exportDatabaseToJson();
      toast.success('All data exported!');
    } catch (error) {
      toast.error('Failed to export database');
      console.error(error);
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('This will replace all your current data. Continue?')) {
      event.target.value = '';
      return;
    }

    try {
      await importDatabaseFromJson(file, false);
      toast.success('Database imported successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import database');
    }
    event.target.value = '';
  };

  const handleDelete = (id: string) => {
    remove(id);
    toast.success('Canvas deleted');
  };

  return {
    canvases,
    loading,
    exporting,
    importing,
    showSaveDialog,
    setShowSaveDialog,
    saveName,
    setSaveName,
    handleSaveAs,
    handleRename,
    duplicate,
    handleExportCanvas,
    handleImportCanvas,
    handleExportDatabase,
    handleImportDatabase,
    handleDelete
  };
}
