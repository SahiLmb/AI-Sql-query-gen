'use client'

import { useState } from 'react';
import axios from 'axios';

const MultiSQLPage = () => {
    const [userQuery, setUserQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Credential state variables
    const [dbUser, setDbUser] = useState('');
    const [dbPassword, setDbPassword] = useState('');
    const [dbHost, setDbHost] = useState('');
    const [dbPort, setDbPort] = useState('');
    const [dbName, setDbName] = useState('');

    const handleQueryChange = (event) => setUserQuery(event.target.value);
    const handleDbUserChange = (event) => setDbUser(event.target.value);
    const handleDbPasswordChange = (event) => setDbPassword(event.target.value);
    const handleDbHostChange = (event) => setDbHost(event.target.value);
    const handleDbPortChange = (event) => setDbPort(event.target.value);
    const handleDbNameChange = (event) => setDbName(event.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        // Prepare the data to be sent to the backend, including credentials
        const data = {
            user_query: userQuery,
            chat_history: chatHistory,
            credentials: {
                user: dbUser,
                password: dbPassword,
                host: dbHost,
                port: dbPort,
                database: dbName,
            },
        };

        console.log('Data being sent:', data); // Log to verify structure

        try {
            // Send the request to the FastAPI backend
            const response = await axios.post('http://localhost:8000/sql-query', data);
            setResponse(response.data.response);
            setChatHistory([...chatHistory, { user: userQuery, ai: response.data.response }]);
            setUserQuery('');
        } catch (err) {
            setError('Error processing the query. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Chat with SQL Database</h1>
            <form onSubmit={handleSubmit} className="mb-4">

                {/* Credential Input Fields */}
                <input
                    type="text"
                    value={dbUser}
                    onChange={handleDbUserChange}
                    placeholder="Database User"
                    className="w-full border p-2 mb-2 text-gray-900"
                />
                <input
                    type="password"
                    value={dbPassword}
                    onChange={handleDbPasswordChange}
                    placeholder="Database Password"
                    className="w-full border p-2 mb-2 text-gray-900"
                />
                <input
                    type="text"
                    value={dbHost}
                    onChange={handleDbHostChange}
                    placeholder="Database Host"
                    className="w-full border p-2 mb-2 text-gray-900"
                />
                <input
                    type="text"
                    value={dbPort}
                    onChange={handleDbPortChange}
                    placeholder="Database Port"
                    className="w-full border p-2 mb-2 text-gray-900"
                />
                <input
                    type="text"
                    value={dbName}
                    onChange={handleDbNameChange}
                    placeholder="Database Name"
                    className="w-full border p-2 mb-2 text-gray-900"
                />

                {/* User Query Input */}
                <textarea
                    value={userQuery}
                    onChange={handleQueryChange}
                    placeholder="Type your SQL query here..."
                    rows="4"
                    className="w-full border p-2 mb-2 text-gray-900"
                />

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Submit'}
                </button>
            </form>

            {error && <p className="text-red-500">{error}</p>}
            {response && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">Response:</h2>
                    <pre className="border p-2">{response}</pre>
                </div>
            )}
        </div>
    );
};

export default MultiSQLPage;
