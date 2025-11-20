export enum NodeType {
  CHAT = 'chat',
  NOTE = 'note',
  QUERY = 'query',
  THOUGHT = 'thought',
  REFERENCE = 'reference',
  INSIGHT = 'insight',
}

export const nodeTypeMetadata = {
  [NodeType.CHAT]: {
    label: 'Chat',
    icon: '💬',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    description: 'Interactive conversation with AI',
  },
  [NodeType.NOTE]: {
    label: 'Note',
    icon: '📝',
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
    description: 'Markdown notes and documentation',
  },
  [NodeType.QUERY]: {
    label: 'Query',
    icon: '❓',
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    description: 'Research question with web search',
  },
  [NodeType.THOUGHT]: {
    label: 'Thought',
    icon: '💭',
    color: 'bg-yellow-600',
    hoverColor: 'hover:bg-yellow-700',
    description: 'Quick idea or brainstorm',
  },
  [NodeType.REFERENCE]: {
    label: 'Reference',
    icon: '🔗',
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    description: 'External reference or link',
  },
  [NodeType.INSIGHT]: {
    label: 'Insight',
    icon: '💡',
    color: 'bg-pink-600',
    hoverColor: 'hover:bg-pink-700',
    description: 'Key finding or realization',
  },
} as const;

export type NodeTypeMetadata = typeof nodeTypeMetadata;
