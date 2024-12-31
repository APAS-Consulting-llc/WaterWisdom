import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
  streak: number;
}

export function ProgressBar({ current, total, streak }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Question {current} of {total}
        </span>
        <span className="text-sm text-blue-500 font-medium">
          Streak: {streak} 🔥
        </span>
      </div>
      <Progress value={progress} className="h-2 bg-blue-100" />
    </div>
  );
}
