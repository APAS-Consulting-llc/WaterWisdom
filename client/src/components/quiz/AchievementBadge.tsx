import { Card } from '@/components/ui/card';
import type { Achievement } from '@db/schema';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <Card className="p-4 droplet bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
      <div className="transform -rotate-45">
        <h3 className="font-semibold">{achievement.name}</h3>
        <p className="text-sm opacity-90">{achievement.description}</p>
        <div className="text-xs mt-2 opacity-75">
          Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}
