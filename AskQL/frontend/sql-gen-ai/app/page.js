'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/sign-in');
  };

  const handleMultiSQLClick = () => {
    router.push('/dashboard/multisql');
  };

  const handleMultiPDFClick = () => {
    router.push('/dashboard/multipdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 text-white flex flex-col items-center">
      {/* Header with Navigation Links */}
      <header className="w-full bg-gray-900 py-4 px-8 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">Mult-AI</h1>
        <nav className="space-x-4">
          <button onClick={handleMultiSQLClick} className="hover:text-blue-400">
            Multi SQL Query
          </button>
          <button onClick={handleMultiPDFClick} className="hover:text-blue-400">
            Multi PDF Chat
          </button>
          <button
            onClick={handleLoginClick}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Login
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center mt-16 px-4 text-center">
        <h2 className="text-5xl font-bold mb-8">
          Welcome to the AI-Powered Multi Query Platform
        </h2>
        <p className="text-lg mb-12 max-w-2xl">
          Seamlessly interact with SQL databases and PDF documents using AI-driven queries.
          Log in to get started and explore both features below!
        </p>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-8">
          {/* Multi SQL Query Feature */}
          <div className="bg-gray-700 p-8 rounded-3xl shadow-lg text-center">
            <h3 className="text-3xl font-semibold mb-4">Multi SQL Query</h3>
            <p className="mb-4">
              Effortlessly connect to databases, input SQL queries, and get AI-generated answers.
              Perfect for quick data retrieval and analysis from multiple sources.
            </p>
            <button
              onClick={handleMultiSQLClick}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full"
            >
              Explore Multi SQL Query
            </button>
          </div>

          {/* Multi PDF Chat Feature */}
          <div className="bg-gray-800 p-8 rounded-3xl shadow-lg text-center">
            <h3 className="text-3xl font-semibold mb-4">Multi PDF Chat</h3>
            <p className="mb-4">
              Upload PDFs and ask questions. Get AI-powered answers directly from the content of
              your documents.
            </p>
            <button
              onClick={handleMultiPDFClick}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full"
            >
              Explore Multi PDF Chat
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 mb-8 text-gray-400 text-center">
        <p>© 2024 AI Query App. All rights reserved.</p>
      </footer>
    </div>
  );
}
