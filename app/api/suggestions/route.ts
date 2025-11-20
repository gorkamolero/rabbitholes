import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/app/services/aiService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { nodeId, nodeData } = await request.json();

    if (!nodeData) {
      return NextResponse.json(
        { error: 'Node data is required' },
        { status: 400 }
      );
    }

    const aiService = getAIService();

    const systemPrompt = `You are an AI assistant helping users explore ideas in a mind map.
The user is currently viewing a node with the following content:

Label: ${nodeData.label || 'Untitled'}
Content: ${nodeData.content || 'No content'}

Generate 3 helpful suggestions for what they could explore next. Return your response as a JSON array with objects having these fields:
- type: "question" | "connection" | "expansion"
- content: The actual suggestion text
- reasoning: Why this suggestion is relevant (optional)

Example:
[
  {
    "type": "question",
    "content": "What are the historical origins of this concept?",
    "reasoning": "Understanding historical context often reveals hidden connections"
  },
  {
    "type": "expansion",
    "content": "Explore real-world applications of this idea",
    "reasoning": "Practical examples help solidify abstract concepts"
  },
  {
    "type": "connection",
    "content": "Compare this with similar concepts in other fields",
    "reasoning": "Cross-domain connections spark creativity"
  }
]

Return ONLY the JSON array, no additional text.`;

    const response = await aiService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate suggestions for this node.' }
    ]);

    const content = response.choices[0]?.message?.content || '[]';

    try {
      const suggestions = JSON.parse(content);
      return NextResponse.json({ suggestions });
    } catch (parseError) {
      // If AI didn't return valid JSON, create fallback suggestions
      return NextResponse.json({
        suggestions: [
          {
            type: 'question',
            content: 'What questions does this raise?',
            reasoning: 'Explore deeper understanding'
          },
          {
            type: 'expansion',
            content: 'Find related concepts',
            reasoning: 'Build a broader perspective'
          },
          {
            type: 'connection',
            content: 'Connect to existing knowledge',
            reasoning: 'Integrate new information'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', suggestions: [] },
      { status: 500 }
    );
  }
}
