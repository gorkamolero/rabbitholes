'use client';

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { NodeType, nodeTypeMetadata } from '@/app/lib/nodeTypes';

interface NodeTypeButtonProps {
  type: NodeType;
  onClick: () => void;
}

export function NodeTypeButton({ type, onClick }: NodeTypeButtonProps) {
  const metadata = nodeTypeMetadata[type];

  return (
    <Button
      onClick={onClick}
      className={`${metadata.color} ${metadata.hoverColor} text-white justify-start gap-3 h-12 transition-all hover:scale-105`}
      title={metadata.description}
    >
      <span className="text-xl">{metadata.icon}</span>
      <span>{metadata.label}</span>
    </Button>
  );
}
