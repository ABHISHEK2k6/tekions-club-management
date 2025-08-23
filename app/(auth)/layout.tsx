"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Flying bird/plane component
const FlyingBird = ({ delay = 0, className = "" }: { delay?: number; className?: string }) => (
  <motion.div
    className={`absolute text-gray-400 ${className}`}
    initial={{ x: -100, y: 0 }}
    animate={{ 
      x: [0, 100, 200, 300, 400, 500],
      y: [0, -20, -10, -30, -5, -15]
    }}
    transition={{
      duration: 15,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
    </svg>
  </motion.div>
);

// Dinosaur component
const DinosaurIcon = () => (
  <div className="text-6xl select-none">
    🦕
  </div>
);

// Cactus component
const CactusIcon = () => (
  <div className="text-4xl select-none">
    🌵
  </div>
);

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden relative">
      {/* Animated flying birds/planes */}
      <FlyingBird delay={0} className="top-12 left-0" />
      <FlyingBird delay={3} className="top-32 left-0" />
      <FlyingBird delay={6} className="top-52 left-0" />
      <FlyingBird delay={9} className="top-72 left-0" />
      <FlyingBird delay={12} className="top-96 left-0" />
      
      {/* Left side - Branding and illustration */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative p-12">
        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4" style={{ fontFamily: 'monospace' }}>
            HAI<br />TEKION.
          </h1>
        </motion.div>
        
        {/* Tekions label */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-24 left-12"
        >
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300" style={{ fontFamily: 'monospace' }}>
            Tekions
          </p>
        </motion.div>
        
        {/* Ground line and characters */}
        <div className="absolute bottom-20 left-0 right-0">
          {/* Ground line */}
          <div className="w-full h-1 bg-gray-300 dark:bg-gray-600 mb-4"></div>
          
          {/* Characters on ground */}
          <div className="flex justify-between items-end px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <DinosaurIcon />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <CactusIcon />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <CactusIcon />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Right side - Sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Sign in button in top right */}
        <div className="absolute top-6 right-6">
          <span className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
            signin
          </span>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl rounded-3xl bg-white dark:bg-gray-800">
            <CardContent className="p-8">
              {children}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
