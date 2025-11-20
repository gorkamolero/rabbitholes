import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/app/services/aiService';

interface SuggestionsRequest {
  query: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  mode?: 'expansive' | 'focused';
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestionsRequest = await request.json();
    const { query, conversationHistory, mode = 'expansive' } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // System prompt for generating follow-up questions
    const systemPrompt = `You are an AI assistant helping users explore topics deeply.
Your task is to generate 5 thoughtful follow-up questions based on the current topic.

Guidelines:
- Generate exactly 5 follow-up questions
- Make them diverse: include related questions, thought-provoking questions, and alternative perspectives
- One question should be directly related to the topic
- One or two should be thought-provoking or explore deeper implications
- One or two should present devil's advocate or alternative viewpoints
- Make questions concise but meaningful
- Each question should end with a question mark

Format your response as a numbered list:
1. [First question]?
2. [Second question]?
3. [Third question]?
4. [Fourth question]?
5. [Fifth question]?`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: `Generate 5 diverse follow-up questions for this topic: "${query}"`,
      },
    ];

    const aiService = getAIService();
    const response = await aiService.createChatCompletion(messages);

    // Extract questions from the response
    const content = response.choices[0]?.message?.content || '';
    const suggestions = content
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.replace(/^\d+\.\s+/, '').trim())
      .filter((line) => line.includes('?'))
      .slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
