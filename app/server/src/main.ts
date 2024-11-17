
import { initTRPC } from '@trpc/server';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

const appRouter = router({
  hello: publicProcedure.query(() => {
    return 'Hello from tRPC!';
  }),
});

const app = express();

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  }),
);

app.listen(3001);

export type AppRouter = typeof appRouter;