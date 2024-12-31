import { useQuery } from '@tanstack/react-query';

export function useNews() {
  return useQuery({
    queryKey: ['/api/news'],
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
  });
}
