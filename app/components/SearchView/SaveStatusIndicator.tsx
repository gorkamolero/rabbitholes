'use client';

import { Loader2, Check } from 'lucide-react';

interface SaveStatusIndicatorProps {
  currentCanvasId: string | null;
  saving: boolean;
  lastSaved: Date | number | null;
}

export function SaveStatusIndicator({
  currentCanvasId,
  saving,
  lastSaved,
}: SaveStatusIndicatorProps) {
  if (!currentCanvasId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm text-white/60 flex items-center gap-2">
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
        </>
      ) : null}
    </div>
  );
}
