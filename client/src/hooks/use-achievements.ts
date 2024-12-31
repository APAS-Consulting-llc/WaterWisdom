import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Achievement } from '@db/schema';

export function useAchievements() {
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  const checkAchievementsMutation = useMutation({
    mutationFn: async (progress: {
      points: number;
      streak: number;
      category?: string;
      correctAnswers: number;
      totalQuestions: number;
    }) => {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(progress),
      });

      if (!response.ok) {
        throw new Error('Failed to check achievements');
      }

      return response.json() as Promise<Achievement[]>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
    },
  });

  return {
    achievements,
    isLoading,
    checkAchievements: checkAchievementsMutation.mutateAsync,
    newAchievements: checkAchievementsMutation.data || [],
  };
}
