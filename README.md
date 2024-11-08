# 🌐🤖 Mult-AI: Your All-in-One AI Query Solution

Mult-AI is an innovative platform that combines powerful AI capabilities to make querying SQL databases and PDF documents effortless. With Mult-AI, interact seamlessly with databases through natural language and get answers based on PDF content—all within a single, easy-to-use interface!

---

Unlock the power of AI with **Mult-AI** and experience:
- 🗃️ **SQL Query Generation**: Ask questions in plain English and get SQL answers.
- 📄 **Multi PDF Chat**: Upload PDFs and chat with AI to get instant insights from document content.
- 🔒 **User-Friendly Access**: Secure login and personalized dashboard.

**Get started today and transform how you interact with your data!**

## Table of Contents
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Workflow](#project-workflow)
- [Installation](#installation)
- [Setting up Environment Variables](#setting-up-environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)

## Technologies Used

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Marked**: A markdown parser and compiler for converting markdown text to HTML.
- **Axios**: For making API requests from the frontend to the backend.

### Backend
- **FastAPI**: A modern, fast web framework for building APIs with Python 3.7+ based on standard Python type hints.
- **Markdown2**: A Python library to convert markdown text to HTML on the backend.
- **Uvicorn**: An ASGI server for serving FastAPI applications in production.
- **AWS RDS,EC2**: Cloud based data storage for getting public endpoint.

### API
- **Google Gemini API**: Used for extracting texts from pdf and generating natural language response.
- **Groq API**: Used to create and process sql chain and generate response in natural language with respect to the user's question based on database.

### Authentication: Clerk
### Deployment: Vercel (Frontend), Render (Backend)

## Features
- **AI-Generated Responses**: Uses an AI model to generate responses based on user inputs.
- **Multi SQL Query**: Connect to SQL databases, input natural language queries, and receive 
    AI-generated SQL responses.
- **Multi PDF Chat**: Upload PDFs, ask questions, and get answers from AI based on the PDF content.
- **HTML Formatted Output**: Ensures that text is displayed with proper formatting (e.g., bold text) without using markdown symbols.
- **Responsive Design**: Tailwind CSS for a responsive and modern UI.

## Project Workflow

1. **Frontend Development**:
   - The frontend is built with React. User queries are sent from the frontend to the FastAPI backend using Axios.
   - Responses from the backend are rendered using `dangerouslySetInnerHTML` in React, which allows HTML-formatted responses.

2. **Backend Development**:
   - The backend is built with FastAPI. Upon receiving a user query, the backend interacts with the AI model to generate a response.
   - The response from the AI model is processed with `markdown2` to convert markdown syntax to HTML for proper formatting.

3. **Markdown Conversion**:
   - If the AI response contains markdown, it is converted to HTML using `marked` in the frontend.
   - The final response with HTML formatting is then sent to the frontend.

4. **Deployment**:
   - The backend is served using Uvicorn and can be deployed on platforms like Render or AWS.
   - The frontend can be deployed on Vercel or Netlify for easy hosting and scalability.

## Installation

### Prerequisites
- Node.js and npm
- Python 3.7+
- Virtual environment (optional but recommended)

### Backend Setup
1. Clone the repository and navigate to the backend directory:
   ```bash
   git clone https://github.com/SahiLmb/AI-Sql-query-gen.git
   cd AskQL/backend

### Install dependencies and activate the virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```
### Run the backend server:
```
uvicorn app:app --reload
```

### Frontend Setup
Navigate to the frontend directory and install dependencies:
```
cd AskQL/frontend/sql-gen-ai
npm install
```
### Run the frontend server:
```
npm run dev
```

### Setting up Environment Variables
Create a .env.local file in the root directory in frontend and add the following environment variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

NEXT_PUBLIC_API_URL=your_api_url
```

### Usage

#### Accessing Multi SQL Query
- Navigate to the Multi SQL Query Feature: Use the "Multi SQL Query" link in the header to go to the SQL querying section.
- Upload SQL Database: Upload your SQL database file to start querying.
- Ask Questions: Enter questions in natural language. The AI model will convert these into SQL queries and fetch answers directly from your database.

#### Accessing Multi PDF Chat
- Navigate to the Multi PDF Chat Feature: Use the "Multi PDF Chat" link in the header.
- Upload PDFs: Upload one or more PDF files.
- Ask Questions: Ask questions about the content in the PDFs. The AI will analyze the content and provide answers based on the information within the uploaded documents.

Once both servers are running, navigate to http://localhost:3000 in your browser to access the application.
Type a query into the chat input box, and receive formatted responses from the AI.

### Contributing
- Fork the repository.
- Create a feature branch (git checkout -b feature/AmazingFeature).
- Commit your changes (git commit -m 'Add some AmazingFeature').
- Push to the branch (git push origin feature/AmazingFeature).
- Open a pull request.



