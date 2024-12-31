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

const CONTENT_PROMPT = `As a water industry expert, create a concise micro-learning module about the following topic. Include:
1. Key concepts (2-3 bullet points)
2. Recent developments or trends
3. Practical applications
4. A thought-provoking question for reflection

Keep the response structured and focused on professional development in the water sector.
Topic: `;

export async function generateMicroLearning(topic?: string): Promise<string> {
  try {
    // If no topic provided, randomly select one
    const selectedTopic = topic || INDUSTRY_TOPICS[Math.floor(Math.random() * INDUSTRY_TOPICS.length)];
    const prompt = CONTENT_PROMPT + selectedTopic;
    
    const content = await handleChatMessage(prompt);
    return content;
  } catch (error) {
    console.error('Error generating micro-learning content:', error);
    throw new Error('Failed to generate micro-learning content');
  }
}
