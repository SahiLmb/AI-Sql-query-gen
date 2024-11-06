'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { FiArrowRight, FiEdit, FiCopy } from 'react-icons/fi';
import { marked } from 'marked';
import { useClerk } from '@clerk/nextjs';

const MultiSQLPage = () => {
    const [userQuery, setUserQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [editedQuestion, setEditedQuestion] = useState('');
    const inputRef = useRef(null);

    // Credential state variables
    const [dbUser, setDbUser] = useState('');
    const [dbPassword, setDbPassword] = useState('');
    const [dbHost, setDbHost] = useState('');
    const [dbPort, setDbPort] = useState('');
    const [dbName, setDbName] = useState('');

    // Determine the backend URL based on the hostname
    const backendURL = window.location.hostname === 'localhost'
        ? 'http://localhost:8000'
        : 'https://multi-ai-r4v7.onrender.com';

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

        try {
            const response = await axios.post(`${backendURL}/sql-query`, data);
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

    const handleEditQuestion = (index) => {
        setEditIndex(index);
        setEditedQuestion(chatHistory[index].user);
        inputRef.current?.focus();
    };

    const saveEditedQuestion = (index) => {
        const updatedHistory = [...chatHistory];
        updatedHistory[index].user = editedQuestion;
        setChatHistory(updatedHistory);
        setEditIndex(null);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const clearChat = () => {
        setChatHistory([]);
        setResponse('');
    };

    return (
        <div className="container mx-auto px-4 py-6 bg-gray-800">
            <h1 className="text-3xl font-bold mb-4 text-center">Chat with SQL Database</h1>
            <form onSubmit={handleSubmit} className="mb-4 bg-gray-900 shadow-lg rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        value={dbUser}
                        onChange={handleDbUserChange}
                        placeholder="Database User"
                        className="border p-2 rounded-lg text-gray-900"
                    />
                    <input
                        type="password"
                        value={dbPassword}
                        onChange={handleDbPasswordChange}
                        placeholder="Database Password"
                        className="border p-2 rounded-lg text-gray-900"
                    />
                    <input
                        type="text"
                        value={dbHost}
                        onChange={handleDbHostChange}
                        placeholder="Database Host"
                        className="border p-2 rounded-lg text-gray-900"
                    />
                    <input
                        type="text"
                        value={dbPort}
                        onChange={handleDbPortChange}
                        placeholder="Database Port"
                        className="border p-2 rounded-lg text-gray-900"
                    />
                    <input
                        type="text"
                        value={dbName}
                        onChange={handleDbNameChange}
                        placeholder="Database Name"
                        className="border p-2 rounded-lg text-gray-900 col-span-2 sm:col-span-4 lg:col-span-2"
                    />
                </div>

                <div className="flex items-center">
                    <textarea
                        value={userQuery}
                        onChange={handleQueryChange}
                        placeholder="Type your query here..."
                        rows="2"
                        className="w-full h-11 border p-2 rounded-lg mb-4 text-gray-900"
                    />
                    <button
                        onClick={handleSubmit}
                        className="ml-2 bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600"
                    >
                        <FiArrowRight size={18} />
                    </button>
                </div>
            </form>

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            {chatHistory.length > 0 && (
                <div className="bg-gray-900 p-4 rounded max-h-[400px] overflow-y-scroll w-full mb-4">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className="mb-4">
                            <div className="bg-blue-600 text-white p-3 rounded flex items-center justify-between">
                                {editIndex === index ? (
                                    <input
                                        type="text"
                                        ref={inputRef}
                                        value={editedQuestion}
                                        onChange={(e) => setEditedQuestion(e.target.value)}
                                        className="bg-blue-500 text-white border-none w-full focus:ring-0"
                                        style={{ width: `${editedQuestion.length + 1}ch` }}
                                    />
                                ) : (
                                    <p>{chat.user}</p>
                                )}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() =>
                                            editIndex === index
                                                ? saveEditedQuestion(index)
                                                : handleEditQuestion(index)
                                        }
                                        className="hover:text-gray-300"
                                    >
                                        <FiEdit />
                                    </button>
                                    <button onClick={() => copyToClipboard(chat.user)} className="hover:text-gray-300">
                                        <FiCopy />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-800 text-white p-4 rounded-xl mt-2 flex items-start justify-between">
                            <div
                                    dangerouslySetInnerHTML={{ __html: marked(chat.ai) }}
                                    className="text-white"
                                />
                                <button onClick={() => copyToClipboard(chat.ai)} className="hover:text-gray-600">
                                    <FiCopy />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={clearChat}
                className="bg-gray-700 text-white px-4 py-2 rounded-full mb-4 hover:bg-gray-600"
            >
                Clear Chat
            </button>
        </div>
    );
};

export default MultiSQLPage;
