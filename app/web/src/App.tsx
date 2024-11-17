
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {trpc} from '@/lib/trpc';
import { httpBatchLink } from '@trpc/client';
import Flow from '@/components/Flow';
import "@xyflow/react/dist/style.css";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      headers: () => ({
        // Add any required headers
      }),
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include', // Important for CORS with credentials
        });
      },
    }),
  ],
});

const App = () => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Flow />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default App;
