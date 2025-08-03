
import { z } from 'zod';

// Form field types enum
export const fieldTypeSchema = z.enum(['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio']);
export type FieldType = z.infer<typeof fieldTypeSchema>;

// Form field schema
export const formFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  type: fieldTypeSchema,
  required: z.boolean(),
  placeholder: z.string().nullable(),
  options: z.array(z.string()).nullable(), // For select, radio fields
  validation: z.object({
    min: z.number().nullable(),
    max: z.number().nullable(),
    pattern: z.string().nullable()
  }).nullable()
});

export type FormField = z.infer<typeof formFieldSchema>;

// Form schema
export const formSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  fields: z.array(formFieldSchema),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Form = z.infer<typeof formSchema>;

// Form submission schema
export const formSubmissionSchema = z.object({
  id: z.string(),
  form_id: z.string(),
  submission_data: z.record(z.any()), // Dynamic key-value pairs for form data
  submitted_at: z.coerce.date()
});

export type FormSubmission = z.infer<typeof formSubmissionSchema>;

// Input schemas for creating forms
export const createFormInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  fields: z.array(formFieldSchema)
});

export type CreateFormInput = z.infer<typeof createFormInputSchema>;

// Input schema for updating forms
export const updateFormInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  fields: z.array(formFieldSchema).optional()
});

export type UpdateFormInput = z.infer<typeof updateFormInputSchema>;

// Input schema for form submissions
export const createSubmissionInputSchema = z.object({
  form_id: z.string(),
  submission_data: z.record(z.any())
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionInputSchema>;

// Schema for parsing form descriptions using AI/NLP
export const parseFormDescriptionInputSchema = z.object({
  description: z.string().min(1)
});

export type ParseFormDescriptionInput = z.infer<typeof parseFormDescriptionInputSchema>;

// Schema for parsed form structure
export const parsedFormSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  fields: z.array(formFieldSchema)
});

export type ParsedForm = z.infer<typeof parsedFormSchema>;
