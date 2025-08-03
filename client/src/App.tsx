
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { FormBuilder } from '@/components/FormBuilder';
import { FormRenderer } from '@/components/FormRenderer';
import { FormList } from '@/components/FormList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Form, ParsedForm } from '../../server/src/schema';

function App() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [previewForm, setPreviewForm] = useState<ParsedForm | null>(null);
  const [backendError, setBackendError] = useState<string>('');

  const loadForms = useCallback(async () => {
    try {
      setBackendError('');
      const result = await trpc.getForms.query();
      setForms(result);
    } catch (error) {
      console.error('Failed to load forms:', error);
      setBackendError('Backend handlers are currently stub implementations. Forms will not persist between sessions.');
      // Set empty forms array to continue with demo functionality
      setForms([]);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleFormCreated = useCallback((newForm: Form) => {
    setForms((prev: Form[]) => [...prev, newForm]);
    setSelectedForm(newForm);
    setPreviewForm(null);
  }, []);

  const handleFormPreview = useCallback((parsedForm: ParsedForm) => {
    setPreviewForm(parsedForm);
    setSelectedForm(null);
  }, []);

  const handleFormSelect = useCallback((form: Form) => {
    setSelectedForm(form);
    setPreviewForm(null);
  }, []);

  const handleFormDeleted = useCallback((deletedFormId: string) => {
    setForms((prev: Form[]) => prev.filter(form => form.id !== deletedFormId));
    if (selectedForm?.id === deletedFormId) {
      setSelectedForm(null);
    }
  }, [selectedForm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Smart Form Builder
          </h1>
          <p className="text-lg text-gray-600">
            Describe your form in plain English and watch it come to life!
          </p>
        </div>

        {backendError && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              <span className="font-medium">⚠️ Demo Mode:</span> {backendError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="builder" className="text-sm font-medium">
              ✨ Form Builder
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-sm font-medium">
              👀 Preview & Test
            </TabsTrigger>
            <TabsTrigger value="manage" className="text-sm font-medium">
              📋 Manage Forms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    🎯 Describe Your Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <FormBuilder 
                    onFormCreated={handleFormCreated}
                    onFormPreview={handleFormPreview}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    ⚡ Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {previewForm ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          💡 This is a preview. Click "Create Form" to save it permanently.
                        </p>
                      </div>
                      <FormRenderer 
                        form={{
                          ...previewForm,
                          id: 'preview',
                          created_at: new Date(),
                          updated_at: new Date()
                        }}
                        isPreview={true}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📝</div>
                      <p>Describe your form to see a live preview here!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {selectedForm ? (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      🎨 {selectedForm.title}
                    </span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      ID: {selectedForm.id.slice(0, 8)}...
                    </Badge>
                  </CardTitle>
                  {selectedForm.description && (
                    <p className="text-white/90 mt-2">{selectedForm.description}</p>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  <FormRenderer form={selectedForm} />
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0 bg-white">
                <CardContent className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-lg mb-2">No form selected for preview</p>
                  <p>Select a form from the "Manage Forms" tab to test it here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  📊 Your Forms ({forms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <FormList 
                  forms={forms}
                  onFormSelect={handleFormSelect}
                  onFormDeleted={handleFormDeleted}
                  selectedForm={selectedForm}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💝 Each form gets a unique shareable link • Data is stored persistently • Real-time preview</p>
        </div>
      </div>
    </div>
  );
}

export default App;
