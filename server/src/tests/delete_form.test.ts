
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { formsTable, formSubmissionsTable } from '../db/schema';
import { deleteForm } from '../handlers/delete_form';
import { eq } from 'drizzle-orm';

describe('deleteForm', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing form', async () => {
    // Create a test form
    const testForm = {
      id: 'test-form-1',
      title: 'Test Form',
      description: 'A form for testing',
      fields: [
        {
          id: 'field1',
          name: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          placeholder: null,
          options: null,
          validation: null
        }
      ]
    };

    await db.insert(formsTable).values(testForm).execute();

    // Delete the form
    const result = await deleteForm('test-form-1');

    expect(result).toBe(true);

    // Verify form was deleted
    const forms = await db.select()
      .from(formsTable)
      .where(eq(formsTable.id, 'test-form-1'))
      .execute();

    expect(forms).toHaveLength(0);
  });

  it('should return false for non-existent form', async () => {
    const result = await deleteForm('non-existent-form');

    expect(result).toBe(false);
  });

  it('should cascade delete form submissions', async () => {
    // Create a test form
    const testForm = {
      id: 'test-form-2',
      title: 'Test Form with Submissions',
      description: 'A form for testing cascade deletion',
      fields: [
        {
          id: 'field1',
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          placeholder: null,
          options: null,
          validation: null
        }
      ]
    };

    await db.insert(formsTable).values(testForm).execute();

    // Create test submissions
    const testSubmissions = [
      {
        id: 'submission-1',
        form_id: 'test-form-2',
        submission_data: { email: 'test1@example.com' }
      },
      {
        id: 'submission-2',
        form_id: 'test-form-2',
        submission_data: { email: 'test2@example.com' }
      }
    ];

    await db.insert(formSubmissionsTable).values(testSubmissions).execute();

    // Verify submissions exist
    const submissionsBefore = await db.select()
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.form_id, 'test-form-2'))
      .execute();

    expect(submissionsBefore).toHaveLength(2);

    // Delete the form
    const result = await deleteForm('test-form-2');

    expect(result).toBe(true);

    // Verify form was deleted
    const forms = await db.select()
      .from(formsTable)
      .where(eq(formsTable.id, 'test-form-2'))
      .execute();

    expect(forms).toHaveLength(0);

    // Verify submissions were also deleted (cascade)
    const submissionsAfter = await db.select()
      .from(formSubmissionsTable)
      .where(eq(formSubmissionsTable.form_id, 'test-form-2'))
      .execute();

    expect(submissionsAfter).toHaveLength(0);
  });

  it('should not affect other forms', async () => {
    // Create multiple test forms
    const testForms = [
      {
        id: 'form-to-delete',
        title: 'Form to Delete',
        description: 'This form will be deleted',
        fields: [
          {
            id: 'field1',
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: null,
            options: null,
            validation: null
          }
        ]
      },
      {
        id: 'form-to-keep',
        title: 'Form to Keep',
        description: 'This form should remain',
        fields: [
          {
            id: 'field1',
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: null,
            options: null,
            validation: null
          }
        ]
      }
    ];

    await db.insert(formsTable).values(testForms).execute();

    // Delete one form
    const result = await deleteForm('form-to-delete');

    expect(result).toBe(true);

    // Verify only the target form was deleted
    const remainingForms = await db.select()
      .from(formsTable)
      .execute();

    expect(remainingForms).toHaveLength(1);
    expect(remainingForms[0].id).toBe('form-to-keep');
    expect(remainingForms[0].title).toBe('Form to Keep');
  });
});
