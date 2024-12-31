import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useUser } from '@/hooks/use-user';
import { Droplets, Palette, UserCircle, Book, Users, Sparkles } from 'lucide-react';
import DelphiProfile from '@/components/profile/DelphiProfile';
import MicroLearning from '@/components/learning/MicroLearning';
import { motion } from 'framer-motion';
import { AvatarScroll } from '@/components/profile/AvatarScroll';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function HomePage() {
  const { user } = useUser();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-white to-blue-50"
    >
      {/* Welcome Section */}
      <motion.section 
        variants={itemVariants}
        className="pt-24 pb-16 px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6"
        >
          <Droplets className="w-10 h-10 text-blue-500" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Welcome to One Water Hub
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Your gateway to water sector excellence through AI-powered learning and community collaboration
        </p>
      </motion.section>

      {/* Avatar Selection Section */}
      <motion.section 
        variants={itemVariants}
        className="py-12 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Engage with a Digital Clone</h2>
            <p className="text-gray-600">
              Connect with AI-powered experts who understand your water sector journey
            </p>
          </div>
          <AvatarScroll />
        </div>
      </motion.section>

      {/* Current Expert Profile */}
      {user && (
        <motion.section 
          variants={itemVariants}
          className="py-12 px-4"
        >
          <div className="max-w-4xl mx-auto">
            <DelphiProfile />
          </div>
        </motion.section>
      )}

      {/* Today's Learning */}
      {user && (
        <motion.section 
          variants={itemVariants}
          className="py-12 px-4 bg-white/50"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold">Today's Learning</h2>
            </div>
            <MicroLearning />
          </div>
        </motion.section>
      )}

      {/* Features Grid */}
      <motion.section 
        variants={itemVariants}
        className="py-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/80 backdrop-blur border-blue-100 hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Book className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Learn as You Play</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Immerse yourself in interactive learning experiences designed by water sector experts.
                  Master concepts through engaging quizzes and real-world scenarios.
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/quiz">Start Learning</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-blue-100 hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Community-Driven Knowledge</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Join a thriving community of water professionals. Share experiences,
                  collaborate on solutions, and grow together in this dynamic learning environment.
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/community">Join Community</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}