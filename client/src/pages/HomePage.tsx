import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useUser } from '@/hooks/use-user';
import { Droplets, Building2, Sparkles, Book, Users, Brain } from 'lucide-react';
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
      className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-50"
    >
      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        className="pt-24 pb-16 px-4 text-center relative overflow-hidden"
      >
        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mx-auto w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 hover:bg-blue-500/20 transition-colors"
        >
          <Droplets className="w-12 h-12 text-blue-500" />
        </motion.div>
        <motion.h1 
          className="text-5xl md:text-6xl font-bold mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            One Water Hub
          </span>
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your gateway to water sector excellence through AI-powered learning and community collaboration
        </motion.p>
      </motion.section>

      {/* Organization Info */}
      <motion.section 
        variants={itemVariants}
        className="py-16 px-4 bg-white/30 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="bg-white/90 backdrop-blur border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg">
                  <Building2 className="h-7 w-7 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">An Initiative of One Water Academy</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-lg">
                One Water Hub is established by One Water Academy, a nonprofit organization 
                dedicated to advancing water sector education and collaboration.
              </p>
              <Button asChild className="mt-6" variant="outline" size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg">
                  <Brain className="h-7 w-7 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Powered by One Water</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-lg">
                Technical infrastructure and innovation provided by One Water, bringing 
                industry-leading expertise to support our mission.
              </p>
              <Button asChild className="mt-6" variant="outline" size="lg">
                <Link href="/technology">Our Technology</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {user && (
        <>
          <motion.section 
            variants={itemVariants}
            className="py-16 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Engage with Industry Experts</h2>
                <p className="text-xl text-gray-600">
                  Connect with AI-powered experts who understand your water sector journey
                </p>
              </div>
              <AvatarScroll />
            </div>
          </motion.section>

          <motion.section 
            variants={itemVariants}
            className="py-16 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <DelphiProfile />
            </div>
          </motion.section>

          <motion.section 
            variants={itemVariants}
            className="py-16 px-4 bg-white/30 backdrop-blur-sm"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold">Today's Learning</h2>
              </div>
              <MicroLearning />
            </div>
          </motion.section>
        </>
      )}

      <motion.section 
        variants={itemVariants}
        className="py-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/90 backdrop-blur border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg">
                    <Book className="h-7 w-7 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl">Expert Knowledge Base</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg">
                  Access comprehensive learning resources and interactive content designed 
                  by water sector experts. Master concepts through engaging experiences.
                </p>
                <Button asChild className="mt-6" variant="outline" size="lg">
                  <Link href="/knowledge">Explore Knowledge</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/20 rounded-lg">
                    <Users className="h-7 w-7 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl">Professional Community</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg">
                  Join a thriving community of water professionals. Share experiences,
                  collaborate on solutions, and grow together.
                </p>
                <Button asChild className="mt-6" variant="outline" size="lg">
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