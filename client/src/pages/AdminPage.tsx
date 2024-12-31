import { useState } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { useQuiz } from '@/hooks/use-quiz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, FileQuestion, BookOpen, Settings2, BarChart3 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminPage() {
  const { stats, users, pendingQuestions, pendingKnowledge, loadingStats, loadingUsers, loadingPendingQuestions, loadingPendingKnowledge, approveQuestion, verifyKnowledge } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  if (loadingStats || loadingUsers || loadingPendingQuestions || loadingPendingKnowledge) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage One Water Hub platform resources and users</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>User activity statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users.activeToday} active today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>Questions and knowledge entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold">{stats?.content.questions}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.content.pendingQuestions} pending review
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.content.knowledgeEntries}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.content.pendingEntries} pending verification
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Paths</CardTitle>
                <CardDescription>Course engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.learning.paths}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.learning.enrollments} total enrollments
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-8">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{user.username}</h4>
                        <p className="text-sm text-muted-foreground">
                          Role: {user.role} · Points: {user.points}
                        </p>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Question Moderation</CardTitle>
              <CardDescription>Review and approve submitted questions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-8">
                  {pendingQuestions.map(question => (
                    <div key={question.id} className="space-y-2">
                      <div>
                        <h4 className="font-medium">Question Type: {question.type}</h4>
                        <p className="text-sm">{question.question}</p>
                        <p className="text-sm text-muted-foreground">
                          Category: {question.category} · Difficulty: {question.difficulty}
                        </p>
                      </div>
                      <Button onClick={() => approveQuestion(question.id)}>
                        Approve Question
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Moderation</CardTitle>
              <CardDescription>Verify and manage knowledge entries</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-8">
                  {pendingKnowledge.map(entry => (
                    <div key={entry.id} className="space-y-2">
                      <div>
                        <h4 className="font-medium">{entry.title}</h4>
                        <p className="text-sm">{entry.content.substring(0, 200)}...</p>
                        <p className="text-sm text-muted-foreground">
                          Category: {entry.category}
                        </p>
                      </div>
                      <Button onClick={() => verifyKnowledge(entry.id)}>
                        Verify Entry
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure platform settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Quiz Settings</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm">Daily Question Limit</label>
                      <Input type="number" defaultValue={10} />
                    </div>
                    <div>
                      <label className="text-sm">Points per Correct Answer</label>
                      <Input type="number" defaultValue={10} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Knowledge Base Settings</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm">Minimum Content Length</label>
                      <Input type="number" defaultValue={100} />
                    </div>
                    <div>
                      <label className="text-sm">Require Expert Verification</label>
                      <Input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}