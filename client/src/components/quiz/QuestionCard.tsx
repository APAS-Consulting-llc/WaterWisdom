import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { Badge } from '@/components/ui/Badge';
import { useContributor } from '@/hooks/use-contributor';
import { 
  BeakerIcon, 
  Droplets, 
  ShieldCheck, 
  Lightbulb, 
  GraduationCap,
  AlertCircle, 
  CheckCircle2, 
  BookOpen,
  Loader2
} from 'lucide-react';
import type { Question } from '@db/schema';

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

const iconMap: Record<string, any> = {
  BeakerIcon,
  Droplets,
  ShieldCheck,
  Lightbulb,
  GraduationCap,
};

export function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const { toast } = useToast();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const { data: contributorData, isLoading: isLoadingContributor } = useContributor(question.createdBy || 0);

  const handleSubmit = () => {
    if (!answer) {
      toast({
        title: 'Error',
        description: 'Please select or enter an answer',
        variant: 'destructive',
      });
      return;
    }
    setIsAnswered(true);
    onSubmit(answer);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-radial from-blue-500/20 via-cyan-500/20 to-transparent text-white rounded-t-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm uppercase">{question.category}</span>
            <span className="mx-2">•</span>
            <span className="text-sm uppercase">{question.difficulty}</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4">{question.question}</h2>

        {/* Contributor info with badges */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-white">Contributed by:</h3>
            {isLoadingContributor ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading contributor info...</span>
              </div>
            ) : contributorData ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">{contributorData.contributor.username}</span>
                <div className="flex gap-1">
                  {contributorData.badges.map((badge: any, index: number) => {
                    const Icon = iconMap[badge.badge.icon];
                    return (
                      <Badge
                        key={index}
                        name={badge.badge.name}
                        icon={Icon}
                        color={badge.badge.color}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-2">Share this question:</h3>
            <ShareButtons 
              url={shareUrl}
              title={`🌊 Water Knowledge Quiz: ${question.question}`}
              description={`Test your knowledge in ${question.category}! Join me in learning about water sector topics at Water.AI`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {question.type === 'multiple_choice' && question.options && (
          <RadioGroup onValueChange={setAnswer} value={answer} disabled={isAnswered}>
            {(question.options as string[]).map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-2">
                <RadioGroupItem id={`option-${index}`} value={option} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'true_false' && (
          <RadioGroup onValueChange={setAnswer} value={answer} disabled={isAnswered}>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem id="true" value="true" />
              <Label htmlFor="true">True</Label>
            </div>
            <div className="flex items-center space-x-2 p-2">
              <RadioGroupItem id="false" value="false" />
              <Label htmlFor="false">False</Label>
            </div>
          </RadioGroup>
        )}

        {question.type === 'short_answer' && (
          <Input
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isAnswered}
          />
        )}

        {isAnswered && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-lg ${answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start gap-3">
                {answer.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold ${answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'text-green-700' : 'text-red-700'}`}>
                    {answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'Correct Answer!' : 'Incorrect Answer'}
                  </h3>
                  <p className="text-sm mt-1">
                    The correct answer is: <span className="font-medium">{question.correctAnswer}</span>
                  </p>
                </div>
              </div>
            </div>

            {question.explanation && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium text-blue-900">Learn More</h4>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                  {question.explanation}
                </p>
                <p className="text-xs text-blue-600 mt-4 italic">
                  Question contributed by {contributorData ? contributorData.contributor.username : 'Unknown'} • Powered by Water.AI - All rights reserved 2024
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full ripple-button"
          onClick={handleSubmit}
          disabled={isAnswered || !answer}
        >
          Submit Answer
        </Button>
      </CardFooter>
    </Card>
  );
}