"use client";

import { motion } from 'framer-motion';
import SignUpForm from "@/components/form/sign-up-form";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import MiniLoader from "@/components/ui/mini-loader";

const SignUpPage = () => {
  const { status } = useAuthRedirect();

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="w-full flex items-center justify-center">
        <MiniLoader size="md" />
      </div>
    );
  }

  // Only show the sign-up form if user is not authenticated
  if (status === "unauthenticated") {
    return (
      <div className='w-full'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h1 
            className="text-2xl font-bold mb-2" 
            style={{ 
              fontFamily: "'Press Start 2P', monospace",
              color: '#000000',
              letterSpacing: '0.15em'
            }}
          >
            SIGN UP
          </h1>
          <p 
            className="mt-2" 
            style={{ 
              fontFamily: "'Press Start 2P', monospace",
              color: '#5A5B55',
              fontSize: '12px',
              letterSpacing: '0.1em'
            }}
          >
            Join Tekions today
          </p>
        </motion.div>
        <SignUpForm />
      </div>
    );
  }

  // Return empty div if authenticated (redirect will happen)
  return <div></div>;
};

export default SignUpPage;