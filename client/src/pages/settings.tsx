import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Clock, Mail, TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  enabled: z.boolean(),
  preferredQuizTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  timezone: z.string(),
  // Newsletter preferences
  newsletterEnabled: z.boolean(),
  newsletterFrequency: z.enum(['daily', 'weekly', 'monthly']),
  newsletterTopics: z.array(z.string()),
});

const availableTopics = [
  'water treatment',
  'sustainability',
  'management',
  'technology',
  'regulations',
  'conservation',
  'quality control',
  'infrastructure',
];

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    user?.newsletterTopics as string[] || ['water treatment', 'sustainability', 'management']
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: user?.phoneNumber || "",
      enabled: user?.smsNotificationsEnabled || false,
      preferredQuizTime: user?.preferredQuizTime || "10:00",
      timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      newsletterEnabled: user?.newsletterEnabled || true,
      newsletterFrequency: (user?.newsletterFrequency as 'daily' | 'weekly' | 'monthly') || 'weekly',
      newsletterTopics: selectedTopics,
    },
  });

  const updatePreferences = async (data: z.infer<typeof formSchema>) => {
    const response = await fetch("/api/user/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  };

  const mutation = useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Success",
        description: "Your preferences have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate({ ...data, newsletterTopics: selectedTopics });
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <p className="text-lg text-gray-600">Please log in to access settings</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="space-y-6">
        {/* SMS Notifications Section */}
        <div>
          <h3 className="text-lg font-medium">Quiz SMS Notifications</h3>
          <p className="text-sm text-gray-500">
            Receive daily water quiz questions via SMS at your preferred time.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your phone number to receive daily quiz questions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredQuizTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Quiz Time</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Choose when you'd like to receive your daily quiz (24-hour format).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Quiz Notifications
                    </FormLabel>
                    <FormDescription>
                      Get a daily water quiz question delivered to your phone at your preferred time.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      {field.value ? (
                        <Bell className="w-4 h-4 text-green-500" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Newsletter Settings Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Newsletter Preferences</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="newsletterEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable Newsletter
                        </FormLabel>
                        <FormDescription>
                          Receive personalized water industry insights and updates.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          {field.value ? (
                            <Mail className="w-4 h-4 text-green-500" />
                          ) : (
                            <Mail className="w-4 h-4 text-gray-400" />
                          )}
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newsletterFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Newsletter Frequency</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          {['daily', 'weekly', 'monthly'].map((frequency) => (
                            <Button
                              key={frequency}
                              type="button"
                              variant={field.value === frequency ? "default" : "outline"}
                              onClick={() => field.onChange(frequency)}
                              className="capitalize"
                            >
                              {frequency}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Choose how often you'd like to receive the newsletter.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Topics of Interest</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant={selectedTopics.includes(topic) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleTopic(topic)}
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {topic.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Select topics you're interested in to receive personalized content.
                  </FormDescription>
                </FormItem>
              </div>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save preferences"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}