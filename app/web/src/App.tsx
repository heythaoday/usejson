import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {trpc} from '@/lib/trpc';
import { httpBatchLink } from '@trpc/client';
import Flow from '@/components/Flow';
import "@xyflow/react/dist/style.css";

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `http://${window.location.hostname}:3001/trpc`,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
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
