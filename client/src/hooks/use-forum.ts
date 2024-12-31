import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ForumPost, ForumComment, ForumReaction } from '@db/schema';

interface CreatePostData {
  title: string;
  content: string;
  questionId?: number;
  tags?: string[];
}

interface CreateCommentData {
  content: string;
  postId: number;
  parentId?: number;
}

export function useForum() {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: loadingPosts } = useQuery<ForumPost[]>({
    queryKey: ['/api/forum/posts'],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostData) => {
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      return response.json() as Promise<ForumPost>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const response = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      return response.json() as Promise<ForumComment>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/forum/posts', variables.postId, 'comments'] 
      });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ 
      type, 
      postId, 
      commentId 
    }: { 
      type: 'like' | 'helpful' | 'insightful';
      postId?: number;
      commentId?: number;
    }) => {
      const response = await fetch('/api/forum/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, postId, commentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      return response.json() as Promise<ForumReaction>;
    },
    onSuccess: (_, variables) => {
      if (variables.postId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/forum/posts', variables.postId] 
        });
      }
      if (variables.commentId) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/forum/comments', variables.commentId] 
        });
      }
    },
  });

  const getPostComments = async (postId: number) => {
    const response = await fetch(`/api/forum/posts/${postId}/comments`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    return response.json() as Promise<ForumComment[]>;
  };

  return {
    posts,
    loadingPosts,
    createPost: createPostMutation.mutateAsync,
    createComment: createCommentMutation.mutateAsync,
    addReaction: addReactionMutation.mutateAsync,
    getPostComments,
  };
}
