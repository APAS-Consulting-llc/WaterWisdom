import { ChatMessage } from '@/hooks/use-chat';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

const SYSTEM_PROMPT = `You are a knowledgeable water sector professional assistant. Your role is to:
1. Help users understand water-related concepts
2. Provide accurate information about water conservation, treatment, and management
3. Explain concepts from our water sector quiz database
4. Give detailed but concise answers about water-related topics

Keep responses focused on water-related topics and professional development in the water sector.
If asked about unrelated topics, politely redirect the conversation to water-related subjects.`;

async function getAIResponse(messages: PerplexityMessage[]): Promise<string> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: 0.2,
        max_tokens: 300,
        presence_penalty: 0,
        frequency_penalty: 1,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function handleChatMessage(message: string): Promise<string> {
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: message,
    },
  ];

  try {
    return await getAIResponse(messages);
  } catch (error) {
    console.error('Chat service error:', error);
    throw error;
  }
}
