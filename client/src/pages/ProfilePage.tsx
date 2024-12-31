import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementBadge } from '@/components/quiz/AchievementBadge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/hooks/use-user';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useUser();

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['/api/progress'],
  });

  if (loadingAchievements || loadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const totalQuestions = progress?.length || 0;
  const correctAnswers = progress?.filter(p => p.correct).length || 0;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Points</h3>
                <p className="text-3xl font-bold text-blue-500">{user?.points || 0}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Current Streak</h3>
                <p className="text-3xl font-bold text-blue-500">{user?.streak || 0} 🔥</p>
              </div>
              <div>
                <h3 className="text-lg font-medium">Accuracy</h3>
                <Progress value={accuracy} className="h-2 mt-2" />
                <p className="text-sm text-gray-600 mt-1">{accuracy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements?.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
              {achievements?.length === 0 && (
                <p className="text-gray-600">No achievements yet. Keep playing to earn badges!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
