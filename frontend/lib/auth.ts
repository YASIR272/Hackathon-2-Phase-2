import { betterAuth } from 'better-auth';
import { toNextJsHandler } from 'better-auth/next-js';
import Database from 'better-sqlite3';

// Create/open the SQLite database - pass directly to betterAuth
const db = new Database('./auth.db');

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'NX83Ogb4FAGFppGPnkjbDP1iykJ6NPSH',
});

export const { GET, POST } = toNextJsHandler(auth);
