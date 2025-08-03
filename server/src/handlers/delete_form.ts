
import { db } from '../db';
import { formsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteForm(id: string): Promise<boolean> {
  try {
    const result = await db.delete(formsTable)
      .where(eq(formsTable.id, id))
      .execute();

    // Check if any rows were affected
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Form deletion failed:', error);
    throw error;
  }
}
