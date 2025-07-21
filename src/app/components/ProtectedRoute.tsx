// components/ProtectedRoute.tsx

"use client";  // Make this a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';  // Correct import for Next.js 13+

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');

    if (token) {
      setIsAuthenticated(true); // User is authenticated
    } else {
      setIsAuthenticated(false); // User is not authenticated
      router.push('/login'); // Redirect to login page
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show a loading state while checking authentication
  }

  return <>{isAuthenticated && children}</>;
};

export default ProtectedRoute;
