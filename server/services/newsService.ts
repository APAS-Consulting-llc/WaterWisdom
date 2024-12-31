import { db } from "@db";
import { eq } from "drizzle-orm";

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  category: string;
  timestamp: string;
  relevanceScore: number;
}

export async function getContextualNews(userInterests: string[]): Promise<NewsItem[]> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: "You are a water sector news expert. Return recent news about water management, treatment, and sustainability in JSON format."
        },
        {
          role: "user",
          content: `Find recent news articles related to these topics: ${userInterests.join(', ')}. Return in this format: [{"title": string, "summary": string, "url": string, "category": string, "timestamp": string, "relevanceScore": number}]`
        }
      ],
      temperature: 0.2,
      max_tokens: 1000,
      top_p: 0.9,
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }

  const data = await response.json();
  const newsItems: NewsItem[] = JSON.parse(data.choices[0].message.content);

  return newsItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export async function getPersonalizedNews(userId: number): Promise<NewsItem[]> {
  // Get user's interests based on their learning paths and progress
  const userProgress = await db
    .select({
      category: 'questions.category',
      correctCount: db.count('userProgress.correct'),
    })
    .from('userProgress')
    .innerJoin('questions', eq('userProgress.questionId', 'questions.id'))
    .where(eq('userProgress.userId', userId))
    .groupBy('questions.category');

  const userInterests = userProgress
    .map(p => p.category)
    .filter(Boolean);

  // If no interests found, use default categories
  if (userInterests.length === 0) {
    userInterests.push('water treatment', 'sustainability', 'water management');
  }

  return getContextualNews(userInterests);
}
