import { Button } from '../ui/button';
import { Sparkles, Pencil } from 'lucide-react';

interface ModeSelectorProps {
  onSelectSuggest: () => void;
  onSelectCustom: () => void;
}

export function ModeSelector({ onSelectSuggest, onSelectCustom }: ModeSelectorProps) {
  return (
    <div className="grid gap-4">
      <Button
        onClick={onSelectSuggest}
        variant="outline"
        className="h-auto p-6 justify-start hover:bg-primary/5 hover:border-primary transition-all group"
      >
        <div className="flex items-start w-full gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-semibold mb-1">Get AI Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Let AI suggest thoughtful follow-up questions based on the context
            </p>
          </div>
        </div>
      </Button>

      <Button
        onClick={onSelectCustom}
        variant="outline"
        className="h-auto p-6 justify-start hover:bg-primary/5 hover:border-primary transition-all group"
      >
        <div className="flex items-start w-full gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-lg flex items-center justify-center transition-colors">
            <Pencil className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-semibold mb-1">Write Your Own</h3>
            <p className="text-sm text-muted-foreground">
              Create a custom question to explore a specific direction
            </p>
          </div>
        </div>
      </Button>
    </div>
  );
}
