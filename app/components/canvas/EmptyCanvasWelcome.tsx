'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { MessageSquare, StickyNote, Search, Lightbulb } from 'lucide-react';
import { NodeType } from '@/app/lib/nodeTypes';

interface EmptyCanvasWelcomeProps {
  onAction: (type: NodeType) => void;
}

export function EmptyCanvasWelcome({ onAction }: EmptyCanvasWelcomeProps) {
  const actions = [
    {
      type: NodeType.NOTE,
      icon: StickyNote,
      label: 'Create Note',
      color: 'hover:border-green-500 hover:bg-green-500/5',
      iconColor: 'text-green-600',
    },
    {
      type: NodeType.CHAT,
      icon: MessageSquare,
      label: 'Start Chat',
      color: 'hover:border-blue-500 hover:bg-blue-500/5',
      iconColor: 'text-blue-600',
    },
    {
      type: NodeType.QUERY,
      icon: Search,
      label: 'Search Web',
      color: 'hover:border-purple-500 hover:bg-purple-500/5',
      iconColor: 'text-purple-600',
    },
    {
      type: NodeType.THOUGHT,
      icon: Lightbulb,
      label: 'Quick Thought',
      color: 'hover:border-yellow-500 hover:bg-yellow-500/5',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="animate-in fade-in-0 zoom-in-95 duration-500">
        <Card className="w-[500px] pointer-events-auto shadow-2xl border-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold mb-2">
              Start Your Exploration
            </CardTitle>
            <CardDescription className="text-base">
              Choose how you want to begin your research journey
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {actions.map(({ type, icon: Icon, label, color, iconColor }) => (
              <Button
                key={type}
                variant="outline"
                onClick={() => onAction(type)}
                className={`h-28 flex-col gap-3 transition-all duration-300 ${color} group`}
              >
                <div className={`p-3 rounded-full bg-muted group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${iconColor}`} />
                </div>
                <span className="text-base font-medium">{label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
