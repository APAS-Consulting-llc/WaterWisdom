import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaterTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function WaterTooltip({
  term,
  definition,
  children,
  className,
  showIcon = true,
}: WaterTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("group inline-flex items-center gap-1", className)}>
            {children}
            {showIcon && (
              <Info className="h-3.5 w-3.5 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-2">
            <p className="font-medium">{term}</p>
            <p className="text-sm text-muted-foreground">{definition}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
