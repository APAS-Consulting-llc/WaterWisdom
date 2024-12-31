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
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BeakerIcon, 
  Droplets, 
  ShieldCheck, 
  Lightbulb, 
  GraduationCap,
  AlertCircle, 
  CheckCircle2, 
  BookOpen,
  Loader2,
  Sparkles
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

const confettiColors = ['#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C'];

export function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const { data: contributorData, isLoading: isLoadingContributor } = useContributor(question.createdBy || 0);

  const handleSubmit = async () => {
    if (!answer) {
      toast({
        title: 'Error',
        description: 'Please select or enter an answer',
        variant: 'destructive',
      });
      return;
    }
    setIsAnswered(true);
    const result = await onSubmit(answer);
    if (result?.correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto relative overflow-hidden">
      {showConfetti && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: confettiColors[i % confettiColors.length],
                left: `${Math.random() * 100}%`,
                top: -10,
              }}
              animate={{
                y: ['0vh', '100vh'],
                x: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 360],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                ease: 'easeOut',
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </motion.div>
      )}

      <CardHeader className="bg-gradient-radial from-blue-500/20 via-cyan-500/20 to-transparent text-white rounded-t-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm uppercase">{question.category}</span>
            <span className="mx-2">•</span>
            <span className="text-sm uppercase">{question.difficulty}</span>
          </div>
        </div>
        <motion.h2 
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {question.question}
        </motion.h2>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-white">Contributed by:</h3>
            {isLoadingContributor ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading contributor info...</span>
              </div>
            ) : contributorData ? (
              <motion.div 
                className="flex items-center gap-2 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-medium">{contributorData.contributor.username}</span>
                <div className="flex gap-1">
                  {contributorData.badges.map((badge: any, index: number) => {
                    const Icon = iconMap[badge.badge.icon];
                    return (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge
                          name={badge.badge.name}
                          icon={Icon}
                          color={badge.badge.color}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
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
        <AnimatePresence mode="wait">
          {!isAnswered ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {question.type === 'multiple_choice' && question.options && (
                <RadioGroup onValueChange={setAnswer} value={answer}>
                  {(question.options as string[]).map((option, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center space-x-2 p-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <RadioGroupItem id={`option-${index}`} value={option} />
                      <Label htmlFor={`option-${index}`}>{option}</Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'true_false' && (
                <RadioGroup onValueChange={setAnswer} value={answer}>
                  <motion.div 
                    className="flex items-center space-x-2 p-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <RadioGroupItem id="true" value="true" />
                    <Label htmlFor="true">True</Label>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-2 p-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <RadioGroupItem id="false" value="false" />
                    <Label htmlFor="false">False</Label>
                  </motion.div>
                </RadioGroup>
              )}

              {question.type === 'short_answer' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Input
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <motion.div 
                className={`p-4 rounded-lg ${answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'bg-green-50' : 'bg-red-50'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  {answer.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    </motion.div>
                  )}
                  <div>
                    <h3 className={`font-semibold ${answer.toLowerCase() === question.correctAnswer.toLowerCase() ? 'text-green-700' : 'text-red-700'}`}>
                      {answer.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-2"
                        >
                          Correct Answer! <Sparkles className="h-4 w-4" />
                        </motion.span>
                      ) : 'Incorrect Answer'}
                    </h3>
                    <motion.p 
                      className="text-sm mt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      The correct answer is: <span className="font-medium">{question.correctAnswer}</span>
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {question.explanation && (
                <motion.div 
                  className="p-4 bg-blue-50 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
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
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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