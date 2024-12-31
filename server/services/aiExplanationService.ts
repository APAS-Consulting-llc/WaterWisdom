import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateExplanation(topic: string, question: string): Promise<string> {
  try {
    const prompt = `Generate a detailed but concise explanation (2-3 paragraphs) about the following water-sector related topic and question:

Topic: ${topic}
Question: ${question}

Focus on providing educational value and practical insights that would help water sector professionals understand this concept better.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Explanation not available.";
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw new Error('Failed to generate explanation');
  }
}

export async function updateQuestionsWithExplanations() {
  try {
    const [questions] = await db
      .select()
      .from(questions)
      .where(eq(questions.explanation, ''));

    for (const question of questions) {
      const explanation = await generateExplanation(question.topic, question.question);
      
      await db
        .update(questions)
        .set({ explanation })
        .where(eq(questions.id, question.id));
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return true;
  } catch (error) {
    console.error('Error updating questions with explanations:', error);
    return false;
  }
}
