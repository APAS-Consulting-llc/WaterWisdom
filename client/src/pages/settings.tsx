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
  newsletterFrequency: z.enum(['hourly', 'twice_daily', 'daily', 'weekly']),
  newsletterTopics: z.array(z.string()),
  // News notification preferences
  newsNotificationsEnabled: z.boolean(),
  newsDeliveryMethod: z.enum(['email', 'sms', 'both']),
  newsFrequency: z.enum(['hourly', 'twice_daily', 'daily']),
  newsTopics: z.array(z.string()),
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

const newsFrequencyOptions = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'twice_daily', label: 'Twice a Day' },
  { value: 'daily', label: 'Once a Day' },
];

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    user?.newsletterTopics as string[] || ['water treatment', 'sustainability', 'management']
  );
  const [selectedNewsTopics, setSelectedNewsTopics] = useState<string[]>(
    user?.newsTopics as string[] || ['water treatment', 'sustainability']
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: user?.phoneNumber || "",
      enabled: user?.smsNotificationsEnabled || false,
      preferredQuizTime: user?.preferredQuizTime || "10:00",
      timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      newsletterEnabled: user?.newsletterEnabled || true,
      newsletterFrequency: (user?.newsletterFrequency as 'hourly' | 'twice_daily' | 'daily' | 'weekly') || 'daily',
      newsletterTopics: selectedTopics,
      newsNotificationsEnabled: user?.newsNotificationsEnabled || false,
      newsDeliveryMethod: user?.newsDeliveryMethod || 'email',
      newsFrequency: user?.newsFrequency || 'daily',
      newsTopics: selectedNewsTopics,
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
    mutation.mutate({
      ...data,
      newsletterTopics: selectedTopics,
      newsTopics: selectedNewsTopics
    });
  };

  const toggleTopic = (topic: string, type: 'newsletter' | 'news') => {
    if (type === 'newsletter') {
      setSelectedTopics(prev => 
        prev.includes(topic)
          ? prev.filter(t => t !== topic)
          : [...prev, topic]
      );
    } else {
      setSelectedNewsTopics(prev => 
        prev.includes(topic)
          ? prev.filter(t => t !== topic)
          : [...prev, topic]
      );
    }
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

            {/* News Notifications Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">News Notifications</h3>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="newsNotificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Enable News Notifications
                        </FormLabel>
                        <FormDescription>
                          Receive water industry news updates via email or SMS.
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
                  name="newsDeliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Method</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          {['email', 'sms', 'both'].map((method) => (
                            <Button
                              key={method}
                              type="button"
                              variant={field.value === method ? "default" : "outline"}
                              onClick={() => field.onChange(method)}
                              className="capitalize"
                            >
                              {method}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Choose how you'd like to receive news updates.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newsFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>News Update Frequency</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          {newsFrequencyOptions.map(({ value, label }) => (
                            <Button
                              key={value}
                              type="button"
                              variant={field.value === value ? "default" : "outline"}
                              onClick={() => field.onChange(value)}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Choose how often you'd like to receive news updates.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>News Topics of Interest</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.map((topic) => (
                      <Badge
                        key={topic}
                        variant={selectedNewsTopics.includes(topic) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleTopic(topic, 'news')}
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {topic.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Select topics you're interested in to receive targeted news updates.
                  </FormDescription>
                </FormItem>
              </div>
            </div>

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
                        onClick={() => toggleTopic(topic, 'newsletter')}
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