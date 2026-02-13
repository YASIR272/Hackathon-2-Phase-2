'use client';

import { AuthProvider } from '@/lib/simple-auth';

export default function AuthProviderWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <AuthProvider>{children}</AuthProvider>;
}