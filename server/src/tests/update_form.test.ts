
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { formsTable } from '../db/schema';
import { type UpdateFormInput, type FormField } from '../schema';
import { updateForm } from '../handlers/update_form';
import { eq } from 'drizzle-orm';

// Generate simple UUIDs for testing
const generateTestId = () => Math.random().toString(36).substring(2, 15);

// Test form fields
const testFields: FormField[] = [
  {
    id: 'field1',
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your name',
    options: null,
    validation: {
      min: 2,
      max: 50,
      pattern: null
    }
  }
];

const updatedFields: FormField[] = [
  {
    id: 'field1',
    name: 'name',
    label: 'Your Full Name',
    type: 'text',
    required: true,
    placeholder: 'Please enter your full name',
    options: null,
    validation: {
      min: 3,
      max: 100,
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
  }
];

describe('updateForm', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a form with all fields', async () => {
    // Create initial form
    const formId = generateTestId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Original Form',
      description: 'Original description',
      fields: testFields
    }).execute();

    const updateInput: UpdateFormInput = {
      id: formId,
      title: 'Updated Form Title',
      description: 'Updated description',
      fields: updatedFields
    };

    const result = await updateForm(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(formId);
    expect(result!.title).toEqual('Updated Form Title');
    expect(result!.description).toEqual('Updated description');
    expect(result!.fields).toHaveLength(2);
    expect(result!.fields[0].label).toEqual('Your Full Name');
    expect(result!.fields[1].name).toEqual('email');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update only title when provided', async () => {
    // Create initial form
    const formId = generateTestId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Original Title',
      description: 'Original description',
      fields: testFields
    }).execute();

    const updateInput: UpdateFormInput = {
      id: formId,
      title: 'New Title Only'
    };

    const result = await updateForm(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('New Title Only');
    expect(result!.description).toEqual('Original description'); // Unchanged
    expect(result!.fields).toHaveLength(1); // Unchanged
    expect(result!.fields[0].label).toEqual('Full Name'); // Original field
  });

  it('should update only description when provided', async () => {
    // Create initial form
    const formId = generateTestId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Test Form',
      description: 'Old description',
      fields: testFields
    }).execute();

    const updateInput: UpdateFormInput = {
      id: formId,
      description: 'Brand new description'
    };

    const result = await updateForm(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Test Form'); // Unchanged
    expect(result!.description).toEqual('Brand new description');
    expect(result!.fields).toHaveLength(1); // Unchanged
  });

  it('should update only fields when provided', async () => {
    // Create initial form
    const formId = generateTestId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Test Form',
      description: 'Test description',
      fields: testFields
    }).execute();

    const updateInput: UpdateFormInput = {
      id: formId,
      fields: updatedFields
    };

    const result = await updateForm(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Test Form'); // Unchanged
    expect(result!.description).toEqual('Test description'); // Unchanged
    expect(result!.fields).toHaveLength(2); // Updated
    expect(result!.fields[1].type).toEqual('email');
  });

  it('should return null when form does not exist', async () => {
    const nonExistentId = generateTestId();
    
    const updateInput: UpdateFormInput = {
      id: nonExistentId,
      title: 'This will not work'
    };

    const result = await updateForm(updateInput);

    expect(result).toBeNull();
  });

  it('should save changes to database', async () => {
    // Create initial form
    const formId = generateTestId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Original Form',
      description: 'Original description',
      fields: testFields
    }).execute();

    const updateInput: UpdateFormInput = {
      id: formId,
      title: 'Database Test Form',
      description: 'Testing database persistence'
    };

    await updateForm(updateInput);

    // Verify changes were saved
    const savedForm = await db.select()
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .execute();

    expect(savedForm).toHaveLength(1);
    expect(savedForm[0].title).toEqual('Database Test Form');
    expect(savedForm[0].description).toEqual('Testing database persistence');
    expect(savedForm[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description update', async () => {
    // Create initial form with description
    const formId = generateTestId();
    await db.insert(formsTable).values({
      id: formId,
      title: 'Test Form',
      description: 'Has description',
      fields: testFields
    }).execute();

    const updateInput: UpdateFormInput = {
      id: formId,
      description: null
    };

    const result = await updateForm(updateInput);

    expect(result).not.toBeNull();
    expect(result!.description).toBeNull();
  });
});
