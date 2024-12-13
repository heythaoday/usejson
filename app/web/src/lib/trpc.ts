import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@visualjson/server/src/main';

export const trpc = createTRPCReact<AppRouter>();