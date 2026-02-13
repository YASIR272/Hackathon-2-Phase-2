'use client';

import { ReactNode } from 'react';
import { auth } from '@/lib/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <auth.Provider>{children}</auth.Provider>;
}