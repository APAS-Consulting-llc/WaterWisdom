import AnimatedAuth from '@/components/auth/AnimatedAuth';
import WaterEffect from '@/components/auth/WaterEffect';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Interactive water effect background */}
      <WaterEffect />

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-lg border-blue-100 relative z-10">
        <CardContent className="pt-8 pb-6">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex justify-center mb-4"
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Droplets className="h-16 w-16 text-blue-500" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              One Water.AI
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome to the future of water sector excellence
            </p>
          </motion.div>

          <AnimatedAuth />

          <motion.div
            className="text-center mt-6 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Empowering water professionals worldwide
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}