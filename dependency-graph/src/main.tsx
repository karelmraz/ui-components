import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { DEFAULT_PACKAGE, graphQueryOptions } from './hooks/useDependencyGraph.ts';

const queryClient = new QueryClient();

// Start the default graph's network round-trip before React renders;
// the mount-time useQuery dedupes against this prefetch.
queryClient.prefetchQuery(graphQueryOptions(DEFAULT_PACKAGE));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
