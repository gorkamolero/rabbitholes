'use client';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Save } from 'lucide-react';

interface SaveAsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saveName: string;
  onSaveNameChange: (name: string) => void;
  onSave: () => void;
}

export function SaveAsDialog({
  open,
  onOpenChange,
  saveName,
  onSaveNameChange,
  onSave
}: SaveAsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent suppressHydrationWarning>
        <DialogHeader>
          <DialogTitle>Save Canvas As</DialogTitle>
          <DialogDescription>Give your canvas a memorable name</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="canvas-name">Canvas Name</Label>
            <Input
              id="canvas-name"
              value={saveName}
              onChange={(e) => onSaveNameChange(e.target.value)}
              placeholder="My Research Canvas..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSave();
                if (e.key === 'Escape') onOpenChange(false);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
          <Button onClick={onSave} disabled={!saveName.trim()}>
            <Save className="w-4 h-4 mr-2" />Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
