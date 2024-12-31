import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, BookOpen, Calendar, FileText, Link2, Upload } from 'lucide-react';

const credentialSchema = z.object({
  type: z.enum(['certification', 'license']),
  title: z.string().min(2, 'Title is required'),
  issuingOrganization: z.string().min(2, 'Issuing organization is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  verificationUrl: z.string().url().optional(),
  description: z.string().optional(),
  documentUrl: z.string().optional(),
});

const publicationSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  authors: z.string().min(2, 'Authors are required'),
  publicationType: z.enum([
    'journal_article',
    'conference_paper',
    'book_chapter',
    'technical_report',
    'white_paper'
  ]),
  publishedIn: z.string().min(2, 'Publication venue is required'),
  publicationDate: z.string().min(1, 'Publication date is required'),
  doi: z.string().optional(),
  url: z.string().url().optional(),
  abstract: z.string().optional(),
  documentUrl: z.string().optional(),
});

type CredentialFormValues = z.infer<typeof credentialSchema>;
type PublicationFormValues = z.infer<typeof publicationSchema>;

export default function CredentialsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('credentials');

  const credentialForm = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      type: 'certification',
    }
  });

  const publicationForm = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      publicationType: 'journal_article',
    }
  });

  const { data: credentials = [], isLoading: isLoadingCredentials } = useQuery({
    queryKey: ['/api/user/credentials'],
  });

  const { data: publications = [], isLoading: isLoadingPublications } = useQuery({
    queryKey: ['/api/user/publications'],
  });

  const addCredentialMutation = useMutation({
    mutationFn: async (data: CredentialFormValues) => {
      const response = await fetch('/api/user/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add credential');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/credentials'] });
      toast({
        title: "Credential Added",
        description: "Your credential has been successfully added.",
      });
      credentialForm.reset();
    },
  });

  const addPublicationMutation = useMutation({
    mutationFn: async (data: PublicationFormValues) => {
      const response = await fetch('/api/user/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add publication');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/publications'] });
      toast({
        title: "Publication Added",
        description: "Your publication has been successfully added.",
      });
      publicationForm.reset();
    },
  });

  const onSubmitCredential = (data: CredentialFormValues) => {
    addCredentialMutation.mutate(data);
  };

  const onSubmitPublication = (data: PublicationFormValues) => {
    addPublicationMutation.mutate(data);
  };

  if (isLoadingCredentials || isLoadingPublications) {
    return null; // Parent component already shows loading state
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Professional Credentials & Publications</CardTitle>
        <CardDescription>
          Manage your certifications, licenses, and academic publications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
          </TabsList>

          <TabsContent value="credentials" className="space-y-8">
            <div className="grid gap-6">
              {credentials.map((credential: any) => (
                <Card key={credential.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Award className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{credential.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {credential.issuingOrganization}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Issued: {new Date(credential.issueDate).toLocaleDateString()}</span>
                          {credential.expiryDate && (
                            <span>| Expires: {new Date(credential.expiryDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {credential.verificationUrl && (
                          <a 
                            href={credential.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Link2 className="h-4 w-4" />
                            Verify Credential
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Form {...credentialForm}>
              <form onSubmit={credentialForm.handleSubmit(onSubmitCredential)} className="space-y-6">
                <FormField
                  control={credentialForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select credential type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="certification">Certification</SelectItem>
                          <SelectItem value="license">License</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={credentialForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={credentialForm.control}
                  name="issuingOrganization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing Organization</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={credentialForm.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={credentialForm.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={credentialForm.control}
                  name="documentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Document</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="file" {...field} />
                          <Button type="button" variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={addCredentialMutation.isPending}
                  className="w-full"
                >
                  {addCredentialMutation.isPending ? 'Adding...' : 'Add Credential'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="publications" className="space-y-8">
            <div className="grid gap-6">
              {publications.map((publication: any) => (
                <Card key={publication.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <BookOpen className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{publication.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {publication.authors}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {publication.publishedIn} ({new Date(publication.publicationDate).getFullYear()})
                        </p>
                        {publication.doi && (
                          <a 
                            href={`https://doi.org/${publication.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Link2 className="h-4 w-4" />
                            DOI: {publication.doi}
                          </a>
                        )}
                      </div>
                      {publication.citations > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {publication.citations} citations
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Form {...publicationForm}>
              <form onSubmit={publicationForm.handleSubmit(onSubmitPublication)} className="space-y-6">
                <FormField
                  control={publicationForm.control}
                  name="publicationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select publication type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="journal_article">Journal Article</SelectItem>
                          <SelectItem value="conference_paper">Conference Paper</SelectItem>
                          <SelectItem value="book_chapter">Book Chapter</SelectItem>
                          <SelectItem value="technical_report">Technical Report</SelectItem>
                          <SelectItem value="white_paper">White Paper</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={publicationForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={publicationForm.control}
                  name="authors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Authors (comma separated)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={publicationForm.control}
                  name="abstract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abstract</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={publicationForm.control}
                    name="publishedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Published In</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={publicationForm.control}
                    name="publicationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publication Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={publicationForm.control}
                  name="doi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DOI (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="10.1000/xyz123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={addPublicationMutation.isPending}
                  className="w-full"
                >
                  {addPublicationMutation.isPending ? 'Adding...' : 'Add Publication'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}