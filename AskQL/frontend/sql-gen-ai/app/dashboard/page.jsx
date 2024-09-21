// app/dashboard/page.js
'use client'
import { useState } from 'react';
import axios from 'axios';
import { useClerk } from '@clerk/clerk-react'; // Clerk hook

export default function Dashboard() {
  const { signOut } = useClerk(); // Clerk sign-out functionality
  const [file, setFile] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [conversation, setConversation] = useState([]); // to store chat history
  const [typing, setTyping] = useState(''); // typing effect
  const [copied, setCopied] = useState(false); // to track copy status


  // Handle file upload
  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  // Send the uploaded file to the backend
  const handleFileSubmit = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:8000/upload-database/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.message);
    } catch (error) {
      console.error('Error uploading database:', error);
    }
  };

  // Handle user query input and send to the backend
  const handleQuerySubmit = async () => {
    try {
      const res = await axios.post('http://localhost:8000/query/', {
        user_input: userInput,
      });

      setTyping(''); // reseting typing state
      setConversation([...conversation, { query: userInput, answer: '...'}])

      setUserInput(''); // reset input

      // Simulate typing effect
      const newResponse = res.data.response;
      let typingIndex = 0;

      const typingInterval = setInterval(() => {
        if (typingIndex < newResponse.length){
          setTyping(prev => prev + newResponse[typingIndex]);
          typingIndex++;
        }
        else{
          clearInterval(typingInterval);
          setConversation(prev => [...prev.slice(0,-1), { query: userInput, answer: newResponse}]);
          setTyping(''); // clear typing effect once completed
        }
      }, 50); // typing speed
    } catch (error) {
      console.log('Error querying the database:', error);
    }
  };

  // Handle copying text to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // show 'Copied!' for 2 seconds
  };  

  // Clear chat history
  const handleClearChat = () => {
    setConversation([]);
    setTyping('');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">AI-Powered SQL Query Generator</h1>

      {/* Upload the database */}
      <input type="file" onChange={handleFileUpload} className="mb-4"/>
      <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4" onClick={handleFileSubmit}>
        Upload Database
      </button>

      {/* User input to ask query */}
      <div className="mb-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask your query..."
          className="border text-gray-900 rounded p-2 w-full mb-2"
          />
          <button className="bg-green-500 text-white py-2 px-4 rounded" onClick={handleQuerySubmit}>
            Submit Query
          </button>
          <button className="bg-red-500 text-white py-2 px-4 rounded ml-2" onClick={handleClearChat}>
            Clear Chat
          </button>
        </div>
  
        {/* Display chat history */}
        <div className="bg-gray-100 p-4 rounded shadow-md h-64 overflow-y-auto">
          {conversation.length === 0 ? (
            <p className="text-gray-900">No conversation yet.</p>
          ) : (
            conversation.map((chat, index) => (
              <div key={index} className="mb-2 text-gray-900">
                <p className="font-bold">You: {chat.query}</p>
                <p className="ml-4">Bot: {chat.answer === '...' ? typing: chat.answer}</p>

              {/* Copy button for each response */}
              {chat.answer !== '...' && (
                <button
                  className="text-blue-500 underline text-sm ml-4"
                  onClick={() => handleCopy(chat.answer)}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
  
        <button onClick={signOut} className="mt-6 bg-gray-800 text-white py-2 px-4 rounded">
          Sign Out
        </button>
      </div>
    );
  }
  
         
