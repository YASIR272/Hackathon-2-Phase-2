'use client';

import { ReactNode } from 'react';
import { AuthProvider as SimpleAuthProvider } from '@/lib/simple-auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SimpleAuthProvider>{children}</SimpleAuthProvider>;
}