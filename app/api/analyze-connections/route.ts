import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/app/services/aiService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { nodes, existingEdges } = await request.json();

    if (!nodes || nodes.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const aiService = getAIService();

    // Create a summary of nodes
    const nodeSummary = nodes.map((node: any) => ({
      id: node.id,
      label: node.data.label || 'Untitled',
      content: (node.data.content || '').slice(0, 200) // Limit to 200 chars
    }));

    const existingConnectionsSet = new Set(
      existingEdges.map((e: any) => `${e.source}-${e.target}`)
    );

    const systemPrompt = `You are analyzing nodes in a mind map to suggest meaningful connections.

Nodes:
${JSON.stringify(nodeSummary, null, 2)}

Existing connections:
${JSON.stringify(existingEdges.map((e: any) => ({ source: e.source, target: e.target })), null, 2)}

Analyze these nodes and suggest 2-3 new connections that would be meaningful. Return your response as a JSON array with objects having these fields:
- source: node ID
- target: node ID
- reason: Why this connection makes sense
- confidence: 0-100 (how confident you are this is a good connection)

Only suggest connections that don't already exist. Return ONLY the JSON array, no additional text.`;

    const response = await aiService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Analyze and suggest connections.' }
    ]);

    const content = response.choices[0]?.message?.content || '[]';

    try {
      const suggestions = JSON.parse(content);
      // Filter out existing connections
      const filteredSuggestions = suggestions.filter((s: any) =>
        !existingConnectionsSet.has(`${s.source}-${s.target}`)
      );
      return NextResponse.json({ suggestions: filteredSuggestions });
    } catch (parseError) {
      return NextResponse.json({ suggestions: [] });
    }
  } catch (error) {
    console.error('Error analyzing connections:', error);
    return NextResponse.json(
      { error: 'Failed to analyze connections', suggestions: [] },
      { status: 500 }
    );
  }
}
