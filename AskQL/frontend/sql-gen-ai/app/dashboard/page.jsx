'use client'
import Link from 'next/link';
import { useClerk, useUser } from '@clerk/clerk-react';

export default function Dashboard() {
  const { signOut } = useClerk(); // Clerk sign-out functionality
  const { user } = useUser(); // Get current user info

  return (
    <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">
      Welcome to the Dashboard, {user ? user.fullName : 'User'}!
    </h1>
      <div className="bg-gray-900 p-4 rounded shadow-md">
        <p>Explore the available features below:</p>
        {/* Navigation Container */}
        <Link href="/dashboard/multipdf">
          <div className="bg-blue-500 text-white py-4 px-6 rounded cursor-pointer mt-4 hover:bg-blue-600">
            AI-Powered PDF Chat Interface
          </div>
          
        </Link>
      </div>

      {/* Sign Out Button */}
      <button onClick={signOut} className="mt-6 bg-gray-800 text-white py-2 px-4 rounded">
        Sign Out
      </button>
    </div>
  );
}
