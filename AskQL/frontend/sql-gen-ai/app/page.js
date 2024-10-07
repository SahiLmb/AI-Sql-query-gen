'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    // Manually redirect to the sign-in page on button click
    router.push('/sign-in');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Top-right Login button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLoginClick}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Login
        </button>
      </div>

      {/* Main content centered */}
      <div className="mt-16 text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Multi PDF Chat App</h1>
        <p className="text-lg mb-4">Interact with multiple PDFs and get answers from AI based on PDF content!</p>
        <p className="mb-8">Please log in to access the dashboard and upload your PDFs.</p>

        <button
          onClick={handleLoginClick}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Get Started!
        </button>
      </div>

      {/* Steps section in a single row */}
      <div className="flex justify-between items-center w-full px-4 mt-12 space-x-4">
        <div className="bg-gray-600 p-4 flex-1 rounded shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Step 1</h3>
          <p>Login to your account to access the app.</p>
        </div>
        <div className="bg-gray-700 p-4 flex-1 rounded shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Step 2</h3>
          <p>Upload PDFs to enable AI-powered question answering.</p>
        </div>
        <div className="bg-gray-800 p-4 flex-1 rounded shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Step 3</h3>
          <p>Ask questions based on the content of the uploaded PDFs.</p>
        </div>
        <div className="bg-gray-900 p-4 flex-1 rounded shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Step 4</h3>
          <p>Get answers in real-time directly from the app.</p>
        </div>
      </div>
    </div>
  );
}
