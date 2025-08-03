
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { formsTable, formSubmissionsTable } from '../db/schema';
import { type CreateSubmissionInput, type FormField } from '../schema';
import { createSubmission } from '../handlers/create_submission';
import { eq } from 'drizzle-orm';

// Test form data
const testForm = {
  id: crypto.randomUUID(),
  title: 'Contact Form',
  description: 'A simple contact form',
  fields: [
    {
      id: 'name',
      name: 'name',
      label: 'Name',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter your name',
      options: null,
      validation: null
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true,
      placeholder: 'Enter your email',
      options: null,
      validation: null
    }
  ] as FormField[]
};

const testInput: CreateSubmissionInput = {
  form_id: testForm.id,
  submission_data: {
    name: 'John Doe',
    email: 'john@example.com'
  }
};

describe('createSubmission', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a form submission', async () => {
    // Create prerequisite form
    await db.insert(formsTable)
      .values({
        id: testForm.id,
        title: testForm.title,
        description: testForm.description,
        fields: testForm.fields
      })
      .execute();

    const result = await createSubmission(testInput);

    // Basic field validation
    expect(result.form_id).toEqual(testForm.id);
    expect(result.submission_data).toEqual(testInput.submission_data);
    expect(result.id).toBeDefined();
    expect(result.submitted_at).toBeInstanceOf(Date);
  });

  it('should save submission to database', async () => {
    // Create prerequisite form
    await db.insert(formsTable)
      .values({
        id: testForm.id,
        title: testForm.title,
        description: testForm.description,
        fields: testForm.fields
      })
      .execute();

    const result = await createSubmission(testInput);

    // Query submission from database
    const submissions = await db.select()
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.id, result.id))
      .execute();

    expect(submissions).toHaveLength(1);
    expect(submissions[0].form_id).toEqual(testForm.id);
    expect(submissions[0].submission_data).toEqual(testInput.submission_data);
    expect(submissions[0].submitted_at).toBeInstanceOf(Date);
  });

  it('should throw error when form does not exist', async () => {
    const invalidInput: CreateSubmissionInput = {
      form_id: 'non-existent-form-id',
      submission_data: { test: 'data' }
    };

    await expect(createSubmission(invalidInput)).rejects.toThrow(/Form with id non-existent-form-id not found/i);
  });

  it('should handle complex submission data', async () => {
    // Create prerequisite form
    await db.insert(formsTable)
      .values({
        id: testForm.id,
        title: testForm.title,
        description: testForm.description,
        fields: testForm.fields
      })
      .execute();

    const complexInput: CreateSubmissionInput = {
      form_id: testForm.id,
      submission_data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        preferences: ['option1', 'option2'],
        nested: {
          address: '123 Main St',
          city: 'Anytown'
        }
      }
    };

    const result = await createSubmission(complexInput);

    expect(result.submission_data).toEqual(complexInput.submission_data);
    expect(result.submission_data['age']).toEqual(25);
    expect(result.submission_data['preferences']).toEqual(['option1', 'option2']);
    expect(result.submission_data['nested']).toEqual({
      address: '123 Main St',
      city: 'Anytown'
    });
  });
});
