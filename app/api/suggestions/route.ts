import { AIService } from '@/app/services/aiService';
import { NextResponse } from 'next/server';

const aiService = AIService.getInstance();

export async function POST(req: Request) {
  try {
    const { nodeId, nodeData, allNodes, mode } = await req.json();

    if (!nodeData) {
      return NextResponse.json(
        { error: 'Node data is required' },
        { status: 400 }
      );
    }

    // Build context from current node
    const nodeContext = `
Current Node: ${nodeData.label}
Content: ${nodeData.content || 'No content yet'}
Type: ${nodeData.type || 'unknown'}
    `.trim();

    // Build context from other nodes
    const otherNodesContext = allNodes
      ?.filter((n: any) => n.id !== nodeId)
      .slice(0, 5) // Limit to 5 most recent
      .map((n: any) => `- ${n.label}: ${n.content?.slice(0, 100) || 'No content'}`)
      .join('\n') || 'No other nodes';

    // Tailor system prompt based on exploration mode
    let systemPrompt = '';
    let userPrompt = '';

    switch (mode) {
      case 'guided':
        systemPrompt = `You are an AI research assistant helping guide a user's exploration.
Generate 3-4 helpful suggestions for next steps based on the current node.

Suggestions should be:
- Thought-provoking questions that expand the topic
- Potential connections to other existing nodes
- New directions to explore

Format your response as a JSON array of suggestion objects:
[
  {
    "type": "question|connection|expansion",
    "content": "The suggestion text",
    "reasoning": "Why this is relevant"
  }
]`;
        break;

      case 'hybrid':
        systemPrompt = `You are an AI research assistant providing balanced suggestions.
Generate 2-3 suggestions that balance user autonomy with helpful guidance.

Mix different types:
- Open-ended questions
- Possible connections
- Alternative perspectives

Format your response as a JSON array of suggestion objects:
[
  {
    "type": "question|connection|expansion",
    "content": "The suggestion text",
    "reasoning": "Why this might be interesting"
  }
]`;
        break;

      case 'classic':
        systemPrompt = `You are an AI research assistant in auto-exploration mode.
Generate 3 follow-up questions that naturally extend from this topic.

Format your response as a JSON array of suggestion objects:
[
  {
    "type": "question",
    "content": "The follow-up question",
    "reasoning": "How it connects to the current topic"
  }
]`;
        break;

      default:
        // Manual mode - shouldn't reach here but handle gracefully
        return NextResponse.json({ suggestions: [] });
    }

    userPrompt = `
${nodeContext}

Other nodes in the canvas:
${otherNodesContext}

Please generate relevant suggestions for the user's next steps.
`;

    // Call AI service
    const response = await aiService.complete({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    });

    // Parse AI response
    let suggestions = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create suggestions from the raw response
        suggestions = [
          {
            type: 'expansion',
            content: response,
            reasoning: 'AI-generated suggestion',
          },
        ];
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to a simple suggestion
      suggestions = [
        {
          type: 'question',
          content: 'What aspects of this topic would you like to explore further?',
          reasoning: 'Open-ended exploration',
        },
      ];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestion generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
