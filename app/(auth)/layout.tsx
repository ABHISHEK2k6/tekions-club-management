"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Flying bird component using the same birds from home page
const FlyingBird = ({ delay = 0, className = "" }: { delay?: number; className?: string }) => (
  <motion.div
    className={`absolute ${className}`}
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
    <Image 
      src="/UI/bird.png" 
      alt="Flying bird" 
      width={30} 
      height={30} 
      className="object-contain opacity-70"
    />
  </motion.div>
);

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isSignInPage = pathname === '/sign-in';
  const isSignUpPage = pathname === '/sign-up';
  
  // Determine top positioning based on the page
  const topStyle = isSignInPage ? '10%' : isSignUpPage ? '0.5rem' : '5rem';
  
  return (
    <div 
      className="relative overflow-hidden w-screen h-screen"
      style={{
        background: '#FBFBF1',
        backgroundImage: "url('/UI/homebg.jpg')",
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="relative w-full h-full">
        {/* Animated flying birds */}
        <FlyingBird delay={0} className="top-12 left-0" />
        <FlyingBird delay={3} className="top-32 left-0" />
        <FlyingBird delay={6} className="top-52 left-0" />
        <FlyingBird delay={9} className="top-72 left-0" />
        
        {/* Main ground line */}
        <div 
          className="absolute"
          style={{
            width: '100vw',
            height: '0px',
            left: '0px',
            bottom: '9vh',
            border: '3px solid #5A5B55'
          }}
        />

        {/* Cactus decorations */}
        <div 
          className="absolute"
          style={{
            width: '4.5vw',
            height: '4.5vw',
            left: '10vw',
            bottom: '9vh'
          }}
        >
          <Image 
            src="/UI/cactus.png" 
            alt="Cactus" 
            width={99} 
            height={99} 
            className="object-contain w-full h-full"
          />
        </div>

        <div 
          className="absolute"
          style={{
            width: '4.5vw',
            height: '4.5vw',
            right: '10vw',
            bottom: '9vh'
          }}
        >
          <Image 
            src="/UI/cactus.png" 
            alt="Cactus" 
            width={105} 
            height={105} 
            className="object-contain w-full h-full"
          />
        </div>

        {/* Tekions label - clickable to home */}
        <Link href="/">
          <div 
            className="absolute cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              left: '3vw',
              top: '5vh',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(16px, 2vw, 24px)',
              color: '#5A5B55',
              letterSpacing: '0.1em'
            }}
          >
            Tekions
          </div>
        </Link>

        {/* Auth form container */}
        <div 
          className="absolute inset-0 flex justify-end right-40"
          style={{ top: topStyle }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md mx-4"
          >
            <Card 
              className="shadow-xl border-4 border-black"
              style={{
                background: '#FBFBF1',
                borderRadius: '25px'
              }}
            >
              <CardContent className="p-8">
                {children}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
