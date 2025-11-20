/**
 * Mock data for testing RabbitHoles application
 */

export const mockTavilyResponse = {
  results: [
    {
      title: 'Understanding Artificial Intelligence',
      url: 'https://example.com/ai-article',
      content: 'Comprehensive guide to AI and machine learning...',
      author: 'John Doe',
    },
    {
      title: 'The Future of AI',
      url: 'https://example.com/future-ai',
      content: 'Exploring the potential impact of AI on society...',
      author: 'Jane Smith',
    },
    {
      title: 'AI Ethics and Governance',
      url: 'https://example.com/ai-ethics',
      content: 'Important considerations for responsible AI development...',
      author: 'Dr. Robert Johnson',
    },
  ],
  images: [
    {
      url: 'https://example.com/images/ai-network.jpg',
      description: 'Neural network visualization',
    },
    {
      url: 'https://example.com/images/robot.jpg',
      description: 'Humanoid robot',
    },
  ],
}

export const mockGeminiResponse = {
  choices: [
    {
      message: {
        content: `## Artificial Intelligence Overview

Artificial Intelligence (AI) represents a transformative technology that enables machines to simulate human intelligence. Modern AI systems utilize machine learning algorithms to process vast amounts of data and make intelligent decisions.

### Key Areas of AI

**Machine Learning**: Algorithms that improve through experience
**Natural Language Processing**: Understanding and generating human language
**Computer Vision**: Interpreting and analyzing visual information

### Applications

AI is revolutionizing industries from healthcare to transportation, enabling breakthrough innovations in diagnosis, automation, and decision-making.

**Question:** How does machine learning differ from traditional programming?
**Question:** What are the ethical implications of autonomous AI systems?
**Question:** What role will AI play in future scientific discoveries?`,
      },
      finish_reason: 'stop',
    },
  ],
}

export const mockSearchResult = {
  response: mockGeminiResponse.choices[0].message.content,
  followUpQuestions: [
    'How does machine learning differ from traditional programming?',
    'What are the ethical implications of autonomous AI systems?',
    'What role will AI play in future scientific discoveries?',
  ],
  contextualQuery: 'artificial intelligence',
  sources: mockTavilyResponse.results.map((r) => ({
    title: r.title,
    url: r.url,
    uri: r.url,
    author: r.author,
    image: '',
  })),
  images: mockTavilyResponse.images,
}

export const mockOracleQuestions = {
  thoth: [
    'What hidden patterns shape our understanding of reality?',
    'How does knowledge transform across different cultures?',
    'What role does writing play in preserving consciousness?',
  ],
  anubis: [
    'What transformations must we undergo to reach wisdom?',
    'How do we navigate the boundaries between known and unknown?',
    'What guides us through life\'s most difficult transitions?',
  ],
  isis: [
    'How does intuition connect us to deeper truths?',
    'What role does nurturing play in the evolution of ideas?',
    'How can we restore wholeness from fragmentation?',
  ],
}

export const mockConversationHistory = [
  {
    user: 'What is artificial intelligence?',
    assistant: mockGeminiResponse.choices[0].message.content,
  },
  {
    user: 'How does machine learning differ from traditional programming?',
    assistant:
      '## Machine Learning vs Traditional Programming\n\nTraditional programming involves explicit instructions...',
  },
]

export const mockNode = {
  id: '1',
  type: 'main',
  position: { x: 0, y: 0 },
  data: {
    label: 'Artificial Intelligence',
    content: mockGeminiResponse.choices[0].message.content,
    images: mockTavilyResponse.images,
    sources: mockSearchResult.sources,
    isLoading: false,
  },
}

export const mockEdge = {
  id: 'e1-2',
  source: '1',
  target: '2',
  type: 'smoothstep',
  animated: true,
}
