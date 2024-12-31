import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const portfolioSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title is required'),
  avatar: z.string().optional(),
  summary: z.string().min(50, 'Please provide a detailed summary (at least 50 characters)'),
  expertise: z.string().min(10, 'Please list your areas of expertise'),
  certifications: z.string(),
  experience: z.string().min(20, 'Please provide your work experience'),
  education: z.string(),
  achievements: z.string(),
  contact: z.string().email('Please provide a valid email address'),
});

type PortfolioFormValues = z.infer<typeof portfolioSchema>;

export default function PortfolioGenerator() {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioFormValues | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      fullName: '',
      title: '',
      avatar: '',
      summary: '',
      expertise: '',
      certifications: '',
      experience: '',
      education: '',
      achievements: '',
      contact: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PortfolioFormValues) => {
    try {
      setPortfolioData({ ...data, avatar: avatarPreview || '' });
      setPreviewMode(true);
      toast({
        title: "Portfolio Generated",
        description: "Your professional portfolio has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate portfolio. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (previewMode && portfolioData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-scale opacity-10" />
          <CardHeader className="relative z-10 text-center border-b pb-8">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                {portfolioData.avatar ? (
                  <AvatarImage src={portfolioData.avatar} alt={portfolioData.fullName} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {portfolioData.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">{portfolioData.fullName}</h1>
                <p className="text-xl text-blue-600 mt-2">{portfolioData.title}</p>
              </div>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setPreviewMode(false)}
              >
                Edit Portfolio
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pt-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{portfolioData.summary}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {portfolioData.expertise.split(',').map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>

            {portfolioData.certifications && (
              <section className="bg-gradient-to-r from-blue-50/50 to-transparent p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-800 mb-3">Certifications</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioData.certifications.split(',').map((cert, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <span className="text-gray-700">{cert.trim()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Professional Experience</h2>
              <div className="prose prose-blue max-w-none">
                {portfolioData.experience.split('\n').map((exp, index) => (
                  <p key={index} className="text-gray-700 mb-4">{exp}</p>
                ))}
              </div>
            </section>

            {portfolioData.education && (
              <section className="bg-gradient-to-r from-transparent via-blue-50/30 to-transparent p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-800 mb-3">Education</h2>
                <div className="prose prose-blue max-w-none">
                  {portfolioData.education.split('\n').map((edu, index) => (
                    <p key={index} className="text-gray-700">{edu}</p>
                  ))}
                </div>
              </section>
            )}

            {portfolioData.achievements && (
              <section>
                <h2 className="text-xl font-semibold text-blue-800 mb-3">Key Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolioData.achievements.split(',').map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-blue-400 mt-2" />
                      <p className="text-gray-700">{achievement.trim()}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-blue-50 to-transparent mt-8">
            <div className="w-full text-center">
              <p className="text-blue-600 font-medium">{portfolioData.contact}</p>
              <p className="text-sm text-blue-400 mt-2">Generated by One Water.AI</p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <CardTitle>Generate Your Professional Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <Avatar className="w-24 h-24 mb-4">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview" />
                ) : (
                  <AvatarFallback>Upload</AvatarFallback>
                )}
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="max-w-xs"
              />
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Water Resource Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Summary</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A brief overview of your professional background and expertise..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas of Expertise (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Water Treatment, Quality Analysis, Resource Management" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certifications (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Professional Engineer, Water Quality Specialist" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Experience</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your work experience..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your educational background..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="achievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Achievements (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="Led water conservation project, Reduced treatment costs by 25%" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-gradient-scale hover:opacity-90 transition-opacity">
              Generate Portfolio
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}