import { useState } from 'react';
import { useQuiz } from '@/hooks/use-quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { QuestionType, DifficultyLevel } from '@db/schema';

const questionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  difficulty: z.enum(['beginner', 'intermediate', 'expert']),
  category: z.string().min(1, "Category is required"),
  question: z.string().min(10, "Question must be at least 10 characters"),
  options: z.string().optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().min(20, "Please provide a detailed explanation (minimum 20 characters)")
});

export default function SubmitQuestionPage() {
  const { createQuestion } = useQuiz();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: 'multiple_choice',
      difficulty: 'beginner',
      category: '',
      question: '',
      options: '',
      correctAnswer: '',
      explanation: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof questionSchema>) => {
    try {
      const questionData = {
        ...values,
        options: values.type === 'multiple_choice' ? 
          values.options?.split('\n').filter(Boolean) : 
          undefined
      };

      await createQuestion(questionData);
      form.reset();
      toast({
        title: 'Success',
        description: 'Thank you for submitting your question! It will be reviewed by our moderators.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit question. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Submit a New Question</CardTitle>
          <p className="text-muted-foreground">
            Share your water sector knowledge by submitting a question. All submissions will be reviewed
            before being added to the quiz pool.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input {...field} placeholder="e.g., Water Treatment, Conservation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter your question" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('type') === 'multiple_choice' && (
                <FormField
                  control={form.control}
                  name="options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Options (one per line)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter each option on a new line" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the correct answer" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Provide a detailed explanation of why this answer is correct and any additional context that would help users learn"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">Submit Question</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
