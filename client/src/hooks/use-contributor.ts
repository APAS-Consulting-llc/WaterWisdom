import { useQuery } from '@tanstack/react-query';

export function useContributor(userId: number) {
  return useQuery({
    queryKey: ['/api/contributors', userId],
    enabled: !!userId,
  });
}
