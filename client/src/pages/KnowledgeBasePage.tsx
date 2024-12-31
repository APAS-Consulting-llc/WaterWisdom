import { useState } from 'react';
import { useKnowledge } from '@/hooks/use-knowledge';
import { useCollaboration } from '@/hooks/use-collaboration';
import { useUser } from '@/hooks/use-user';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ThumbsUp, History, Award, Users, Video, Image as ImageIcon, Upload, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from 'react-share';

const CATEGORIES = [
  { value: 'water_treatment', label: 'Water Treatment' },
  { value: 'wastewater', label: 'Wastewater' },
  { value: 'stormwater', label: 'Stormwater' },
  { value: 'climate_change', label: 'Climate Change' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'emerging_contaminants', label: 'Emerging Contaminants' },
  { value: 'sea_level_rise', label: 'Sea Level Rise' }
];

const createEntrySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category: z.enum([
    'water_treatment',
    'wastewater',
    'stormwater',
    'climate_change',
    'blockchain',
    'sustainability',
    'infrastructure',
    'emerging_contaminants',
    'sea_level_rise'
  ]),
  tags: z.string().optional(),
  mediaType: z.enum(['text', 'image', 'video', 'loom']).default('text'),
  mediaUrl: z.string().optional(),
});

function ShareButtons({ entry }: { entry: any }) {
  const shareUrl = `${window.location.origin}/knowledge/${entry.id}`;
  const title = entry.title;
  const iconSize = 32;
  const round = true;

  return (
    <div className="flex space-x-2 items-center">
      <FacebookShareButton url={shareUrl} quote={title}>
        <FacebookIcon size={iconSize} round={round} />
      </FacebookShareButton>

      <TwitterShareButton url={shareUrl} title={title}>
        <TwitterIcon size={iconSize} round={round} />
      </TwitterShareButton>

      <LinkedinShareButton url={shareUrl} title={title}>
        <LinkedinIcon size={iconSize} round={round} />
      </LinkedinShareButton>

      <WhatsappShareButton url={shareUrl} title={title}>
        <WhatsappIcon size={iconSize} round={round} />
      </WhatsappShareButton>

      <EmailShareButton url={shareUrl} subject={title}>
        <EmailIcon size={iconSize} round={round} />
      </EmailShareButton>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const { entries, loadingEntries, createEntry, vote } = useKnowledge();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { isConnected, collaborators, sendEdit, updateCursor } = useCollaboration(selectedEntryId || 0);

  const form = useForm<z.infer<typeof createEntrySchema>>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'water_treatment',
      tags: '',
      mediaType: 'text',
      mediaUrl: '',
    },
  });

  const handleFileUpload = async (file: File, type: 'image' | 'video') => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof createEntrySchema>) => {
    try {
      await createEntry({
        ...values,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : undefined,
      });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Your knowledge entry has been created.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create knowledge entry.',
        variant: 'destructive',
      });
    }
  };

  const filteredEntries = selectedCategory
    ? entries.filter(entry => entry.category === selectedCategory)
    : entries;

  if (loadingEntries) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Expert-verified water industry knowledge and best practices
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{collaborators.size} active collaborators</span>
            </div>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Award className="mr-2 h-4 w-4" />
                Share Knowledge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Your Knowledge</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="A descriptive title for your knowledge entry" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mediaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text Only</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video (MP4, up to 50MB)</SelectItem>
                            <SelectItem value="loom">Loom Recording</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch('mediaType') !== 'text' && (
                    <FormField
                      control={form.control}
                      name="mediaUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch('mediaType') === 'image' ? 'Upload Image' : 'Upload Video'}
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept={form.watch('mediaType') === 'image' ? 'image/*' : 'video/*'}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const url = await handleFileUpload(
                                        file,
                                        form.watch('mediaType') === 'image' ? 'image' : 'video'
                                      );
                                      field.onChange(url);
                                      toast({
                                        title: 'Success',
                                        description: 'File uploaded successfully!',
                                      });
                                    } catch (error) {
                                      // Error is already handled in handleFileUpload
                                    }
                                  }
                                }}
                                className="flex-1"
                                disabled={uploading}
                              />
                              {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Share your expertise and insights..."
                            className="min-h-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., conservation, technology" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Share Knowledge'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger
            value="all"
            onClick={() => setSelectedCategory(null)}
          >
            All Topics
          </TabsTrigger>
          {CATEGORIES.map(category => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card
                    className={`relative h-full flex flex-col ${
                      selectedEntryId === entry.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedEntryId(entry.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{entry.title}</CardTitle>
                          <CardDescription>
                            Category: {CATEGORIES.find(c => c.value === entry.category)?.label}
                            {entry.tags && (
                              <span className="ml-2">
                                Tags: {(entry.tags as string[]).join(', ')}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        {entry.expertVerified && (
                          <Award className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {entry.mediaType === 'video' && entry.mediaUrl && (
                        <div className="relative mb-4 pt-[56.25%]">
                          <video
                            className="absolute top-0 left-0 w-full h-full rounded-lg object-cover"
                            src={entry.mediaUrl}
                            controls
                          />
                        </div>
                      )}
                      {entry.mediaType === 'image' && entry.mediaUrl && (
                        <div className="mb-4">
                          <img
                            src={entry.mediaUrl}
                            alt={entry.title}
                            className="w-full rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="prose prose-slate dark:prose-invert max-w-none">
                        {entry.content}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t">
                      <div className="w-full space-y-4">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              <span>{entry.score || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <History className="h-4 w-4" />
                              <span>{entry.viewCount || 0} views</span>
                            </Button>
                          </div>
                          <span>
                            Updated {format(new Date(entry.updatedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <ShareButtons entry={entry} />
                          <Button variant="ghost" size="sm" className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
        {CATEGORIES.map(category => (
          <TabsContent key={category.value} value={category.value} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredEntries.filter(entry => entry.category === category.value).map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card
                      className={`relative h-full flex flex-col ${
                        selectedEntryId === entry.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedEntryId(entry.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{entry.title}</CardTitle>
                            <CardDescription>
                              Category: {CATEGORIES.find(c => c.value === entry.category)?.label}
                              {entry.tags && (
                                <span className="ml-2">
                                  Tags: {(entry.tags as string[]).join(', ')}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          {entry.expertVerified && (
                            <Award className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {entry.mediaType === 'video' && entry.mediaUrl && (
                          <div className="relative mb-4 pt-[56.25%]">
                            <video
                              className="absolute top-0 left-0 w-full h-full rounded-lg object-cover"
                              src={entry.mediaUrl}
                              controls
                            />
                          </div>
                        )}
                        {entry.mediaType === 'image' && entry.mediaUrl && (
                          <div className="mb-4">
                            <img
                              src={entry.mediaUrl}
                              alt={entry.title}
                              className="w-full rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                          {entry.content}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t">
                        <div className="w-full space-y-4">
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{entry.score || 0}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <History className="h-4 w-4" />
                                <span>{entry.viewCount || 0} views</span>
                              </Button>
                            </div>
                            <span>
                              Updated {format(new Date(entry.updatedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <ShareButtons entry={entry} />
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}