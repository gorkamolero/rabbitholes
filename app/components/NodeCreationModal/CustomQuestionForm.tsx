import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ArrowLeft } from 'lucide-react';

interface CustomQuestionFormProps {
  question: string;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function CustomQuestionForm({ question, onQuestionChange, onSubmit, onBack }: CustomQuestionFormProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="space-y-3">
        <Label htmlFor="custom-question">Your Question</Label>
        <Textarea
          id="custom-question"
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          placeholder="What would you like to explore next?"
          className="min-h-[120px] resize-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              onSubmit();
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to submit
        </p>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!question.trim()}
        className="w-full"
        size="lg"
      >
        Create Node
      </Button>
    </div>
  );
}
