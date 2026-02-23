/**
 * Root layout for the application
 */
import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'Phase-2 Features - Task Management',
  description: 'User authentication and task management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main className="min-vh-100 bg-light">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
