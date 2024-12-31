import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { KnowledgeEntry, KnowledgeVote, KnowledgeRevision } from '@db/schema';

interface CreateKnowledgeEntry {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

interface CreateVote {
  value: number;
  expertise: string;
  comment?: string;
}

export function useKnowledge() {
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading: loadingEntries } = useQuery<KnowledgeEntry[]>({
    queryKey: ['/api/knowledge'],
  });

  const getEntry = async (id: number) => {
    const response = await fetch(`/api/knowledge/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch knowledge entry');
    }

    return response.json();
  };

  const createEntryMutation = useMutation({
    mutationFn: async (data: CreateKnowledgeEntry) => {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create knowledge entry');
      }

      return response.json() as Promise<KnowledgeEntry>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, vote }: { id: number; vote: CreateVote }) => {
      const response = await fetch(`/api/knowledge/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vote),
      });

      if (!response.ok) {
        throw new Error('Failed to vote on entry');
      }

      return response.json() as Promise<KnowledgeVote>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge'] });
    },
  });

  const getRevisions = async (id: number) => {
    const response = await fetch(`/api/knowledge/${id}/revisions`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch revisions');
    }

    return response.json() as Promise<KnowledgeRevision[]>;
  };

  return {
    entries,
    loadingEntries,
    getEntry,
    createEntry: createEntryMutation.mutateAsync,
    vote: voteMutation.mutateAsync,
    getRevisions,
  };
}
