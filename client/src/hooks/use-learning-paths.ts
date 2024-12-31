import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LearningPath, UserLearningPath } from '@db/schema';

export function useLearningPaths() {
  const queryClient = useQueryClient();

  const { data: learningPaths = [], isLoading } = useQuery<LearningPath[]>({
    queryKey: ['/api/learning-paths'],
  });

  const { data: userPaths = [], isLoading: loadingUserPaths } = useQuery<UserLearningPath[]>({
    queryKey: ['/api/learning-paths/user'],
  });

  const enrollMutation = useMutation({
    mutationFn: async (pathId: number) => {
      const response = await fetch('/api/learning-paths/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pathId })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll in learning path');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learning-paths/user'] });
    },
  });

  return {
    learningPaths,
    userPaths,
    isLoading: isLoading || loadingUserPaths,
    enroll: enrollMutation.mutateAsync,
  };
}
