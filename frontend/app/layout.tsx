import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/providers/theme-provider';
import AuthProviderWrapper from '@/components/auth/auth-provider-wrapper';

export const metadata: Metadata = {
  title: 'Todo Full Stack Web Application',
  description: 'Premium todo application with beautiful UI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}