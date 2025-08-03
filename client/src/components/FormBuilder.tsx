
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { Form, ParsedForm, CreateFormInput } from '../../../server/src/schema';

interface FormBuilderProps {
  onFormCreated: (form: Form) => void;
  onFormPreview: (parsedForm: ParsedForm) => void;
}

export function FormBuilder({ onFormCreated, onFormPreview }: FormBuilderProps) {
  const [description, setDescription] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isParsingDescription, setIsParsingDescription] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [parsedForm, setParsedForm] = useState<ParsedForm | null>(null);
  const [error, setError] = useState<string>('');

  const exampleDescriptions = [
    "I need a contact form with name, email, and message fields",
    "Create a registration form with first name, last name, email, phone, and age",
    "I want a feedback form with rating, comments, and contact email",
    "Make a job application form with name, email, resume upload, and experience level"
  ];

  const handleParseDescription = async () => {
    if (!description.trim()) return;

    setIsParsingDescription(true);
    setError('');
    try {
      const result = await trpc.parseFormDescription.mutate({ description });
      setParsedForm(result);
      onFormPreview(result);
      setCustomTitle(result.title);
    } catch (error) {
      console.error('Failed to parse form description:', error);
      setError('Failed to parse description. Using demo mode with basic field detection.');
      
      // Fallback demo parsing for when backend is not implemented
      const demoResult = createDemoForm(description);
      setParsedForm(demoResult);
      onFormPreview(demoResult);
      setCustomTitle(demoResult.title);
    } finally {
      setIsParsingDescription(false);
    }
  };

  const createDemoForm = (desc: string): ParsedForm => {
    const description = desc.toLowerCase();
    const fields = [];
    
    // Simple demo field detection
    if (description.includes('name') || description.includes('first name') || description.includes('last name')) {
      fields.push({
        id: 'name',
        name: 'name',
        label: 'Name',
        type: 'text' as const,
        required: true,
        placeholder: 'Enter your name',
        options: null,
        validation: null
      });
    }
    
    if (description.includes('email')) {
      fields.push({
        id: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email' as const,
        required: true,
        placeholder: 'Enter your email',
        options: null,
        validation: null
      });
    }
    
    if (description.includes('age')) {
      fields.push({
        id: 'age',
        name: 'age',
        label: 'Age',
        type: 'number' as const,
        required: true,
        placeholder: 'Enter your age',
        options: null,
        validation: { min: 0, max: 120, pattern: null }
      });
    }
    
    if (description.includes('message') || description.includes('comment')) {
      fields.push({
        id: 'message',
        name: 'message',
        label: 'Message',
        type: 'textarea' as const,
        required: true,
        placeholder: 'Enter your message',
        options: null,
        validation: null
      });
    }
    
    if (description.includes('phone')) {
      fields.push({
        id: 'phone',
        name: 'phone',
        label: 'Phone Number',
        type: 'text' as const,
        required: false,
        placeholder: 'Enter your phone number',
        options: null,
        validation: null
      });
    }
    
    // Default fields if nothing detected
    if (fields.length === 0) {
      fields.push({
        id: 'name',
        name: 'name',
        label: 'Name',
        type: 'text' as const,
        required: true,
        placeholder: 'Enter your name',
        options: null,
        validation: null
      });
    }
    
    return {
      title: 'Generated Form',
      description: `Demo form generated from: ${desc}`,
      fields
    };
  };

  const handleCreateForm = async () => {
    if (!parsedForm) return;

    setIsCreatingForm(true);
    setError('');
    try {
      const formData: CreateFormInput = {
        title: customTitle || parsedForm.title,
        description: parsedForm.description,
        fields: parsedForm.fields
      };

      const newForm = await trpc.createForm.mutate(formData);
      onFormCreated(newForm);
      
      // Reset form
      setDescription('');
      setCustomTitle('');
      setParsedForm(null);
    } catch (error) {
      console.error('Failed to create form:', error);
      setError('Failed to save form to backend. Using demo mode - form will work but not persist.');
      
      // Create demo form for frontend demo
      const demoForm: Form = {
        id: crypto.randomUUID(),
        title: customTitle || parsedForm.title,
        description: parsedForm.description,
        fields: parsedForm.fields,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      onFormCreated(demoForm);
      
      // Reset form
      setDescription('');
      setCustomTitle('');
      setParsedForm(null);
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setDescription(example);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">
            <span className="font-medium">⚠️ Demo Mode:</span> {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Describe your form in plain English:
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Example: I need a contact form with name, email, and message fields"
            className="min-h-[100px] resize-none"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-gray-600">💡 Try these examples:</Label>
          <div className="flex flex-wrap gap-2">
            {exampleDescriptions.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(example)}
                className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleParseDescription}
          disabled={!description.trim() || isParsingDescription}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          {isParsingDescription ? 'Analyzing...' : '🔍 Generate Preview'}
        </Button>
      </div>

      {parsedForm && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Generated</Badge>
              <span className="text-sm font-medium">Form Structure Created!</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customTitle" className="text-sm">
                Customize form title (optional):
              </Label>
              <Input
                id="customTitle"
                value={customTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTitle(e.target.value)}
                placeholder={parsedForm.title}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Detected fields:</Label>
              <div className="flex flex-wrap gap-2">
                {parsedForm.fields.map((field) => (
                  <Badge key={field.id} variant="outline" className="text-xs">
                    {field.label} ({field.type})
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleCreateForm}
              disabled={isCreatingForm}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isCreatingForm ? 'Creating...' : '✅ Create Form'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
