
import { db } from '../db';
import { formsTable } from '../db/schema';
import { type Form } from '../schema';

export const getForms = async (): Promise<Form[]> => {
  try {
    const results = await db.select()
      .from(formsTable)
      .execute();

    // Convert database results to schema format
    return results.map(form => ({
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields as any, // JSONB field - trust the database structure
      created_at: form.created_at,
      updated_at: form.updated_at
    }));
  } catch (error) {
    console.error('Failed to fetch forms:', error);
    throw error;
  }
};
