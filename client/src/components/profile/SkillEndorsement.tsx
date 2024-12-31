import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Shield, ThumbsUp, UserCheck } from 'lucide-react';

const skillSchema = z.object({
  subject: z.string().min(2, 'Skill name is required'),
  level: z.number().min(0).max(100),
  description: z.string().optional(),
});

const endorsementSchema = z.object({
  skillId: z.number(),
  expertise: z.enum(['beginner', 'intermediate', 'expert']),
  comment: z.string().optional(),
});

type SkillFormValues = z.infer<typeof skillSchema>;
type EndorsementFormValues = z.infer<typeof endorsementSchema>;

export default function SkillEndorsement({ userId }: { userId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);

  const skillForm = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      level: 50,
    },
  });

  const endorsementForm = useForm<EndorsementFormValues>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      expertise: 'intermediate',
    },
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['/api/user/skills', userId],
  });

  const addSkillMutation = useMutation({
    mutationFn: async (data: SkillFormValues) => {
      const response = await fetch('/api/user/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add skill');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/skills', userId] });
      toast({
        title: "Skill Added",
        description: "Your skill has been successfully added.",
      });
      skillForm.reset();
    },
  });

  const addEndorsementMutation = useMutation({
    mutationFn: async (data: EndorsementFormValues) => {
      const response = await fetch('/api/user/skills/endorse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, endorsedUserId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add endorsement');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/skills', userId] });
      toast({
        title: "Endorsement Added",
        description: "Your endorsement has been successfully added.",
      });
      endorsementForm.reset();
      setSelectedSkill(null);
    },
  });

  const onSubmitSkill = (data: SkillFormValues) => {
    addSkillMutation.mutate(data);
  };

  const onSubmitEndorsement = (data: EndorsementFormValues) => {
    addEndorsementMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skills & Endorsements</CardTitle>
          <CardDescription>
            Add your skills and get endorsed by peers in the water industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Display existing skills */}
            <div className="grid gap-4">
              {skills.map((skill: any) => (
                <Card key={skill.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{skill.subject}</h3>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {skill.endorsements?.slice(0, 3).map((endorsement: any) => (
                              <div
                                key={endorsement.id}
                                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background"
                              >
                                <UserCheck className="h-4 w-4 text-primary" />
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {skill.endorsementCount} endorsements
                          </span>
                        </div>
                      </div>
                      {skill.verified && (
                        <Shield className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    {!selectedSkill && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setSelectedSkill(skill.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Endorse
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add new skill form */}
            <Form {...skillForm}>
              <form onSubmit={skillForm.handleSubmit(onSubmitSkill)} className="space-y-4">
                <FormField
                  control={skillForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Water Treatment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={skillForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe your experience with this skill"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={addSkillMutation.isPending}
                >
                  {addSkillMutation.isPending ? 'Adding...' : 'Add Skill'}
                </Button>
              </form>
            </Form>

            {/* Endorsement form */}
            {selectedSkill && (
              <Form {...endorsementForm}>
                <form
                  onSubmit={endorsementForm.handleSubmit(onSubmitEndorsement)}
                  className="space-y-4"
                >
                  <FormField
                    control={endorsementForm.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Expertise Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your expertise level" />
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
                    control={endorsementForm.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comment (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add a comment about your endorsement"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={addEndorsementMutation.isPending}
                    >
                      {addEndorsementMutation.isPending ? 'Adding...' : 'Submit Endorsement'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedSkill(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
