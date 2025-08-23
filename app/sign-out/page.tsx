"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function SignOutPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // If user is not signed in, redirect to sign-in page
    if (status === "unauthenticated") {
      window.location.href = "/sign-in";
    }
  }, [status]);

  const handleSignOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: `${window.location.origin}/sign-in`
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <Card className="max-w-md mx-auto shadow-lg border">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Sign Out</CardTitle>
            <CardDescription>
              Are you sure you want to sign out of your account?
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Currently signed in as:</p>
              <p className="font-medium">{session.user?.email}</p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleSignOut}
                className="w-full"
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Yes, Sign Out
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <Link href="/">
                  Cancel
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
