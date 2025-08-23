"use client";

import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();

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

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

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
      <div 
        className="relative w-full h-full"
      >
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

      {/* First Cactus */}
      <div 
        className="absolute"
        style={{
          width: '4.5vw',
          height: '4.5vw',
          left: '55vw',
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

      {/* Second Cactus */}
      <div 
        className="absolute"
        style={{
          width: '4.5vw',
          height: '4.5vw',
          right: '5vw',
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

      {/* Ground details - Line 2 */}
      <div 
        className="absolute"
        style={{
          width: '2vw',
          height: '0px',
          left: '72vw',
          bottom: '5vh',
          border: '1px solid #000000',
          transform: 'rotate(7.35deg)'
        }}
      />

      {/* Ground details - Line 3 */}
      <div 
        className="absolute"
        style={{
          width: '2vw',
          height: '0px',
          left: '63vw',
          bottom: '6vh',
          border: '1px solid #000000',
          transform: 'rotate(7.35deg)'
        }}
      />

      {/* Ground details - Line 4 */}
      <div 
        className="absolute"
        style={{
          width: '2vw',
          height: '0px',
          left: '78vw',
          bottom: '7vh',
          border: '1px solid #000000',
          transform: 'rotate(7.35deg)'
        }}
      />

      {/* Sign in button background */}
      <div 
        className="absolute"
        style={{
          width: '15vw',
          height: '8vh',
          right: '3vw',
          top: '3vh',
          background: '#FBFBF1',
          border: '4px solid #000000',
          borderRadius: '25px',
          boxSizing: 'border-box'
        }}
      />

      {/* Sign in button text */}
      <Link href="/sign-in">
        <div 
          className="absolute cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            width: '15vw',
            height: '8vh',
            right: '3vw',
            top: '3vh',
            fontFamily: "'Press Start 2P', monospace",
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: 'clamp(14px, 1.8vw, 27px)',
            lineHeight: '8vh',
            textAlign: 'center',
            letterSpacing: '0.25em',
            color: '#000000'
          }}
        >
          signin
        </div>
      </Link>

      {/* Birds positioned as in reference */}
      {/* Top right bird - highest position */}
      <div 
        className="absolute"
        style={{
          right: '70rem',
          top: '5vh',
          width: '2.5vw',
          height: '2.5vw'
        }}
      >
        <Image 
          src="/UI/bird.png" 
          alt="Flying bird" 
          width={30} 
          height={30} 
          className="object-contain opacity-70 w-full h-full"
        />
      </div>

      {/* Second bird - middle top */}
      <div 
        className="absolute"
        style={{
          right: '40rem',
          top: '10rem',
          width: '2.5vw',
          height: '2.5vw'
        }}
      >
        <Image 
          src="/UI/bird.png" 
          alt="Flying bird" 
          width={30} 
          height={30} 
          className="object-contain opacity-70 w-full h-full"
        />
      </div>

      {/* Third bird - lower in the top formation */}
      <div 
        className="absolute"
        style={{
          right: '50rem',
          top: '16vh',
          width: '2.5vw',
          height: '2.5vw'
        }}
      >
        <Image 
          src="/UI/bird.png" 
          alt="Flying bird" 
          width={30} 
          height={30} 
          className="object-contain opacity-70 w-full h-full"
        />
      </div>

      {/* Center-left bird - near the title */}
      <div 
        className="absolute"
        style={{
          left: '10rem',
          top: '40vh',
          width: '2.5vw',
          height: '2.5vw'
        }}
      >
        <Image 
          src="/UI/bird.png" 
          alt="Flying bird" 
          width={30} 
          height={30} 
          className="object-contain opacity-70 w-full h-full"
        />
      </div>

      {/* Bottom left bird */}
      <div 
        className="absolute"
        style={{
          left: '6vw',
          bottom: '35vh',
          width: '2.5vw',
          height: '2.5vw'
        }}
      >
        <Image 
          src="/UI/bird.png" 
          alt="Flying bird" 
          width={30} 
          height={30} 
          className="object-contain opacity-70 w-full h-full"
        />
      </div>

      {/* Bottom right bird */}
      <div 
        className="absolute"
        style={{
          right: '70rem',
          bottom: '40vh',
          width: '2.5vw',
          height: '2.5vw'
        }}
      >
        <Image 
          src="/UI/bird.png" 
          alt="Flying bird" 
          width={30} 
          height={30} 
          className="object-contain opacity-70 w-full h-full"
        />
      </div>

      {/* Tekions label */}
      <div 
        className="absolute"
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
      </div>
    </div>
  );
}