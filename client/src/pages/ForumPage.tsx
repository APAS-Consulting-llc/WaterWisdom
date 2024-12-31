import { useState } from 'react';
import { useForum } from '@/hooks/use-forum';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MessageCircle, ThumbsUp, HeartHandshake, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { ForumPost, ForumComment, ForumReaction } from '@db/schema';

const createPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  tags: z.string().optional(),
});

type PostWithDetails = ForumPost & {
  reactions?: Record<string, number>;
  comments?: ForumComment[];
};

export default function ForumPage() {
  const { posts, loadingPosts, createPost } = useForum();
  const { user } = useUser();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    try {
      await createPost({
        ...values,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : undefined,
      });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: 'Success',
        description: 'Your post has been created.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post.',
        variant: 'destructive',
      });
    }
  };

  if (loadingPosts) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Discussion</DialogTitle>
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
                        <Input {...field} placeholder="What would you like to discuss?" />
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
                          placeholder="Share your thoughts, questions, or insights..."
                          className="min-h-[150px]"
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
                        <Input {...field} placeholder="e.g., water-treatment, conservation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Create Discussion</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {(posts as PostWithDetails[]).map((post) => (
          <Card key={post.id} className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Posted by {user?.id === post.authorId ? 'you' : 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Unknown date'}</span>
                  </div>
                </div>
                {post.pinned && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    Pinned
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.reactions?.like || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HeartHandshake className="h-4 w-4" />
                  <span>{post.reactions?.helpful || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{post.reactions?.insightful || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}