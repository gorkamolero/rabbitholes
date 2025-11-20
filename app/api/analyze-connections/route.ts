import { AIService } from '@/app/services/aiService';
import { NextResponse } from 'next/server';

const aiService = AIService.getInstance();

export async function POST(req: Request) {
  try {
    const { nodes, existingEdges } = await req.json();

    if (!nodes || nodes.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Build context for AI
    const nodesContext = nodes
      .map((n: any, i: number) => `${i + 1}. [${n.id}] ${n.label}: ${n.content?.slice(0, 150) || 'No content'}`)
      .join('\n');

    const existingConnectionsContext = existingEdges
      ?.map((e: any) => `${e.source} -> ${e.target}`)
      .join(', ') || 'None';

    const systemPrompt = `You are analyzing a knowledge graph to suggest meaningful connections between nodes.

Analyze the nodes and suggest 2-4 valuable connections that don't already exist. Each suggestion should:
- Connect two different nodes
- Have a clear logical relationship
- Add value to the knowledge graph
- Not duplicate existing connections

Connection types:
- "leads-to": A naturally follows B (causal, sequential)
- "related": Similar topics or themes
- "contradicts": Opposing views or conflicting information
- "supports": Evidence or examples that strengthen an idea
- "expands": Builds upon or elaborates an idea

Return ONLY a JSON array (no markdown formatting):
[
  {
    "source": "node-id-1",
    "target": "node-id-2",
    "connectionType": "leads-to",
    "reason": "Brief explanation of why this connection makes sense",
    "confidence": 0.8
  }
]`;

    const userPrompt = `Nodes in the graph:
${nodesContext}

Existing connections: ${existingConnectionsContext}

Analyze these nodes and suggest valuable connections.`;

    // Call AI service
    const completion = await aiService.createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    const response = completion.choices[0]?.message?.content || '';

    // Parse response
    let suggestions = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Add IDs and validate
        suggestions = parsed
          .filter((s: any) => s.source && s.target && s.source !== s.target)
          .map((s: any, i: number) => ({
            ...s,
            id: `suggestion-${s.source}-${s.target}-${Date.now()}-${i}`,
            confidence: s.confidence || 0.7,
          }));
      }
    } catch (parseError) {
      console.error('Failed to parse connection suggestions:', parseError);
    }

    // Limit to top 4 suggestions
    suggestions = suggestions.slice(0, 4);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Connection analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze connections' },
      { status: 500 }
    );
  }
}
