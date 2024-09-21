'use client';

import { SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    // Manually redirect to the sign-in page on button click
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      {/* Top-right Login button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLoginClick}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Login
        </button>
      </div>

      {/* Main content in center */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to AI Query App</h1>
        <p className="text-lg mb-4">Use AI to query your custom database using natural language!</p>
        <p className="mb-8">Please log in to access the dashboard and upload your database.</p>

        <button
          onClick={handleLoginClick}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Get Started!
        </button>
      </div>
    </div>
  );
}
