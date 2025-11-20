'use client';

import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/app/components/ui/dialog';
import { Card } from '@/app/components/ui/card';

interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  nodeType: string;
  content: string;
}

const templates: NodeTemplate[] = [
  {
    id: 'research-question',
    name: 'Research Question',
    description: 'Structured research question template',
    nodeType: 'query',
    content: '## Research Question\n\n**Main Question:** \n\n**Sub-questions:**\n1. \n2. \n3. ',
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured meeting notes',
    nodeType: 'note',
    content: '## Meeting Notes\n\n**Date:** \n**Attendees:** \n\n### Agenda\n- \n\n### Discussion\n\n### Action Items\n- [ ] ',
  },
  {
    id: 'pros-cons',
    name: 'Pros & Cons',
    description: 'Decision-making template',
    nodeType: 'note',
    content: '## Pros & Cons\n\n### Pros\n- \n\n### Cons\n- \n\n### Decision\n',
  },
  {
    id: 'learning-note',
    name: 'Learning Note',
    description: 'Capture what you learned',
    nodeType: 'note',
    content: '## Learning Note\n\n**Topic:** \n\n### Key Concepts\n- \n\n### Questions\n- \n\n### Resources\n- ',
  },
  {
    id: 'hypothesis',
    name: 'Hypothesis',
    description: 'Scientific hypothesis template',
    nodeType: 'note',
    content: '## Hypothesis\n\n**If:** \n\n**Then:** \n\n**Because:** \n\n### Evidence Needed\n- ',
  },
  {
    id: 'book-summary',
    name: 'Book Summary',
    description: 'Summarize a book or article',
    nodeType: 'note',
    content: '## Book Summary\n\n**Title:** \n**Author:** \n\n### Key Ideas\n- \n\n### Quotes\n- \n\n### My Thoughts\n',
  },
];

interface NodeTemplatesProps {
  onCreateFromTemplate: (template: NodeTemplate) => void;
}

export function NodeTemplates({ onCreateFromTemplate }: NodeTemplatesProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Use Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Node Templates</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onCreateFromTemplate(template)}
            >
              <h4 className="font-semibold">{template.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {template.description}
              </p>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
