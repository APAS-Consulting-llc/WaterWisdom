import { 
  Radar, 
  RadarChart as RechartsRadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export interface Skill {
  subject: string;
  level: number;
  fullMark: number;
}

interface SkillRadarProps {
  skills: Skill[];
  className?: string;
}

export function SkillRadar({ skills, className }: SkillRadarProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="scale-heading text-xl">Professional Expertise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
                        <p className="font-medium">{data.subject}</p>
                        <p className="text-sm">
                          Level: {data.level}/100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Skills"
                dataKey="level"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
