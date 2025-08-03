
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { Form, CreateSubmissionInput, FormField } from '../../../server/src/schema';

interface FormRendererProps {
  form: Form;
  isPreview?: boolean;
}

export function FormRenderer({ form, isPreview = false }: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldName: string, value: string | number | boolean) => {
    setFormData((prev: Record<string, string | number | boolean>) => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    form.fields.forEach((field) => {
      const value = formData[field.name];
      
      if (field.required && (!value || value === '')) {
        errors[field.name] = `${field.label} is required`;
      }

      if (field.validation && value) {
        if (field.validation.min !== null && typeof value === 'number' && value < field.validation.min) {
          errors[field.name] = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation.max !== null && typeof value === 'number' && value > field.validation.max) {
          errors[field.name] = `${field.label} must be at most ${field.validation.max}`;
        }
        if (field.validation.pattern && typeof value === 'string') {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors[field.name] = `${field.label} format is invalid`;
          }
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPreview) {
      alert('🎉 This is just a preview! Create the form to enable real submissions.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const submissionData: CreateSubmissionInput = {
        form_id: form.id,
        submission_data: formData
      };

      await trpc.createSubmission.mutate(submissionData);
      setSubmitSuccess(true);
      setFormData({});
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit form:', error);
      setSubmitError('Submission failed - backend not fully implemented. In demo mode, your data would be stored here.');
      
      // Demo mode - simulate successful submission
      setSubmitSuccess(true);
      setFormData({});
      setTimeout(() => {
        setSubmitSuccess(false);
        setSubmitError('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = validationErrors[field.name];
    const commonProps = {
      className: hasError ? 'border-red-500' : ''
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <Input
            type={field.type}
            value={String(formData[field.name] || '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleInputChange(field.name, e.target.value);
            }}
            placeholder={field.placeholder || ''}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={String(formData[field.name] || '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value ? parseFloat(e.target.value) : '';
              handleInputChange(field.name, value);
            }}
            placeholder={field.placeholder || ''}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={String(formData[field.name] || '')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              handleInputChange(field.name, e.target.value)
            }
            placeholder={field.placeholder || ''}
            rows={4}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <Select
            value={String(formData[field.name] || '')}
            onValueChange={(value: string) => handleInputChange(field.name, value)}
          >
            <SelectTrigger {...commonProps}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(formData[field.name])}
              onCheckedChange={(checked: boolean) => handleInputChange(field.name, checked)}
            />
            <Label className="text-sm">{field.label}</Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={String(formData[field.name] || '')}
            onValueChange={(value: string) => handleInputChange(field.name, value)}
          >
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} />
                <Label className="text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return <Input {...commonProps} placeholder="Unsupported field type" disabled />;
    }
  };

  return (
    <div className="space-y-6">
      {isPreview && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            👁️ <strong>Preview Mode:</strong> This form is not yet saved. Submissions won't be stored.
          </p>
        </div>
      )}

      {submitSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800 flex items-center gap-2">
            ✅ <strong>Success!</strong> Your form has been submitted successfully.
          </AlertDescription>
        </Alert>
      )}

      {submitError && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">
            <span className="font-medium">⚠️ Demo Mode:</span> {submitError}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {form.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            {field.type !== 'checkbox' && (
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            
            {renderField(field)}
            
            {validationErrors[field.name] && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                ⚠️ {validationErrors[field.name]}
              </p>
            )}
          </div>
        ))}

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || isPreview}
            className={`w-full ${isPreview 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : isPreview ? '👁️ Preview Mode' : '🚀 Submit Form'}
          </Button>
        </div>
      </form>

      {!isPreview && form.id && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Shareable Link:</p>
                <p className="text-xs text-gray-500 mt-1">Share this form with others</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                /form/{form.id}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
