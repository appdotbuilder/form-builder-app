
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { formsTable } from '../db/schema';
import { getForms } from '../handlers/get_forms';
import { type FormField } from '../schema';

const testFormFields: FormField[] = [
  {
    id: 'field1',
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email',
    options: null,
    validation: {
      min: null,
      max: null,
      pattern: '^[^@]+@[^@]+\\.[^@]+$'
    }
  },
  {
    id: 'field2',
    name: 'feedback',
    label: 'Feedback',
    type: 'textarea',
    required: false,
    placeholder: 'Your feedback...',
    options: null,
    validation: {
      min: 10,
      max: 500,
      pattern: null
    }
  }
];

describe('getForms', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no forms exist', async () => {
    const result = await getForms();
    expect(result).toEqual([]);
  });

  it('should return all forms', async () => {
    // Create test forms
    await db.insert(formsTable).values([
      {
        id: 'form1',
        title: 'Contact Form',
        description: 'A simple contact form',
        fields: testFormFields
      },
      {
        id: 'form2',
        title: 'Survey Form',
        description: null,
        fields: [testFormFields[0]] // Only email field
      }
    ]).execute();

    const result = await getForms();

    expect(result).toHaveLength(2);
    
    // Verify first form
    const contactForm = result.find(f => f.id === 'form1');
    expect(contactForm).toBeDefined();
    expect(contactForm!.title).toEqual('Contact Form');
    expect(contactForm!.description).toEqual('A simple contact form');
    expect(contactForm!.fields).toHaveLength(2);
    expect(contactForm!.created_at).toBeInstanceOf(Date);
    expect(contactForm!.updated_at).toBeInstanceOf(Date);

    // Verify second form
    const surveyForm = result.find(f => f.id === 'form2');
    expect(surveyForm).toBeDefined();
    expect(surveyForm!.title).toEqual('Survey Form');
    expect(surveyForm!.description).toBeNull();
    expect(surveyForm!.fields).toHaveLength(1);
    expect(surveyForm!.created_at).toBeInstanceOf(Date);
    expect(surveyForm!.updated_at).toBeInstanceOf(Date);
  });

  it('should preserve field structure correctly', async () => {
    await db.insert(formsTable).values({
      id: 'test-form',
      title: 'Test Form',
      description: 'Testing field preservation',
      fields: testFormFields
    }).execute();

    const result = await getForms();
    const form = result[0];

    expect(form.fields).toHaveLength(2);
    
    // Verify email field
    const emailField = form.fields[0];
    expect(emailField.id).toEqual('field1');
    expect(emailField.name).toEqual('email');
    expect(emailField.type).toEqual('email');
    expect(emailField.required).toBe(true);
    expect(emailField.validation!.pattern).toEqual('^[^@]+@[^@]+\\.[^@]+$');

    // Verify textarea field
    const textareaField = form.fields[1];
    expect(textareaField.id).toEqual('field2');
    expect(textareaField.type).toEqual('textarea');
    expect(textareaField.required).toBe(false);
    expect(textareaField.validation!.min).toEqual(10);
    expect(textareaField.validation!.max).toEqual(500);
  });
});
