import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchGraph, PackageNotFoundError } from '../graph/fetchGraph';

export const DEFAULT_PACKAGE = 'express';

/**
 * Shared between the hook and main.tsx's prefetch of the default graph,
 * so both sides agree on the key and the prefetch dedupes the mount-time fetch.
 * Registry metadata moves slowly; a graph stays fresh for five minutes and
 * previously-viewed packages stay instantly restorable for thirty.
 */
export const graphQueryOptions = (name: string) => ({
  queryKey: ['dependency-graph', name] as const,
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchGraph(name, signal),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
});

export function useDependencyGraph(name: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    ...graphQueryOptions(name),
    enabled,
    // A package that doesn't exist won't start existing on retry
    retry: (failures, error) => !(error instanceof PackageNotFoundError) && failures < 2,
    // Keep the current graph on screen while the next search is in flight
    placeholderData: keepPreviousData,
  });
}
