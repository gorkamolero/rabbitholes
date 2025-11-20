'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Menu, Plus, Save, Upload, Database } from 'lucide-react';
import { useCanvasManagerHandlers } from '../hooks/useCanvasManagerHandlers';
import { CanvasList } from './CanvasManager/CanvasList';
import { SaveAsDialog } from './CanvasManager/SaveAsDialog';

interface CanvasManagerProps {
  currentCanvasId: string | null;
  onLoadCanvas: (canvasId: string) => void;
  onNewCanvas: () => void;
  onSaveAs: (name: string) => Promise<void>;
}

export function CanvasManager({
  currentCanvasId,
  onLoadCanvas,
  onNewCanvas,
  onSaveAs
}: CanvasManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    exporting,
    importing,
    showSaveDialog,
    setShowSaveDialog,
    saveName,
    setSaveName,
    handleSaveAs,
    handleImportCanvas,
    handleExportDatabase,
    handleImportDatabase
  } = useCanvasManagerHandlers(onLoadCanvas, onSaveAs);

  return (
    <>
      {/* Toggle Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="fixed top-6 left-6 z-50 shadow-lg hover:shadow-xl transition-shadow"
            suppressHydrationWarning
          >
            <Menu className="w-4 h-4 mr-2" />
            Canvases
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[400px] sm:w-[540px] flex flex-col p-0" suppressHydrationWarning>
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="text-2xl">My Canvases</SheetTitle>
            <SheetDescription>
              Manage your saved exploration canvases
            </SheetDescription>
          </SheetHeader>

          <Separator />

          {/* Action Buttons */}
          <div className="px-6 py-4 space-y-2 border-b">
            <Button onClick={onNewCanvas} className="w-full" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Canvas
            </Button>

            <Button
              onClick={() => setShowSaveDialog(true)}
              disabled={!currentCanvasId}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save As...
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Label htmlFor="import-canvas-input" className="cursor-pointer">
                <Button variant="outline" className="w-full pointer-events-none" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  id="import-canvas-input"
                  type="file"
                  accept="application/json"
                  onChange={handleImportCanvas}
                  className="hidden"
                  disabled={importing}
                />
              </Label>

              <Button
                onClick={handleExportDatabase}
                disabled={exporting}
                variant="outline"
                size="sm"
              >
                <Database className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Canvas List */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-3">
              <CanvasList
                currentCanvasId={currentCanvasId}
                onLoadCanvas={onLoadCanvas}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <SaveAsDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        saveName={saveName}
        onSaveNameChange={setSaveName}
        onSave={handleSaveAs}
      />
    </>
  );
}
