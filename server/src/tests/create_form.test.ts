
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { formsTable } from '../db/schema';
import { type CreateFormInput, type FormField } from '../schema';
import { createForm } from '../handlers/create_form';
import { eq } from 'drizzle-orm';

// Test form fields
const testFields: FormField[] = [
  {
    id: 'field1',
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your full name',
    options: null,
    validation: {
      min: 2,
      max: 50,
      pattern: null
    }
  },
  {
    id: 'field2',
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email',
    options: null,
    validation: null
  },
  {
    id: 'field3',
    name: 'age',
    label: 'Age',
    type: 'number',
    required: false,
    placeholder: 'Enter your age',
    options: null,
    validation: {
      min: 18,
      max: 100,
      pattern: null
    }
  }
];

// Test input
const testInput: CreateFormInput = {
  title: 'Contact Form',
  description: 'A simple contact form for testing',
  fields: testFields
};

describe('createForm', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a form with all fields', async () => {
    const result = await createForm(testInput);

    // Basic field validation
    expect(result.title).toEqual('Contact Form');
    expect(result.description).toEqual('A simple contact form for testing');
    expect(result.fields).toHaveLength(3);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Validate field structure
    expect(result.fields[0].name).toEqual('name');
    expect(result.fields[0].type).toEqual('text');
    expect(result.fields[0].required).toBe(true);
    expect(result.fields[1].name).toEqual('email');
    expect(result.fields[1].type).toEqual('email');
    expect(result.fields[2].name).toEqual('age');
    expect(result.fields[2].type).toEqual('number');
    expect(result.fields[2].required).toBe(false);
  });

  it('should save form to database', async () => {
    const result = await createForm(testInput);

    // Query database to verify form was saved
    const forms = await db.select()
      .from(formsTable)
      .where(eq(formsTable.id, result.id))
      .execute();

    expect(forms).toHaveLength(1);
    const savedForm = forms[0];
    expect(savedForm.title).toEqual('Contact Form');
    expect(savedForm.description).toEqual('A simple contact form for testing');
    expect(savedForm.created_at).toBeInstanceOf(Date);
    expect(savedForm.updated_at).toBeInstanceOf(Date);

    // Validate JSONB fields array
    const fieldsArray = savedForm.fields as any[];
    expect(fieldsArray).toHaveLength(3);
    expect(fieldsArray[0].name).toEqual('name');
    expect(fieldsArray[0].type).toEqual('text');
    expect(fieldsArray[1].name).toEqual('email');
    expect(fieldsArray[2].name).toEqual('age');
  });

  it('should create form with null description', async () => {
    const inputWithNullDescription: CreateFormInput = {
      title: 'Simple Form',
      description: null,
      fields: [testFields[0]] // Just one field
    };

    const result = await createForm(inputWithNullDescription);

    expect(result.title).toEqual('Simple Form');
    expect(result.description).toBeNull();
    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].name).toEqual('name');
  });

  it('should generate unique IDs for different forms', async () => {
    const result1 = await createForm(testInput);
    const result2 = await createForm({
      ...testInput,
      title: 'Different Form'
    });

    expect(result1.id).not.toEqual(result2.id);
    expect(typeof result1.id).toBe('string');
    expect(typeof result2.id).toBe('string');

    // Both should exist in database
    const forms = await db.select()
      .from(formsTable)
      .execute();

    expect(forms).toHaveLength(2);
  });

  it('should handle complex field validation objects', async () => {
    const complexField: FormField = {
      id: 'complex_field',
      name: 'username',
      label: 'Username',
      type: 'text',
      required: true,
      placeholder: 'Enter username',
      options: null,
      validation: {
        min: 3,
        max: 20,
        pattern: '^[a-zA-Z0-9_]+$'
      }
    };

    const inputWithComplexValidation: CreateFormInput = {
      title: 'Registration Form',
      description: 'User registration',
      fields: [complexField]
    };

    const result = await createForm(inputWithComplexValidation);

    expect(result.fields).toHaveLength(1);
    expect(result.fields[0].validation).toBeDefined();
    expect(result.fields[0].validation?.min).toEqual(3);
    expect(result.fields[0].validation?.max).toEqual(20);
    expect(result.fields[0].validation?.pattern).toEqual('^[a-zA-Z0-9_]+$');
  });
});
