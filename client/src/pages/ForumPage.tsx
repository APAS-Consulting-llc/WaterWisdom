import { useState } from 'react';
import { useForum } from '@/hooks/use-forum';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MessageCircle, ThumbsUp, HeartHandshake, BookOpen, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { ForumPost, ForumComment } from '@db/schema';
import { motion, AnimatePresence } from 'framer-motion';

const createPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  tags: z.string().optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

type PostWithDetails = ForumPost & {
  reactions?: Record<string, number>;
  comments?: ForumComment[];
};

export default function ForumPage() {
  const { posts, loadingPosts, createPost, createComment, addReaction } = useForum();
  const { user } = useUser();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
  });

  const commentForm = useForm<z.infer<typeof createCommentSchema>>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
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

  const handleComment = async (postId: number, values: z.infer<typeof createCommentSchema>) => {
    try {
      await createComment({
        content: values.content,
        postId,
      });
      commentForm.reset();
      toast({
        title: 'Success',
        description: 'Your comment has been added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment.',
        variant: 'destructive',
      });
    }
  };

  const handleReaction = async (postId: number, type: 'like' | 'helpful' | 'insightful') => {
    try {
      await addReaction({ type, postId });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction.',
        variant: 'destructive',
      });
    }
  };

  if (loadingPosts) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Water Industry Q&A Forum</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Ask a Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="What would you like to know about water industry?" />
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
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide more context about your question..."
                          className="min-h-[150px] bg-background text-foreground"
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
                        <Input {...field} placeholder="e.g., water-treatment, conservation" className="bg-background text-foreground" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Post Question</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {(posts as PostWithDetails[]).map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="transition-all duration-200"
            >
              <Card className="hover:shadow-lg border border-border">
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
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                        Pinned
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id, 'like')}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>{post.reactions?.like || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id, 'helpful')}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <HeartHandshake className="h-4 w-4 mr-1" />
                      <span>{post.reactions?.helpful || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post.id, 'insightful')}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{post.reactions?.insightful || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{post.comments?.length || 0} comments</span>
                    </Button>
                  </div>
                </CardContent>
                {expandedPostId === post.id && (
                  <CardFooter className="flex flex-col space-y-4 pt-4">
                    <AnimatePresence>
                      {post.comments?.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="w-full"
                        >
                          <Card className="w-full bg-muted/5 border border-border">
                            <CardContent className="pt-4">
                              <p className="text-foreground">{comment.content}</p>
                              <div className="mt-2 text-xs text-muted-foreground">
                                <span>{user?.id === comment.authorId ? 'you' : 'Anonymous'}</span>
                                <span className="mx-2">•</span>
                                <span>{format(new Date(comment.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Form {...commentForm}>
                      <form
                        onSubmit={commentForm.handleSubmit((values) => handleComment(post.id, values))}
                        className="w-full flex gap-2"
                      >
                        <FormField
                          control={commentForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Add a comment..."
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </Form>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}