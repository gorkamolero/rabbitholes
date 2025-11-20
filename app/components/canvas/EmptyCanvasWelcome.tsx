'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { MessageSquare, StickyNote, Search, Mic } from 'lucide-react';
import { NodeType } from '@/app/lib/nodeTypes';

interface EmptyCanvasWelcomeProps {
  onAction: (type: NodeType) => void;
}

export function EmptyCanvasWelcome({ onAction }: EmptyCanvasWelcomeProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <Card className="w-[450px] pointer-events-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Start Your Exploration</CardTitle>
          <CardDescription className="text-base">
            Choose how you want to begin your research journey
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => onAction(NodeType.NOTE)}
            className="h-24 flex-col gap-3 hover:border-green-500 transition-colors"
          >
            <StickyNote className="h-8 w-8" />
            <span className="text-base">Create Note</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onAction(NodeType.CHAT)}
            className="h-24 flex-col gap-3 hover:border-blue-500 transition-colors"
          >
            <MessageSquare className="h-8 w-8" />
            <span className="text-base">Ask Question</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onAction(NodeType.QUERY)}
            className="h-24 flex-col gap-3 hover:border-purple-500 transition-colors"
          >
            <Search className="h-8 w-8" />
            <span className="text-base">Search Web</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onAction(NodeType.THOUGHT)}
            className="h-24 flex-col gap-3 hover:border-yellow-500 transition-colors"
          >
            <Mic className="h-8 w-8" />
            <span className="text-base">Quick Thought</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
