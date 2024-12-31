import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  name: string;
  icon: LucideIcon;
  color: string;
  className?: string;
}

export function Badge({ name, icon: Icon, color, className }: BadgeProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border',
        colorClasses[color as keyof typeof colorClasses],
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{name}</span>
    </div>
  );
}
