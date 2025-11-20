import { AIService } from '@/app/services/aiService';
import { NextResponse } from 'next/server';

const aiService = AIService.getInstance();

export async function POST(req: Request) {
  try {
    const { action, node, context } = await req.json();

    if (!action || !node) {
      return NextResponse.json(
        { error: 'Action and node are required' },
        { status: 400 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';
    const nodeContent = node.data?.content || 'No content';
    const nodeLabel = node.data?.label || 'Untitled';

    switch (action) {
      case 'raise-questions':
        systemPrompt = `You are a critical thinking assistant. Generate 3-5 thought-provoking questions that this content raises. Questions should probe deeper, challenge assumptions, or explore implications.`;
        userPrompt = `Based on this content, what questions does it raise?\n\nTitle: ${nodeLabel}\nContent: ${nodeContent}`;
        break;

      case 'find-contradictions':
        systemPrompt = `You are a balanced research assistant. Identify potential contradicting viewpoints, alternative perspectives, or counterarguments to this content. Be objective and fair.`;
        userPrompt = `What are potential contradicting viewpoints or counterarguments?\n\nTitle: ${nodeLabel}\nContent: ${nodeContent}`;
        break;

      case 'suggest-connections':
        systemPrompt = `You are analyzing a knowledge graph. Based on the current node and other nodes in the canvas, suggest 2-3 meaningful connections that could be made. Explain why each connection would be valuable.

Return your response as a JSON array:
[
  {
    "targetNodeId": "id-of-node-to-connect-to",
    "targetLabel": "label of target node",
    "connectionType": "leads-to|related|contradicts|supports|expands",
    "reasoning": "why this connection makes sense"
  }
]`;
        userPrompt = `Current Node: ${nodeLabel}\nContent: ${nodeContent}\n\nOther nodes:\n${context?.otherNodes || 'No other nodes'}`;
        break;

      case 'expand':
        systemPrompt = `You are a research expansion assistant. Take this idea and expand it in 2-3 interesting directions. For each direction, provide a brief explanation of what could be explored.`;
        userPrompt = `Expand on this idea:\n\nTitle: ${nodeLabel}\nContent: ${nodeContent}`;
        break;

      case 'find-evidence':
        systemPrompt = `You are a research assistant helping find supporting evidence. Suggest 3-4 types of evidence or sources that would support or validate this content. Be specific about what to look for.`;
        userPrompt = `What evidence would support this?\n\nTitle: ${nodeLabel}\nContent: ${nodeContent}`;
        break;

      case 'fact-check':
        systemPrompt = `You are a fact-checking assistant. Analyze this content for factual claims that should be verified. List the key claims and suggest how to verify them. Be helpful but cautious.`;
        userPrompt = `What claims should be fact-checked?\n\nTitle: ${nodeLabel}\nContent: ${nodeContent}`;
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    // Call AI service
    const response = await aiService.complete({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    });

    // For connection suggestions, try to parse JSON
    let result = response;
    if (action === 'suggest-connections') {
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse connection suggestions:', e);
      }
    }

    return NextResponse.json({
      action,
      result,
      nodeId: node.id,
    });
  } catch (error) {
    console.error('AI action error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI action' },
      { status: 500 }
    );
  }
}
