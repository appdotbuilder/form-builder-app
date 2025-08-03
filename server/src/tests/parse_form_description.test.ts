
import { describe, expect, it } from 'bun:test';
import { parseFormDescription } from '../handlers/parse_form_description';
import { type ParseFormDescriptionInput } from '../schema';

describe('parseFormDescription', () => {
    it('should parse basic contact form description', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'Create a contact form with name and email fields'
        };

        const result = await parseFormDescription(input);

        expect(result.title).toBe('Create a contact form with name and email fields');
        expect(result.description).toBe('Form generated from: Create a contact form with name and email fields');
        expect(result.fields).toHaveLength(2);

        const nameField = result.fields.find(f => f.name === 'name');
        expect(nameField).toBeDefined();
        expect(nameField?.type).toBe('text');
        expect(nameField?.required).toBe(true);
        expect(nameField?.label).toBe('Full Name');

        const emailField = result.fields.find(f => f.name === 'email');
        expect(emailField).toBeDefined();
        expect(emailField?.type).toBe('email');
        expect(emailField?.required).toBe(true);
        expect(emailField?.label).toBe('Email Address');
    });

    it('should parse comprehensive registration form', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'Registration form with name, email, age, phone, address, gender, and newsletter subscription'
        };

        const result = await parseFormDescription(input);

        expect(result.fields).toHaveLength(7);
        
        // Check for all expected fields
        const fieldNames = result.fields.map(f => f.name);
        expect(fieldNames).toContain('name');
        expect(fieldNames).toContain('email');
        expect(fieldNames).toContain('age');
        expect(fieldNames).toContain('phone');
        expect(fieldNames).toContain('address');
        expect(fieldNames).toContain('gender');
        expect(fieldNames).toContain('newsletter');

        // Check specific field types
        const ageField = result.fields.find(f => f.name === 'age');
        expect(ageField?.type).toBe('number');
        expect(ageField?.validation?.min).toBe(0);
        expect(ageField?.validation?.max).toBe(120);

        const genderField = result.fields.find(f => f.name === 'gender');
        expect(genderField?.type).toBe('select');
        expect(genderField?.options).toContain('Male');
        expect(genderField?.options).toContain('Female');

        const newsletterField = result.fields.find(f => f.name === 'newsletter');
        expect(newsletterField?.type).toBe('checkbox');
        expect(newsletterField?.required).toBe(false);
    });

    it('should handle feedback form with comments', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'Feedback form with name, email, and comments section'
        };

        const result = await parseFormDescription(input);

        expect(result.fields).toHaveLength(3);

        const commentsField = result.fields.find(f => f.name === 'comments');
        expect(commentsField).toBeDefined();
        expect(commentsField?.type).toBe('textarea');
        expect(commentsField?.label).toBe('Comments');
        expect(commentsField?.validation?.max).toBe(1000);
    });

    it('should handle terms and conditions checkbox', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'Sign up form with email and terms agreement'
        };

        const result = await parseFormDescription(input);

        expect(result.fields).toHaveLength(2);

        const termsField = result.fields.find(f => f.name === 'terms');
        expect(termsField).toBeDefined();
        expect(termsField?.type).toBe('checkbox');
        expect(termsField?.required).toBe(true);
        expect(termsField?.label).toBe('I agree to the terms and conditions');
    });

    it('should create default fields for unrecognized descriptions', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'Some random form description with no specific field keywords'
        };

        const result = await parseFormDescription(input);

        expect(result.fields).toHaveLength(2);
        expect(result.fields[0].name).toBe('name');
        expect(result.fields[0].type).toBe('text');
        expect(result.fields[1].name).toBe('message');
        expect(result.fields[1].type).toBe('textarea');
    });

    it('should extract title from first sentence', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'Customer Survey Form. This form collects customer feedback with various questions.'
        };

        const result = await parseFormDescription(input);

        expect(result.title).toBe('Customer Survey Form');
        expect(result.description).toBe('Form generated from: Customer Survey Form. This form collects customer feedback with various questions.');
    });

    it('should handle phone number field with validation', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'Contact form with name, email, and phone number'
        };

        const result = await parseFormDescription(input);

        const phoneField = result.fields.find(f => f.name === 'phone');
        expect(phoneField).toBeDefined();
        expect(phoneField?.type).toBe('text');
        expect(phoneField?.label).toBe('Phone Number');
        expect(phoneField?.validation?.pattern).toBe('^[+]?[0-9\\s\\-\\(\\)]+$');
        expect(phoneField?.validation?.min).toBe(10);
        expect(phoneField?.validation?.max).toBe(15);
    });

    it('should handle country selection field', async () => {
        const input: ParseFormDescriptionInput = {
            description: 'International registration with name, email, and country selection'
        };

        const result = await parseFormDescription(input);

        const countryField = result.fields.find(f => f.name === 'country');
        expect(countryField).toBeDefined();
        expect(countryField?.type).toBe('select');
        expect(countryField?.options).toContain('United States');
        expect(countryField?.options).toContain('Canada');
        expect(countryField?.options).toContain('Other');
    });
});
