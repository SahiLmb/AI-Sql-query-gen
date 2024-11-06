from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator  # Use deep-translator instead of googletrans
import sql_query  # Import the SQL query logic
from dotenv import load_dotenv
import os
from typing import List

import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# sql processing
# Request schema for SQL Query with user-provided credentials

class Credentials(BaseModel):
    user: str
    password: str
    host: str
    port: str
    database: str
    
class QueryRequest(BaseModel):
    user_query: str
    chat_history: List[dict]  # Ensure chat_history is a list of dicts with keys "user" and "ai"
    credentials: Credentials

@app.post("/sql-query")
async def process_query(request: QueryRequest):
    try:
        # Log request data for debugging (mask password for security)
        logger.info(f"Received query: {request.user_query}")
        logger.info(f"Credentials: user='{request.credentials.user}', host='{request.credentials.host}', port='{request.credentials.port}', database='{request.credentials.database}'")
        logger.info(f"Chat history: {request.chat_history}")
        
        # Initialize the database connection with user-provided credentials
        db = sql_query.init_database(
            user=request.credentials.user,
            password=request.credentials.password,
            host=request.credentials.host,
            port=request.credentials.port,
            database=request.credentials.database
        )
        
        # Process the query and return the response
        response = sql_query.get_response(request.user_query, db, request.chat_history)
        return {"response": response}
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Query processing failed: {e}")

# pdf processing
from pdf_query import (
    process_default_pdf, get_pdf_text, get_text_chunks, get_vectorstore, 
    get_conversational_chain, detect_and_translate_to_english, is_hinglish
)

conversation_chain = process_default_pdf()

@app.post("/process_pdfs/")
async def process_pdfs(files: list[UploadFile] = File(...)):
    global conversation_chain
    pdf_docs = [await file.read() for file in files]
    raw_text = get_pdf_text(pdf_docs)
    text_chunks = get_text_chunks(raw_text)
    vectorstore = get_vectorstore(text_chunks)
    conversation_chain = get_conversational_chain(vectorstore)

    return JSONResponse(content={"status": "success", "message": "PDFs processed successfully."})

@app.get("/load_default_pdf/")
async def load_default_pdf():
    global conversation_chain
    conversation_chain = process_default_pdf()
    return JSONResponse(content={"status": "success", "message": "Default PDF loaded successfully."})

class Question(BaseModel):
    question: str

@app.post("/ask_question/")
async def ask_question(data: Question):
    question_text, original_lang = detect_and_translate_to_english(data.question)
    if conversation_chain is None:
        return JSONResponse(content={"error": "No conversation chain found. Please process PDFs first."}, status_code=400)
    try:
        response = conversation_chain({'question': question_text})
        response_text = response.get('answer', str(response)) if isinstance(response, dict) else str(response)

        if original_lang == 'hi' or is_hinglish(data.question):
            response_text = GoogleTranslator(source='en', target='hi').translate(response_text)

        return JSONResponse(content={"response": response_text})

    except Exception as e:
        print(f"Error processing question: {e}")
        return JSONResponse(content={"error": "Failed to process the question."}, status_code=500)
