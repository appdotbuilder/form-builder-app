
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { formsTable } from '../db/schema';
import { type FormField } from '../schema';
import { getFormById } from '../handlers/get_form_by_id';

const testFields: FormField[] = [
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
      pattern: '^[^@]+@[^@]+\.[^@]+$'
    }
  },
  {
    id: 'field2',
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: false,
    placeholder: 'Your message here',
    options: null,
    validation: {
      min: 10,
      max: 500,
      pattern: null
    }
  }
];

describe('getFormById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return form when it exists', async () => {
    // Create test form
    await db.insert(formsTable)
      .values({
        id: 'test-form-id',
        title: 'Contact Form',
        description: 'A simple contact form',
        fields: testFields
      })
      .execute();

    const result = await getFormById('test-form-id');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('test-form-id');
    expect(result!.title).toEqual('Contact Form');
    expect(result!.description).toEqual('A simple contact form');
    expect(result!.fields).toEqual(testFields);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when form does not exist', async () => {
    const result = await getFormById('non-existent-id');
    
    expect(result).toBeNull();
  });

  it('should handle form with null description', async () => {
    // Create test form with null description
    await db.insert(formsTable)
      .values({
        id: 'form-no-desc',
        title: 'Simple Form',
        description: null,
        fields: testFields
      })
      .execute();

    const result = await getFormById('form-no-desc');

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('form-no-desc');
    expect(result!.title).toEqual('Simple Form');
    expect(result!.description).toBeNull();
    expect(result!.fields).toEqual(testFields);
  });

  it('should handle complex form fields correctly', async () => {
    const complexFields: FormField[] = [
      {
        id: 'select-field',
        name: 'country',
        label: 'Select Country',
        type: 'select',
        required: true,
        placeholder: null,
        options: ['USA', 'Canada', 'UK'],
        validation: null
      },
      {
        id: 'radio-field',
        name: 'preference',
        label: 'Preference',
        type: 'radio',
        required: false,
        placeholder: null,
        options: ['Option A', 'Option B'],
        validation: null
      }
    ];

    await db.insert(formsTable)
      .values({
        id: 'complex-form',
        title: 'Complex Form',
        description: 'Form with complex fields',
        fields: complexFields
      })
      .execute();

    const result = await getFormById('complex-form');

    expect(result).not.toBeNull();
    expect(result!.fields).toEqual(complexFields);
    expect(result!.fields[0].options).toEqual(['USA', 'Canada', 'UK']);
    expect(result!.fields[1].options).toEqual(['Option A', 'Option B']);
  });
});
