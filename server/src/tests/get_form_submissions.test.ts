
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { formsTable, formSubmissionsTable } from '../db/schema';
import { getFormSubmissions } from '../handlers/get_form_submissions';

// Simple ID generator for tests
const generateId = () => Math.random().toString(36).substring(2, 15);

describe('getFormSubmissions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return submissions for a specific form', async () => {
    // Create test form first
    const formId = generateId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Test Form',
      description: 'A form for testing',
      fields: [
        {
          id: 'field1',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: null,
          options: null,
          validation: null
        }
      ]
    }).execute();

    // Create test submissions
    const submission1Id = generateId();
    const submission2Id = generateId();
    
    await db.insert(formSubmissionsTable).values([
      {
        id: submission1Id,
        form_id: formId,
        submission_data: { name: 'John Doe', email: 'john@example.com' }
      },
      {
        id: submission2Id,
        form_id: formId,
        submission_data: { name: 'Jane Smith', email: 'jane@example.com' }
      }
    ]).execute();

    const result = await getFormSubmissions(formId);

    expect(result).toHaveLength(2);
    expect(result[0].id).toEqual(submission1Id);
    expect(result[0].form_id).toEqual(formId);
    expect(result[0].submission_data).toEqual({ name: 'John Doe', email: 'john@example.com' });
    expect(result[0].submitted_at).toBeInstanceOf(Date);
    
    expect(result[1].id).toEqual(submission2Id);
    expect(result[1].form_id).toEqual(formId);
    expect(result[1].submission_data).toEqual({ name: 'Jane Smith', email: 'jane@example.com' });
    expect(result[1].submitted_at).toBeInstanceOf(Date);
  });

  it('should return empty array for form with no submissions', async () => {
    // Create test form without submissions
    const formId = generateId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Empty Form',
      description: 'A form with no submissions',
      fields: [
        {
          id: 'field1',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          placeholder: null,
          options: null,
          validation: null
        }
      ]
    }).execute();

    const result = await getFormSubmissions(formId);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should only return submissions for the specified form', async () => {
    // Create two test forms
    const form1Id = generateId();
    const form2Id = generateId();
    
    await db.insert(formsTable).values([
      {
        id: form1Id,
        title: 'Form 1',
        description: 'First form',
        fields: [{ id: 'field1', name: 'name', label: 'Name', type: 'text', required: true, placeholder: null, options: null, validation: null }]
      },
      {
        id: form2Id,
        title: 'Form 2',
        description: 'Second form',
        fields: [{ id: 'field1', name: 'email', label: 'Email', type: 'email', required: true, placeholder: null, options: null, validation: null }]
      }
    ]).execute();

    // Create submissions for both forms
    await db.insert(formSubmissionsTable).values([
      {
        id: generateId(),
        form_id: form1Id,
        submission_data: { name: 'Form 1 User' }
      },
      {
        id: generateId(),
        form_id: form2Id,
        submission_data: { email: 'form2@example.com' }
      },
      {
        id: generateId(),
        form_id: form1Id,
        submission_data: { name: 'Another Form 1 User' }
      }
    ]).execute();

    const result = await getFormSubmissions(form1Id);

    expect(result).toHaveLength(2);
    result.forEach(submission => {
      expect(submission.form_id).toEqual(form1Id);
      expect(submission.submission_data['name']).toBeDefined();
    });
  });

  it('should handle complex submission data structures', async () => {
    // Create test form
    const formId = generateId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Complex Form',
      description: 'A form with complex data',
      fields: [
        {
          id: 'field1',
          name: 'preferences',
          label: 'Preferences',
          type: 'checkbox',
          required: false,
          placeholder: null,
          options: ['option1', 'option2'],
          validation: null
        }
      ]
    }).execute();

    // Create submission with complex data
    const submissionId = generateId();
    const complexData = {
      preferences: ['option1', 'option2'],
      nested: {
        value: 123,
        items: ['a', 'b', 'c']
      },
      boolean_field: true
    };

    await db.insert(formSubmissionsTable).values({
      id: submissionId,
      form_id: formId,
      submission_data: complexData
    }).execute();

    const result = await getFormSubmissions(formId);

    expect(result).toHaveLength(1);
    expect(result[0].submission_data).toEqual(complexData);
    expect(result[0].submission_data['preferences']).toEqual(['option1', 'option2']);
    expect(result[0].submission_data['nested']).toEqual({ value: 123, items: ['a', 'b', 'c'] });
    expect(result[0].submission_data['boolean_field']).toEqual(true);
  });
});
