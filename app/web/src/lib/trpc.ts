import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@usejson/server/src/main';

export const trpc = createTRPCReact<AppRouter>();