# Chat Application with AI-Generated Responses

This chat application leverages AI to generate responses for user queries and provides formatted output without markdown symbols. The app is built using modern frontend and backend technologies, including React, FastAPI, Tailwind CSS, and Markdown-to-HTML processing.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Workflow](#project-workflow)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

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

## Features
- **AI-Generated Responses**: Uses an AI model to generate responses based on user inputs.
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

### Usage
Once both servers are running, navigate to http://localhost:3000 in your browser to access the application.
Type a query into the chat input box, and receive formatted responses from the AI.

### Contributing
- Fork the repository.
- Create a feature branch (git checkout -b feature/AmazingFeature).
- Commit your changes (git commit -m 'Add some AmazingFeature').
- Push to the branch (git push origin feature/AmazingFeature).
- Open a pull request.



