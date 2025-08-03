
import { db } from '../db';
import { formsTable } from '../db/schema';
import { type UpdateFormInput, type Form } from '../schema';
import { eq } from 'drizzle-orm';

export const updateForm = async (input: UpdateFormInput): Promise<Form | null> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    
    if (input.fields !== undefined) {
      updateData.fields = input.fields;
    }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date();
    
    // If no fields to update, return null
    if (Object.keys(updateData).length === 1) { // Only updated_at
      return null;
    }
    
    // Update the form record
    const result = await db.update(formsTable)
      .set(updateData)
      .where(eq(formsTable.id, input.id))
      .returning()
      .execute();
    
    // Return null if no form was found/updated
    if (result.length === 0) {
      return null;
    }
    
    const updatedForm = result[0];
    
    // Convert to proper schema format
    return {
      id: updatedForm.id,
      title: updatedForm.title,
      description: updatedForm.description,
      fields: updatedForm.fields as any[], // JSONB field
      created_at: updatedForm.created_at,
      updated_at: updatedForm.updated_at
    };
  } catch (error) {
    console.error('Form update failed:', error);
    throw error;
  }
};
