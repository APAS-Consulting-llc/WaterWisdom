import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

type GradientStop = {
  color: string;
  position: number;
};

export default function ThemeCustomizer() {
  const { toast } = useToast();
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9');
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { color: '#2563eb', position: 0 },
    { color: '#60a5fa', position: 100 },
  ]);
  const [previewBackground, setPreviewBackground] = useState('bg-gradient-scale');

  const handleAddStop = () => {
    if (gradientStops.length < 5) {
      const position = Math.round((gradientStops[gradientStops.length - 1].position + gradientStops[0].position) / 2);
      setGradientStops([...gradientStops, { color: '#ffffff', position }].sort((a, b) => a.position - b.position));
    }
  };

  const handleRemoveStop = (index: number) => {
    if (gradientStops.length > 2) {
      setGradientStops(gradientStops.filter((_, i) => i !== index));
    }
  };

  const handleStopChange = (index: number, value: Partial<GradientStop>) => {
    const newStops = [...gradientStops];
    newStops[index] = { ...newStops[index], ...value };
    setGradientStops(newStops.sort((a, b) => a.position - b.position));
  };

  const generateGradientStyle = () => {
    const stops = gradientStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    return `linear-gradient(to right, ${stops})`;
  };

  const applyTheme = () => {
    // Here we'll update the theme.json and trigger a rebuild
    toast({
      title: "Theme Updated",
      description: "Your new theme has been applied successfully.",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Theme Customizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Primary Color</Label>
          <div className="flex gap-4 items-center">
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Gradient Stops</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStop}
              disabled={gradientStops.length >= 5}
            >
              Add Stop
            </Button>
          </div>
          
          <div className="space-y-4">
            {gradientStops.map((stop, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex gap-4 items-center"
              >
                <Input
                  type="color"
                  value={stop.color}
                  onChange={(e) => handleStopChange(index, { color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) => handleStopChange(index, { position: Number(e.target.value) })}
                  className="w-24"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStop(index)}
                  disabled={gradientStops.length <= 2}
                >
                  Remove
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Preview</Label>
          <div
            className="h-32 rounded-lg transition-all duration-300"
            style={{ background: generateGradientStyle() }}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className={cn("p-4 rounded-lg", previewBackground)}>
                  <h3 className="font-semibold">Card Title</h3>
                  <p className="text-sm text-muted-foreground">Card content with some text.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={applyTheme} className="w-full">
          Apply Theme
        </Button>
      </CardContent>
    </Card>
  );
}
