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
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ThumbsUp, History, Award, Users } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const createEntrySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
});

const voteSchema = z.object({
  expertise: z.string().min(1, 'Please specify your area of expertise'),
  comment: z.string().optional(),
});

export default function KnowledgeBasePage() {
  const { entries, loadingEntries, createEntry, vote } = useKnowledge();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);

  const { isConnected, collaborators, sendEdit, updateCursor } = useCollaboration(selectedEntryId || 0);

  const form = useForm<z.infer<typeof createEntrySchema>>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      title: '',
      content: '',
      category: '',
      tags: '',
    },
  });

  const voteForm = useForm<z.infer<typeof voteSchema>>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      expertise: '',
      comment: '',
    },
  });

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

  const handleVote = async (entryId: number, values: z.infer<typeof voteSchema>) => {
    try {
      await vote({
        id: entryId,
        vote: {
          value: 1,
          ...values,
        },
      });
      setSelectedEntry(null);
      voteForm.reset();
      toast({
        title: 'Success',
        description: 'Your vote has been recorded.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to vote on entry.',
        variant: 'destructive',
      });
    }
  };

  if (loadingEntries) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
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
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Water Treatment" />
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
                    <Button type="submit">Share Knowledge</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className={`relative ${selectedEntryId === entry.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedEntryId(entry.id)}
              >
                {selectedEntryId === entry.id && Array.from(collaborators.values()).map((collaborator) => (
                  collaborator.cursor && (
                    <div
                      key={collaborator.userId}
                      className="absolute w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        left: `${collaborator.cursor.ch}ch`,
                        top: `${collaborator.cursor.line * 1.5}em`
                      }}
                    >
                      <div className="absolute top-4 left-2 bg-blue-500 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                        {collaborator.username}
                      </div>
                    </div>
                  )
                ))}

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{entry.title}</CardTitle>
                      <CardDescription>
                        Category: {entry.category}
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
                <CardContent>
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none"
                    onMouseMove={(e) => {
                      if (selectedEntryId === entry.id) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const line = Math.floor((e.clientY - rect.top) / 24);
                        const ch = Math.floor((e.clientX - rect.left) / 8);
                        updateCursor({ line, ch });
                      }
                    }}
                  >
                    {entry.content}
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <Dialog
                      open={selectedEntry === entry.id}
                      onOpenChange={(open) => setSelectedEntry(open ? entry.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          <span>{entry.score || 0} votes</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Vote with Expertise</DialogTitle>
                        </DialogHeader>
                        <Form {...voteForm}>
                          <form
                            onSubmit={voteForm.handleSubmit((values) =>
                              handleVote(entry.id, values)
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={voteForm.control}
                              name="expertise"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Area of Expertise</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="e.g., Water Treatment Engineer"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={voteForm.control}
                              name="comment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Comment (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Add a comment about this entry..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end">
                              <Button type="submit">Submit Vote</Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm">
                      <History className="h-4 w-4 mr-1" />
                      <span>{entry.viewCount || 0} views</span>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>Last updated: {format(new Date(entry.updatedAt), 'MMM d, yyyy')}</span>
                    {collaborators.size > 0 && selectedEntryId === entry.id && (
                      <span className="ml-4">
                        {collaborators.size} {collaborators.size === 1 ? 'person' : 'people'} viewing
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}