// Type definitions to resolve React/Radix UI compatibility issues
declare module '@radix-ui/react-*' {
  // This helps resolve React 18/19 compatibility issues with Radix UI components
  export * from '@radix-ui/react-*';
}

// Additional type fixes for UI components
declare global {
  namespace React {
    type ReactNode = import('react').ReactNode;
  }
}

export {};
