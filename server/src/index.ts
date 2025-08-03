
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createFormInputSchema, 
  updateFormInputSchema, 
  createSubmissionInputSchema,
  parseFormDescriptionInputSchema
} from './schema';

// Import handlers
import { parseFormDescription } from './handlers/parse_form_description';
import { createForm } from './handlers/create_form';
import { getFormById } from './handlers/get_form_by_id';
import { getForms } from './handlers/get_forms';
import { updateForm } from './handlers/update_form';
import { deleteForm } from './handlers/delete_form';
import { createSubmission } from './handlers/create_submission';
import { getFormSubmissions } from './handlers/get_form_submissions';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Form management routes
  parseFormDescription: publicProcedure
    .input(parseFormDescriptionInputSchema)
    .mutation(({ input }) => parseFormDescription(input)),

  createForm: publicProcedure
    .input(createFormInputSchema)
    .mutation(({ input }) => createForm(input)),

  getForms: publicProcedure
    .query(() => getForms()),

  getFormById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getFormById(input.id)),

  updateForm: publicProcedure
    .input(updateFormInputSchema)
    .mutation(({ input }) => updateForm(input)),

  deleteForm: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deleteForm(input.id)),

  // Form submission routes
  createSubmission: publicProcedure
    .input(createSubmissionInputSchema)
    .mutation(({ input }) => createSubmission(input)),

  getFormSubmissions: publicProcedure
    .input(z.object({ formId: z.string() }))
    .query(({ input }) => getFormSubmissions(input.formId))
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
