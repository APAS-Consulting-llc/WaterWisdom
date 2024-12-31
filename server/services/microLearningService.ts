import { handleChatMessage } from './chatService';

const INDUSTRY_TOPICS = [
  'water conservation techniques',
  'wastewater treatment innovations',
  'water quality monitoring',
  'sustainable water management',
  'smart water technologies',
  'water infrastructure maintenance',
  'water policy and regulations',
  'climate change impacts on water resources'
];

const CONTENT_PROMPT = `Create a professional micro-learning module about the following water industry topic. Format your response in this structure (without markdown symbols):

Title: [Topic Title]

Key Concepts:
• [First key concept]
• [Second key concept]
• [Third key concept]

Recent Developments:
[2-3 sentences about recent trends or developments]

Practical Applications:
[2-3 sentences about real-world applications]

Reflection Question:
[One thought-provoking question]

Keep the content focused on professional development in the water sector.
Topic: `;

interface MicroLearningContent {
  title: string;
  content: string;
  author?: string;
  timestamp: string;
}

export async function generateMicroLearning(topic?: string): Promise<MicroLearningContent> {
  try {
    const selectedTopic = topic || INDUSTRY_TOPICS[Math.floor(Math.random() * INDUSTRY_TOPICS.length)];
    const prompt = CONTENT_PROMPT + selectedTopic;

    const rawContent = await handleChatMessage(prompt);

    // Clean up any remaining markdown artifacts
    const cleanContent = rawContent
      .replace(/\*\*/g, '')
      .replace(/\#\#/g, '')
      .replace(/\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Extract title from content (assuming first line is title)
    const lines = cleanContent.split('\n');
    const title = lines[0].replace('Title:', '').trim();
    const content = lines.slice(1).join('\n').trim();

    return {
      title,
      content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating micro-learning content:', error);
    throw new Error('Failed to generate micro-learning content');
  }
}