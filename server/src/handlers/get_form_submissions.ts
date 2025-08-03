
import { db } from '../db';
import { formSubmissionsTable } from '../db/schema';
import { type FormSubmission } from '../schema';
import { eq } from 'drizzle-orm';

export async function getFormSubmissions(formId: string): Promise<FormSubmission[]> {
  try {
    const results = await db.select()
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.form_id, formId))
      .execute();

    return results.map(submission => ({
      id: submission.id,
      form_id: submission.form_id,
      submission_data: submission.submission_data as Record<string, any>,
      submitted_at: submission.submitted_at
    }));
  } catch (error) {
    console.error('Failed to get form submissions:', error);
    throw error;
  }
}
