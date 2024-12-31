import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface AdminStats {
  users: {
    total: number;
    activeToday: number;
  };
  content: {
    questions: number;
    pendingQuestions: number;
    knowledgeEntries: number;
    pendingEntries: number;
  };
  learning: {
    paths: number;
    enrollments: number;
  };
}

interface UserListItem {
  id: number;
  username: string;
  role: string;
  createdAt: string;
  points: number;
}

export function useAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: loadingStats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<UserListItem[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: pendingQuestions = [], isLoading: loadingPendingQuestions } = useQuery({
    queryKey: ['/api/admin/moderation/questions'],
  });

  const { data: pendingKnowledge = [], isLoading: loadingPendingKnowledge } = useQuery({
    queryKey: ['/api/admin/moderation/knowledge'],
  });

  const approveQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await fetch(`/api/admin/moderation/questions/${questionId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to approve question');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: 'Success',
        description: 'Question approved successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to approve question',
        variant: 'destructive',
      });
    },
  });

  const verifyKnowledgeMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/admin/moderation/knowledge/${entryId}/verify`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to verify knowledge entry');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: 'Success',
        description: 'Knowledge entry verified successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to verify knowledge entry',
        variant: 'destructive',
      });
    },
  });

  return {
    stats,
    users,
    pendingQuestions,
    pendingKnowledge,
    loadingStats,
    loadingUsers,
    loadingPendingQuestions,
    loadingPendingKnowledge,
    approveQuestion: approveQuestionMutation.mutateAsync,
    verifyKnowledge: verifyKnowledgeMutation.mutateAsync,
  };
}
