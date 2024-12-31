import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Droplets, Brain, Target, Trophy, ChevronRight } from 'lucide-react';
import type { DifficultyLevel } from '@db/schema';

interface QuizSetupProps {
  onStart: (config: {
    numQuestions: number;
    category?: string;
    difficulty?: DifficultyLevel;
  }) => void;
  categories: string[];
}

const difficultyInfo = {
  beginner: {
    icon: Droplets,
    description: "Perfect for those starting their water sector journey",
    color: "text-blue-500"
  },
  intermediate: {
    icon: Brain,
    description: "For professionals with growing expertise",
    color: "text-green-500"
  },
  expert: {
    icon: Trophy,
    description: "Challenge yourself at the highest level",
    color: "text-purple-500"
  }
};

export function QuizSetup({ onStart, categories }: QuizSetupProps) {
  const [numQuestions, setNumQuestions] = useState<string>('3');
  const [category, setCategory] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block p-3 bg-blue-500/10 rounded-full mb-4"
          >
            <Target className="w-8 h-8 text-blue-500" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">Ready to Test Your Knowledge?</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Challenge yourself with our water sector quiz. Select your preferences below
            and embark on a journey of learning and discovery.
          </p>
        </div>

        <Card className="border-2 border-blue-100 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-xl text-blue-900">
              Customize Your Quiz Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Choose Your Challenge Level</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(difficultyInfo).map(([level, info]) => {
                  const Icon = info.icon;
                  return (
                    <motion.div
                      key={level}
                      variants={cardVariants}
                      whileHover="hover"
                      onClick={() => setDifficulty(level as DifficultyLevel)}
                      onMouseEnter={() => setIsHovered(level)}
                      onMouseLeave={() => setIsHovered(null)}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 ${
                        difficulty === level 
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          difficulty === level ? 'bg-blue-500/10' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${info.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{level}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="num-questions">Number of Questions</Label>
                <Select 
                  value={numQuestions} 
                  onValueChange={setNumQuestions}
                >
                  <SelectTrigger id="num-questions" className="w-full">
                    <SelectValue placeholder="Select number of questions" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Question{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => onStart({
                  numQuestions: parseInt(numQuestions),
                  category: category === 'all' ? undefined : category,
                  difficulty: difficulty === 'all' ? undefined : difficulty,
                })}
              >
                <span>Start Your Journey</span>
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-600"
        >
          Pro tip: Start with topics you're most familiar with to build confidence!
        </motion.div>
      </motion.div>
    </div>
  );
}