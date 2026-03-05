// app/layout.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import AuthProvider from '@/providers/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'AgriTech Dashboard',
  description: 'Real-time plant health monitoring system',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <div className="flex min-h-screen">
            <Navigation />
            <main className="flex-1 p-6">
              <Suspense fallback={<LoadingSpinner />}>
                {children}
              </Suspense>
            </main>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />
        </AuthProvider>
      </body>
    </html>
  );
}

// app/page.tsx
export default function HomePage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">AgriTech Dashboard</h1>
      {/* Add dashboard content */}
    </div>
  );
}

// app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {/* Add login form */}
    </div>
  );
}

// app/(auth)/register/page.tsx
export default function RegisterPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {/* Add registration form */}
    </div>
  );
}

// app/plant-data/page.tsx
export default function PlantDataListPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Plant Data</h1>
      {/* Add plant data list */}
    </div>
  );
}

// app/plant-data/[id]/page.tsx
export default function PlantDataDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Plant Data Details</h1>
      {/* Add plant data details */}
    </div>
  );
}

// app/plant-data/create/page.tsx
export default function PlantDataCreatePage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Plant Data</h1>
      {/* Add plant data creation form */}
    </div>
  );
}

// app/plant-data/[id]/edit/page.tsx
export default function PlantDataEditPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Plant Data</h1>
      {/* Add plant data edit form */}
    </div>
  );
}

// app/not-found.tsx
export default function NotFoundPage() {
  return (
    <div className="container mx-auto text-center py-16">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The page you are looking for does not exist.</p>
    </div>
  );
}

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

const publicPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifyAuth(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/plant-data/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
  ],
};