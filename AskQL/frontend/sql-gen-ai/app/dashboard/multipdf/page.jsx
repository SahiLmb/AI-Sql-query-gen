"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FiArrowRight, FiCopy, FiEdit, FiUpload } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import TemplateQuestions from '../components/TemplateQuestions';
import { useClerk } from '@clerk/nextjs';

const MultiPDFPage = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [useDefaultPDF, setUseDefaultPDF] = useState(true);
  const [isChatMode, setIsChatMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');

  const { signOut } = useClerk();
  const inputRef = useRef(null);

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
      const response = await fetch('/api/process_pdfs', {
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
      };
      const response = await fetch('/api/ask_question', {
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
        };
        const response = await fetch('/api/ask_question', {
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
                <div className="bg-blue-500 text-white p-2 rounded flex items-center justify-between">
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
              <div className="text-left mt-2">
                <div className="bg-gray-300 text-black p-2 rounded flex items-center justify-between">
                  <p>{chat.response}</p>
                  <button onClick={() => copyToClipboard(chat.response)} className="hover:text-gray-600">
                    <FiCopy />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* <button onClick={askQuestion} className="bg-green-500 text-white px-4 py-2 rounded w-full mt-2">
        Ask Question
      </button> */}

      <button onClick={signOut} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Sign Out
      </button>
    </div>
  );
}

export default MultiPDFPage;
