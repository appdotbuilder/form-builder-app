
import { db } from '../db';
import { formsTable } from '../db/schema';
import { type CreateFormInput, type Form } from '../schema';

export async function createForm(input: CreateFormInput): Promise<Form> {
  try {
    const formId = crypto.randomUUID(); // Generate unique ID for shareable link
    
    // Insert form record
    const result = await db.insert(formsTable)
      .values({
        id: formId,
        title: input.title,
        description: input.description,
        fields: input.fields // JSONB field - no conversion needed
      })
      .returning()
      .execute();

    const form = result[0];
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields as any[], // Cast JSONB back to FormField array
      created_at: form.created_at,
      updated_at: form.updated_at
    };
  } catch (error) {
    console.error('Form creation failed:', error);
    throw error;
  }
}
