import { useLearningPaths } from '@/hooks/use-learning-paths';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, Timer, Trophy, ArrowRight } from 'lucide-react';

export default function LearningPathsPage() {
  const { learningPaths, userPaths, isLoading, enroll } = useLearningPaths();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const handleEnroll = async (pathId: number) => {
    try {
      await enroll(pathId);
      toast({
        title: 'Success',
        description: 'Successfully enrolled in learning path',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enroll in learning path',
        variant: 'destructive'
      });
    }
  };

  const getProgress = (pathId: number) => {
    const userPath = userPaths.find(up => up.pathId === pathId);
    if (!userPath) return 0;
    
    const progress = userPath.progress as Record<string, boolean>;
    const completedTopics = Object.values(progress).filter(Boolean).length;
    const totalTopics = Object.keys(progress).length;
    return totalTopics === 0 ? 0 : (completedTopics / totalTopics) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
        <p className="mt-2 text-gray-600">
          Choose a structured learning path to enhance your knowledge in specific areas of water sector expertise.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learningPaths.map((path) => {
          const progress = getProgress(path.id);
          const isEnrolled = userPaths.some(up => up.pathId === path.id);

          return (
            <Card key={path.id} className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r ${
                path.difficulty === 'beginner' ? 'from-green-500/10 to-green-600/10' :
                path.difficulty === 'intermediate' ? 'from-blue-500/10 to-blue-600/10' :
                'from-purple-500/10 to-purple-600/10'
              }`} />

              <CardHeader>
                <CardTitle>{path.name}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>{(path.topics as string[]).length} Topics</span>
                    <Timer className="h-4 w-4 ml-4" />
                    <span>{path.estimatedHours} Hours</span>
                  </div>

                  {isEnrolled && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <Trophy className={`h-5 w-5 ${
                        path.difficulty === 'beginner' ? 'text-green-500' :
                        path.difficulty === 'intermediate' ? 'text-blue-500' :
                        'text-purple-500'
                      }`} />
                      <span className="text-sm font-medium capitalize">{path.difficulty}</span>
                    </div>

                    <Button 
                      variant={isEnrolled ? "secondary" : "default"}
                      onClick={() => !isEnrolled && handleEnroll(path.id)}
                      disabled={isEnrolled}
                    >
                      {isEnrolled ? 'Enrolled' : 'Start Learning'} 
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
