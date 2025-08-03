
import { db } from '../db';
import { formSubmissionsTable, formsTable } from '../db/schema';
import { type CreateSubmissionInput, type FormSubmission } from '../schema';
import { eq } from 'drizzle-orm';

export async function createSubmission(input: CreateSubmissionInput): Promise<FormSubmission> {
  try {
    // First, verify that the form exists
    const existingForms = await db.select()
      .from(formsTable)
      .where(eq(formsTable.id, input.form_id))
      .execute();

    if (existingForms.length === 0) {
      throw new Error(`Form with id ${input.form_id} not found`);
    }

    // Generate UUID for the submission
    const submissionId = crypto.randomUUID();

    // Insert submission record
    const result = await db.insert(formSubmissionsTable)
      .values({
        id: submissionId,
        form_id: input.form_id,
        submission_data: input.submission_data
      })
      .returning()
      .execute();

    // Return the submission with proper type casting
    const submission = result[0];
    return {
      ...submission,
      submission_data: submission.submission_data as Record<string, any>
    };
  } catch (error) {
    console.error('Form submission creation failed:', error);
    throw error;
  }
}
