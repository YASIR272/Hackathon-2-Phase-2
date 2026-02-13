/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables for the Hugging Face backend
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://yasirali22218-hackathon-ii-phase-ii.hf.space',
  },
  // Enable standalone output for optimized deployment
  output: 'standalone',
};

module.exports = nextConfig;
