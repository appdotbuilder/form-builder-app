
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { Form } from '../../../server/src/schema';

interface FormListProps {
  forms: Form[];
  onFormSelect: (form: Form) => void;
  onFormDeleted: (formId: string) => void;
  selectedForm: Form | null;
}

export function FormList({ forms, onFormSelect, onFormDeleted, selectedForm }: FormListProps) {
  const [deletingFormId, setDeletingFormId] = useState<string>('');

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    setDeletingFormId(formId);
    try {
      await trpc.deleteForm.mutate({ id: formId });
      onFormDeleted(formId);
    } catch (error) {
      console.error('Failed to delete form:', error);
    } finally {
      setDeletingFormId('');
    }
  };

  const copyShareableLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
    alert('📋 Shareable link copied to clipboard!');
  };

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-lg text-gray-600 mb-2">No forms created yet</p>
        <p className="text-sm text-gray-500">
          Switch to the "Form Builder" tab to create your first form!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {forms.map((form: Form) => (
        <Card 
          key={form.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedForm?.id === form.id 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onFormSelect(form)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  📋 {form.title}
                  {selectedForm?.id === form.id && (
                    <Badge className="bg-blue-500">Selected</Badge>
                  )}
                </CardTitle>
                {form.description && (
                  <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    copyShareableLink(form.id);
                  }}
                  className="text-xs"
                >
                  🔗 Copy Link
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleDeleteForm(form.id);
                  }}
                  disabled={deletingFormId === form.id}
                  className="text-xs"
                >
                  {deletingFormId === form.id ? '⏳' : '🗑️'}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-2">Form Fields ({form.fields.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {form.fields.map((field) => (
                    <Badge 
                      key={field.id} 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {field.label} ({field.type})
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>📅 Created: {form.created_at.toLocaleDateString()}</span>
                  <span className="font-mono">ID: {form.id.slice(0, 8)}...</span>
                </div>
                <div className="text-right">
                  <p>🔗 /form/{form.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
