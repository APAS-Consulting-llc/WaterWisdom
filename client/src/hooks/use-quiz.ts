import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Question, UserProgress, DifficultyLevel } from '@db/schema';

interface PerformanceMetrics {
  correctAnswers: number;
  totalQuestions: number;
  streakCount: number;
  categoryAccuracy: Record<string, number>;
}

export function useQuiz() {
  const queryClient = useQueryClient();

  const fetchQuestions = async (category?: string, difficulty?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);

    const response = await fetch(`/api/questions?${params}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    return response.json() as Promise<Question[]>;
  };

  const submitAnswer = async ({ 
    questionId, 
    answer,
    category,
    difficulty,
    currentStreak 
  }: { 
    questionId: number; 
    answer: string;
    category: string;
    difficulty: DifficultyLevel;
    currentStreak: number;
  }) => {
    const response = await fetch('/api/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        questionId, 
        answer,
        category,
        difficulty,
        currentStreak
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit answer: ${response.statusText}`);
    }

    return response.json() as Promise<UserProgress & { 
      performanceMetrics: PerformanceMetrics;
      recommendedDifficulty: DifficultyLevel;
    }>;
  };

  const createQuestion = async (question: Omit<Question, 'id' | 'createdAt' | 'approved'>) => {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(question)
    });

    if (!response.ok) {
      throw new Error(`Failed to create question: ${response.statusText}`);
    }

    return response.json() as Promise<Question>;
  };

  const questions = useQuery({
    queryKey: ['questions'],
    queryFn: () => fetchQuestions(),
  });

  const submitAnswerMutation = useMutation({
    mutationFn: submitAnswer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });

      // Update user's performance metrics in the cache
      queryClient.setQueryData(['performanceMetrics'], data.performanceMetrics);
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  return {
    questions: questions.data,
    isLoading: questions.isLoading,
    error: questions.error,
    submitAnswer: submitAnswerMutation.mutateAsync,
    createQuestion: createQuestionMutation.mutateAsync,
  };
}