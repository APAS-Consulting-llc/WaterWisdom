import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Question, UserProgress } from '@db/schema';

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

  const submitAnswer = async ({ questionId, answer }: { questionId: number; answer: string }) => {
    const response = await fetch('/api/submit-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ questionId, answer })
    });

    if (!response.ok) {
      throw new Error(`Failed to submit answer: ${response.statusText}`);
    }

    return response.json() as Promise<UserProgress>;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
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
