'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/app/components/ui/select";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";

export type ExplorationMode = 'manual' | 'guided' | 'hybrid' | 'classic';

const modes: Record<ExplorationMode, { label: string; description: string }> = {
  manual: {
    label: 'Manual',
    description: 'Full control - AI assists only when asked',
  },
  guided: {
    label: 'Guided',
    description: 'AI suggests, you decide',
  },
  hybrid: {
    label: 'Hybrid',
    description: 'Mix of manual and AI-assisted',
  },
  classic: {
    label: 'Classic',
    description: 'Automatic exploration (original)',
  },
};

interface ExplorationModeSelectorProps {
  value: ExplorationMode;
  onChange: (mode: ExplorationMode) => void;
}

export function ExplorationModeSelector({
  value,
  onChange
}: ExplorationModeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => onChange(v as ExplorationMode)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(modes).map(([key, mode]) => (
            <SelectItem key={key} value={key}>
              {mode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{modes[value].description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
