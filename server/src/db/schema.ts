
import { text, pgTable, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const formsTable = pgTable('forms', {
  id: text('id').primaryKey(), // UUID string
  title: text('title').notNull(),
  description: text('description'), // Nullable
  fields: jsonb('fields').notNull(), // Store form fields as JSON
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const formSubmissionsTable = pgTable('form_submissions', {
  id: text('id').primaryKey(), // UUID string
  form_id: text('form_id').notNull().references(() => formsTable.id, { onDelete: 'cascade' }),
  submission_data: jsonb('submission_data').notNull(), // Store submitted form data as JSON
  submitted_at: timestamp('submitted_at').defaultNow().notNull()
});

// Define relations
export const formsRelations = relations(formsTable, ({ many }) => ({
  submissions: many(formSubmissionsTable)
}));

export const formSubmissionsRelations = relations(formSubmissionsTable, ({ one }) => ({
  form: one(formsTable, {
    fields: [formSubmissionsTable.form_id],
    references: [formsTable.id]
  })
}));

// TypeScript types for the table schemas
export type Form = typeof formsTable.$inferSelect;
export type NewForm = typeof formsTable.$inferInsert;
export type FormSubmission = typeof formSubmissionsTable.$inferSelect;
export type NewFormSubmission = typeof formSubmissionsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  forms: formsTable, 
  formSubmissions: formSubmissionsTable 
};
