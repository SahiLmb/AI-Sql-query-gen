"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiArrowRight, FiCopy, FiEdit, FiUpload } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import TemplateQuestions from '../components/TemplateQuestions';
import { useClerk } from '@clerk/nextjs';
import { marked } from 'marked';

// Define the backend URL based on the environment
const backendUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://multi-ai-r4v7.onrender.com'
    : 'http://localhost:8000';

const MultiPDFPage = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('English');  // New state for language
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [useDefaultPDF, setUseDefaultPDF] = useState(true);
  const [isChatMode, setIsChatMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');

  const { signOut } = useClerk();
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch the default PDF when the component mounts
    const fetchDefaultPDF = async () => {
      try {
        const response = await fetch(`${backendUrl}/load_default_pdf`);
        const result = await response.json();

        if (response.ok) {
          setPdfFiles(result.pdfFiles); // Assuming result contains pdfFiles array
        } else {
          console.error('Failed to load default PDF:', result.error);
        }
      } catch (error) {
        console.error('Error fetching default PDF:', error);
      }
    };

    fetchDefaultPDF();
  }, []);

  const handleTemplateClick = (selectedQuestion) => {
    setQuestion(selectedQuestion);
  };

  const handleFileChange = (event) => {
    setPdfFiles(Array.from(event.target.files));
    setUseDefaultPDF(false);
  };

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleFileChangeAndProcess = async (event) => {
    setLoading(true);
    const files = Array.from(event.target.files);
    setPdfFiles(files);
    setUseDefaultPDF(false);
  
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
  
    try {
      const response = await fetch(`${backendUrl}/process_pdfs/`, {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        alert('PDFs uploaded and processed successfully!');
      } else {
        throw new Error(result.error || 'Failed to process PDFs');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error processing PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) {
      alert('Please enter a question.');
      return;
    }
    setIsChatMode(true); // Enter chat mode
    setLoading(true);
    try {
      const requestBody = {
        question,
        use_default: useDefaultPDF,
        language,  // Passing the selected language here
      };
      const response = await fetch(`${backendUrl}/ask_question/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get a response');
      }

      setConversation((prev) => [
        ...prev,
        { question, response: result.response },
      ]);
      setQuestion('');
    } catch (error) {
      console.error('Error asking question:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const startEditing = (index, currentQuestion) => {
    setEditIndex(index);
    setEditedQuestion(currentQuestion);
  };

  const saveEditedQuestion = async (index) => {
    if (editedQuestion.trim()) {
      setLoading(true);
      try {
        const requestBody = {
          question: editedQuestion,
          use_default: useDefaultPDF,
          language,  // Passing the selected language here
        };
        const response = await fetch(`${backendUrl}/ask_question/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to get a response');
        }

        const updatedConversation = [...conversation];
        updatedConversation[index] = {
          question: editedQuestion,
          response: result.response,
        };
        setConversation(updatedConversation);
        setEditIndex(null);
        setEditedQuestion('');
      } catch (error) {
        console.error('Error fetching response for edited question:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearChat = () => {
    setConversation([]);
    setIsChatMode(false); // Reset chat mode
  };

  useEffect(() => {
    if (editIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(editedQuestion.length, editedQuestion.length);
    }
  }, [editIndex, editedQuestion]);

  


  // UI 

  return (
    <div className="flex flex-col items-center justify-between h-screen p-4 bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 mt-6 text-center">Multi PDF Chat</h1>

     {/* Show Template Questions and Initial Controls Only Before Chat Mode */}
      {!isChatMode && (
        <>
          <TemplateQuestions onTemplateClick={handleTemplateClick} />
          <div className="mb-4 flex justify-center items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={useDefaultPDF}
                onChange={() => setUseDefaultPDF(!useDefaultPDF)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
          <span className="ml-2 text-gray-400">Use Default PDF</span>
        </label>
      </div>
      </>
      )}

       {/* Language Selection */}
        <div className="mb-4 flex justify-center items-center">
        <label className="text-gray-400 mr-2">Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 bg-gray-700 text-white rounded"
        >
          <option value="English">English</option>
          <option value="Hinglish">Hinglish</option>
        </select>
      </div>

      {/* Question Input and File Upload Section */}
      <div className="flex mb-4 w-full max-w-2xlrounded-full bg-white shadow p-2 items-center">
        <input
          type="text"
          placeholder="Ask a question about the PDFs"
          value={question}
          onChange={handleQuestionChange}
          className="border p-2 rounded w-full text-gray-800"
        />
       
       {/* Combined Upload and Process Functionality in Icon */}
  <label className="ml-2 p-2 cursor-pointer text-blue-500 relative">
    {loading ? (
      <FaSpinner className="animate-spin" size={24} />
    ) : (
      <FiUpload size={24} />
    )}
    <input
      type="file"
      multiple
      accept="application/pdf"
      onChange={handleFileChangeAndProcess}
      className="hidden"
    />
  </label>
          {/* Ask Question Button */}
        <button
          onClick={askQuestion}
          className="ml-2 bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600"
        >
          <FiArrowRight size={18} />
        </button>
      </div>

      {/* Show Conversation Only After Question is Asked */}
      {isChatMode && conversation.length > 0 && (
        <div className="bg-gray-900 p-4 rounded max-h-[400px] overflow-y-scroll w-full mb-4 flex-1">
          {conversation.map((chat, index) => (
            <div key={index} className="mb-4">
              <div className="text-left">
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
                    <p>{chat.question}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => (editIndex === index ? saveEditedQuestion(index) : startEditing(index, chat.question))}
                      className="hover:text-gray-300"
                    >
                      <FiEdit />
                    </button>
                    <button onClick={() => copyToClipboard(chat.question)} className="hover:text-gray-300">
                      <FiCopy />
                    </button>
                  </div>
                </div>
              </div>
              {/* Conversation box */}
              <div className="text-left mt-3">
                <div className="bg-gray-800 text-white p-4 rounded-xl flex items-start justify-between">
                <div className="bg-gray-800 text-white p-3 rounded mt-2" dangerouslySetInnerHTML={{ __html: marked(chat.response) }} />
                  <button onClick={() => copyToClipboard(chat.response)} className="hover:text-gray-600">
                    <FiCopy />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    {isChatMode && (
            <button onClick={clearChat} className="bg-gray-700 text-white px-4 py-2 rounded-full mb-4 hover:bg-gray-600">
              Clear Chat
            </button>
          )}

      <button onClick={signOut} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full">
        Sign Out
      </button>
    </div>
  );
}

export default MultiPDFPage;
