import React, { useEffect, useState, ReactNode } from "react";

interface LoaderProps {
  children: ReactNode;
  duration?: number;
}

const Loader: React.FC<LoaderProps> = ({ children, duration = 2000 }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingText, setLoadingText] = useState<string>("Loading");
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Immediate effect to ensure loader shows instantly
    setLoading(true);
    
    // Content ready detection
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100); // Very short delay to ensure DOM is ready

    // Minimum loading time
    const minTimer = setTimeout(() => {
      if (isReady) {
        setLoading(false);
      }
    }, duration);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(minTimer);
    };
  }, [duration]);

  // Effect to handle when content is ready
  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setLoading(false), Math.max(500, duration - 100));
      return () => clearTimeout(timer);
    }
  }, [isReady, duration]);

  useEffect(() => {
    if (!loading) return;

    const loadingMessages = [
      "Loading",
      "Loading.",
      "Loading..",
      "Loading...",
      "Almost there",
      "Almost there.",
      "Almost there..",
      "Almost there...",
      "Getting ready",
      "Getting ready.",
      "Getting ready..",
      "Getting ready...",
    ];

    let messageIndex = 0;
    const textInterval = setInterval(() => {
      setLoadingText(loadingMessages[messageIndex]);
      messageIndex = (messageIndex + 1) % loadingMessages.length;
    }, 400);

    return () => clearInterval(textInterval);
  }, [loading]);

  return (
    <div className="relative min-h-screen">
      {loading && (
        <div
          id="loader-container"
          className="fixed top-0 left-0 w-full h-full bg-gray-900 flex justify-center items-center z-[9999] transition-none opacity-100"
          style={{ 
            display: 'flex',
            visibility: 'visible'
          }}
        >
          <div className="flex flex-col items-center space-y-6">
            <img
              src="/UI/dino-loader.gif"
              alt="Loading..."
              className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="text-white text-center">
              <h2 
                className="text-xl text-white md:text-2xl lg:text-3xl font-bold mb-4 min-h-[2.5rem] flex items-center justify-center"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  letterSpacing: '0.1em'
                }}
              >
                {loadingText}
              </h2>
              <div className="w-64 md:w-80 lg:w-96 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${Math.min(100, ((Date.now() / 50) % 100))}%`,
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div 
        className={`transition-opacity duration-500 ${loading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ 
          minHeight: '100vh',
          backgroundColor: loading ? 'transparent' : 'initial'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Loader;
