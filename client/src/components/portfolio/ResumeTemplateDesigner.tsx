import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from '@tanstack/react-query';

const resumeSchema = z.object({
  template: z.enum(['modern', 'classic', 'minimalist', 'technical']),
  theme: z.enum(['water-treatment', 'environmental', 'engineering', 'research']),
  personalInfo: z.object({
    name: z.string().min(2, 'Name is required'),
    title: z.string().min(2, 'Title is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    location: z.string().optional(),
  }),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string(),
    description: z.string(),
  })).min(1, 'At least one experience entry is required'),
  skills: z.array(z.string()).min(3, 'At least 3 skills are required'),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
  })),
  certifications: z.array(z.string()),
});

type ResumeFormValues = z.infer<typeof resumeSchema>;

const INDUSTRY_THEMES = {
  'water-treatment': {
    primary: 'hsl(200, 85%, 45%)',
    secondary: 'hsl(200, 65%, 90%)',
    accent: 'hsl(200, 75%, 35%)',
  },
  'environmental': {
    primary: 'hsl(150, 60%, 40%)',
    secondary: 'hsl(150, 50%, 95%)',
    accent: 'hsl(150, 70%, 30%)',
  },
  'engineering': {
    primary: 'hsl(240, 50%, 45%)',
    secondary: 'hsl(240, 40%, 95%)',
    accent: 'hsl(240, 60%, 35%)',
  },
  'research': {
    primary: 'hsl(280, 45%, 45%)',
    secondary: 'hsl(280, 35%, 95%)',
    accent: 'hsl(280, 55%, 35%)',
  },
};

const TEMPLATES = {
  modern: {
    name: 'Modern',
    description: 'Clean and contemporary design with a focus on visual hierarchy',
  },
  classic: {
    name: 'Classic',
    description: 'Traditional resume layout trusted by industry professionals',
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Simple and elegant design that lets your experience shine',
  },
  technical: {
    name: 'Technical',
    description: 'Specialized layout for highlighting technical skills and certifications',
  },
};

export default function ResumeTemplateDesigner() {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof INDUSTRY_THEMES>('water-treatment');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES>('modern');
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      template: 'modern',
      theme: 'water-treatment',
      personalInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
      },
      experience: [{
        title: '',
        company: '',
        duration: '',
        description: '',
      }],
      skills: [],
      education: [{
        degree: '',
        institution: '',
        year: '',
      }],
      certifications: [],
    },
  });

  const generateAIContentMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      return response.json();
    },
  });

  const handleThemeChange = (theme: keyof typeof INDUSTRY_THEMES) => {
    setSelectedTheme(theme);
    form.setValue('theme', theme);
  };

  const handleTemplateChange = (template: keyof typeof TEMPLATES) => {
    setSelectedTemplate(template);
    form.setValue('template', template);
  };

  const onSubmit = async (data: ResumeFormValues) => {
    try {
      // Generate AI-enhanced content suggestions
      const suggestions = await generateAIContentMutation.mutateAsync(
        `Enhance this water industry professional's resume content maintaining factual accuracy:
         Role: ${data.personalInfo.title}
         Experience: ${data.experience.map(e => e.description).join('\n')}`
      );

      // Update form with AI suggestions
      // ... implementation

      setPreviewMode(true);
      toast({
        title: "Resume Generated",
        description: "Your professional resume has been created with AI-enhanced content.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AI-Powered Resume Designer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(TEMPLATES).map(([key, template]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === key 
                          ? 'ring-2 ring-primary' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateChange(key as keyof typeof TEMPLATES)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(INDUSTRY_THEMES).map(([key, theme]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all ${
                        selectedTheme === key 
                          ? 'ring-2 ring-primary' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleThemeChange(key as keyof typeof INDUSTRY_THEMES)}
                    >
                      <CardContent className="p-4">
                        <div
                          className="w-full h-2 rounded mb-2"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <h4 className="font-medium capitalize">
                          {key.replace('-', ' ')}
                        </h4>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Experience Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Professional Experience</h3>
                  {form.watch('experience').map((_, index) => (
                    <div key={index} className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`experience.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`experience.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const experience = form.getValues('experience');
                      form.setValue('experience', [
                        ...experience,
                        { title: '', company: '', duration: '', description: '' },
                      ]);
                    }}
                  >
                    Add Experience
                  </Button>
                </div>

                <Button 
                  type="submit"
                  className="w-full"
                  disabled={generateAIContentMutation.isPending}
                >
                  {generateAIContentMutation.isPending 
                    ? 'Generating AI Content...' 
                    : 'Generate Resume'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
