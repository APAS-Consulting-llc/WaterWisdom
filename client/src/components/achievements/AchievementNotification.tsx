import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Achievement } from '@db/schema';

interface AchievementNotificationProps {
  achievement: Achievement;
}

export function AchievementNotification({ achievement }: AchievementNotificationProps) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Achievement Unlocked!</span>
        </div>
      ),
      description: (
        <div className="mt-1">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-sm text-muted-foreground">{achievement.description}</p>
        </div>
      ),
      duration: 5000,
    });
  }, []);

  return null;
}
