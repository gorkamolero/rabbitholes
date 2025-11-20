import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface SuggestionsListProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (suggestion: string) => void;
  onBack: () => void;
}

export function SuggestionsList({ suggestions, isLoading, onSelect, onBack }: SuggestionsListProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {isLoading ? (
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center py-8">
            <Sparkles className="w-12 h-12 text-primary animate-pulse mb-4" />
            <p className="text-sm text-muted-foreground">Generating suggestions...</p>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 p-4 border rounded-lg">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-3">
          <Label>Select a question to explore:</Label>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              onClick={() => onSelect(suggestion)}
              variant="outline"
              className="w-full h-auto p-4 justify-start text-left hover:bg-primary/5 hover:border-primary transition-all"
            >
              <div className="flex items-start w-full gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <p className="flex-1 text-sm">{suggestion}</p>
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No suggestions available</p>
        </div>
      )}
    </div>
  );
}
