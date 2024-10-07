"use client"

import React, { useState, useEffect, useRef } from 'react';
import { FiCopy, FiEdit } from 'react-icons/fi'; // Import icons from react-icons
import TemplateQuestions from '../components/TemplateQuestions';
import { useClerk } from '@clerk/nextjs';

const MultiPDFPage = () => {
    const [pdfFiles, setPdfFiles] = useState([]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState([]); // Store previous conversation
    const [useDefaultPDF, setUseDefaultPDF] = useState(true); // Toggle between default PDF and uploaded PDFs
    const [editIndex, setEditIndex] = useState(null); // To track the index of the question being edited
    const [editedQuestion, setEditedQuestion] = useState(''); // To store the edited question text

    const { signOut } = useClerk(); // Clerk sign-out functionality


    const inputRef = useRef(null); // Reference for the input field

    // Handle PDF file selection
    const handleFileChange = (event) => {
        setPdfFiles(Array.from(event.target.files));
        setUseDefaultPDF(false); // Switch to user-uploaded PDFs
    };

    // Handle question input change
    const handleQuestionChange = (event) => {
        setQuestion(event.target.value);
    };

    // Handle file upload
    const uploadFiles = async () => {
        if (pdfFiles.length === 0) {
            alert('Please upload at least one PDF file.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        pdfFiles.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8000/process_pdfs/', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (result.status === 'success') {
                alert('PDFs processed successfully!');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle asking a question from the templates and from user's own qs.
    const askQuestion = async (newQuestion) => {
        const questionToAsk = newQuestion || question; // If newQuestion is provided, use it
        if (!questionToAsk.trim()) {
            alert("Please enter a question.");
            return;
        }

        // Add the question to the conversation state immediately
        const conversationId = conversation.length; // Use index as ID
        setConversation((prev) => [
            ...prev,
            { question: questionToAsk, response: "Loading...", id: conversationId },
        ]);
        setQuestion(''); // Clear input box

        setLoading(true);
        try {
            const requestBody = {
                question: questionToAsk,
                use_default: useDefaultPDF,
            };
            const response = await fetch('http://localhost:8000/ask_question/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to get a response");
            }

            // Update the response in the conversation once received
            setConversation((prev) =>
                prev.map((chat, index) =>
                    index === conversationId ? { ...chat, response: result.response } : chat
                )
            );
        } catch (error) {
            console.error('Error asking question:', error);
            // Handle the error state in conversation
            setConversation((prev) =>
                prev.map((chat, index) =>
                    index === conversationId ? { ...chat, response: "Error getting response" } : chat
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // Copy text to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    };

    // Handle inline question edit
    const startEditing = (index, currentQuestion) => {
        setEditIndex(index); // Set the index of the question being edited
        setEditedQuestion(currentQuestion); // Set the current question in the edit state
    };

// Save the edited question and re-fetch the AI response
const saveEditedQuestion = async (index) => {
    if (editedQuestion.trim()) {
        setLoading(true);
        try {
            const requestBody = {
                question: editedQuestion,
                use_default: useDefaultPDF,
            };
            const response = await fetch('http://localhost:8000/ask_question/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to get a response");
            }

            const updatedConversation = [...conversation];
            updatedConversation[index] = {
                question: editedQuestion,
                response: result.response,
            };
            setConversation(updatedConversation);
            setEditIndex(null); // Exit edit mode
            setEditedQuestion(''); // Clear edit state
        } catch (error) {
            console.error('Error fetching response for edited question:', error);
        } finally {
            setLoading(false);
        }
    }
};

    // Focus input and set cursor at the end of text when editing starts
    useEffect(() => {
        if (editIndex !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(editedQuestion.length, editedQuestion.length);
        }
    }, [editIndex, editedQuestion]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl white font-bold mb-4">Multi PDF Chat</h1>

            {/* Toggle between Default PDF and Uploaded PDFs */}

            {/* Template Questions */}
            <TemplateQuestions onTemplateClick={askQuestion} />

            <div className="mb-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={useDefaultPDF}
                        onChange={() => setUseDefaultPDF(!useDefaultPDF)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">National Education Policy 2020(default pdf)</span>
                </label>
            </div>
            {/* File upload section */}
            {!useDefaultPDF && (
                <div className="mb-4">
                    <input
                        type="file"
                        multiple
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="mb-2"
                    />
                    <button
                        onClick={uploadFiles}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : 'Upload PDFs'}
                    </button>
                </div>
            )}

            {/* Conversation chat UI */}
            <div className="bg-gray-100 p-4 rounded max-h-[500px] overflow-y-scroll mb-4">
                {conversation.map((chat, index) => (
                    <div key={index} className="mb-4">
                        <div className="text-right">
                            <div className="bg-blue-500 text-white p-2 rounded flex items-center">
                                {/* Inline editing for the question */}
                                {editIndex === index ? (
                                    <input
                                        type="text"
                                        ref={inputRef} // Input reference
                                        value={editedQuestion}
                                        onChange={(e) => setEditedQuestion(e.target.value)}
                                        className="bg-blue-500 text-white p-2 border-none focus:ring-0"
                                        style={{ width: `${editedQuestion.length + 1}ch` }} // Dynamically adjust width based on length
                                    />
                                ) : (
                                    <p>{chat.question}</p>
                                )}

                                <button
                                    onClick={() =>
                                        editIndex === index
                                            ? saveEditedQuestion(index)
                                            : startEditing(index, chat.question)
                                    }
                                    className="ml-2 text-white hover:text-gray-300"
                                >
                                    <FiEdit />
                                </button>
                                <button
                                    onClick={() => copyToClipboard(chat.question)}
                                    className="ml-2 text-white hover:text-gray-300"
                                >
                                    <FiCopy />
                                </button>
                            </div>
                        </div>
                        <div className="text-left mt-2">
                            <div className="bg-gray-300 text-black p-2 rounded flex items-center">
                                <p>{chat.response}</p>
                                <button
                                    onClick={() => copyToClipboard(chat.response)}
                                    className="ml-2 text-black hover:text-gray-600"
                                >
                                    <FiCopy />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Question input and button */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Ask a question about the PDFs"
                    value={question}
                    onChange={handleQuestionChange}
                    className="border p-2 rounded w-full mb-2 text-gray-800"
                />
                <button
                    onClick={askQuestion}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? 'Asking...' : 'Ask Question'}
                </button>
            </div>

    {/* Sign Out Button */}
    <button onClick={signOut} className="mt-6 bg-gray-800 text-white py-2 px-4 rounded">
        Sign Out
      </button>
    </div>
  );
}

export default MultiPDFPage;
