
import { type ParseFormDescriptionInput, type ParsedForm, type FormField } from '../schema';

export async function parseFormDescription(input: ParseFormDescriptionInput): Promise<ParsedForm> {
    const description = input.description.toLowerCase();
    const fields: FormField[] = [];
    
    // Extract title from description - use first sentence or first 50 chars
    const titleMatch = input.description.match(/^[^.!?]*[.!?]?/);
    const title = titleMatch ? titleMatch[0].replace(/[.!?]$/, '').trim() : 
                  input.description.substring(0, 50).trim();
    
    // Pattern matching for common form fields
    
    // Name fields
    if (description.includes('name') || description.includes('full name')) {
        fields.push({
            id: 'name',
            name: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter your full name',
            options: null,
            validation: { min: 2, max: 100, pattern: null }
        });
    }
    
    // Email fields
    if (description.includes('email') || description.includes('e-mail')) {
        fields.push({
            id: 'email',
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'Enter your email address',
            options: null,
            validation: null
        });
    }
    
    // Phone fields
    if (description.includes('phone') || description.includes('telephone') || description.includes('mobile')) {
        fields.push({
            id: 'phone',
            name: 'phone',
            label: 'Phone Number',
            type: 'text',
            required: false,
            placeholder: 'Enter your phone number',
            options: null,
            validation: { min: 10, max: 15, pattern: '^[+]?[0-9\\s\\-\\(\\)]+$' }
        });
    }
    
    // Age fields
    if (description.includes('age')) {
        fields.push({
            id: 'age',
            name: 'age',
            label: 'Age',
            type: 'number',
            required: true,
            placeholder: 'Enter your age',
            options: null,
            validation: { min: 0, max: 120, pattern: null }
        });
    }
    
    // Address fields
    if (description.includes('address')) {
        fields.push({
            id: 'address',
            name: 'address',
            label: 'Address',
            type: 'textarea',
            required: false,
            placeholder: 'Enter your address',
            options: null,
            validation: { min: 10, max: 200, pattern: null }
        });
    }
    
    // Comments or message fields
    if (description.includes('comment') || description.includes('message') || description.includes('feedback')) {
        fields.push({
            id: 'comments',
            name: 'comments',
            label: 'Comments',
            type: 'textarea',
            required: false,
            placeholder: 'Enter your comments',
            options: null,
            validation: { min: 0, max: 1000, pattern: null }
        });
    }
    
    // Gender selection
    if (description.includes('gender')) {
        fields.push({
            id: 'gender',
            name: 'gender',
            label: 'Gender',
            type: 'select',
            required: false,
            placeholder: 'Select your gender',
            options: ['Male', 'Female', 'Other', 'Prefer not to say'],
            validation: null
        });
    }
    
    // Country selection
    if (description.includes('country')) {
        fields.push({
            id: 'country',
            name: 'country',
            label: 'Country',
            type: 'select',
            required: false,
            placeholder: 'Select your country',
            options: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Other'],
            validation: null
        });
    }
    
    // Newsletter subscription
    if (description.includes('newsletter') || description.includes('subscribe')) {
        fields.push({
            id: 'newsletter',
            name: 'newsletter',
            label: 'Subscribe to Newsletter',
            type: 'checkbox',
            required: false,
            placeholder: null,
            options: null,
            validation: null
        });
    }
    
    // Terms and conditions
    if (description.includes('terms') || description.includes('agreement')) {
        fields.push({
            id: 'terms',
            name: 'terms',
            label: 'I agree to the terms and conditions',
            type: 'checkbox',
            required: true,
            placeholder: null,
            options: null,
            validation: null
        });
    }
    
    // Default fallback - if no fields detected, add basic contact fields
    if (fields.length === 0) {
        fields.push(
            {
                id: 'name',
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                placeholder: 'Enter your name',
                options: null,
                validation: { min: 1, max: 100, pattern: null }
            },
            {
                id: 'message',
                name: 'message',
                label: 'Message',
                type: 'textarea',
                required: true,
                placeholder: 'Enter your message',
                options: null,
                validation: { min: 1, max: 500, pattern: null }
            }
        );
    }
    
    return {
        title: title || 'Generated Form',
        description: `Form generated from: ${input.description}`,
        fields
    };
}
