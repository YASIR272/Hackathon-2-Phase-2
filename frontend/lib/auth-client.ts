import { createAuthClient } from 'better-auth/client';

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  fetchOptions: {
    fetch: typeof window !== 'undefined' ? window.fetch : global.fetch,
  },
});