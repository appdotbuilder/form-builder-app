
import { db } from '../db';
import { formsTable } from '../db/schema';
import { type Form } from '../schema';
import { eq } from 'drizzle-orm';

export async function getFormById(id: string): Promise<Form | null> {
  try {
    const results = await db.select()
      .from(formsTable)
      .where(eq(formsTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const form = results[0];
    return {
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields as any, // JSONB field - cast to maintain type
      created_at: form.created_at,
      updated_at: form.updated_at
    };
  } catch (error) {
    console.error('Failed to get form by ID:', error);
    throw error;
  }
}
