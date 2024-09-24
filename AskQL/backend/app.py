from fastapi import FastAPI, File, UploadFile, Form, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from dotenv import load_dotenv
import google.generativeai as genai
from .database import Base, engine, get_db
from .models import User, Database, Query
from sqlalchemy.orm import Session

load_dotenv()

app = FastAPI()

# Automatically create the tables in PostgreSQL using the models
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database and previous queries history
uploaded_databases = []  # Store the list of uploaded database files
conversation_history = []  # Store user queries and responses

# Initialize generative AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
generation_config = {
    "temperature": 0.5,
    "top_p": 0.90,
    "top_k": 0,
    "max_output_tokens": 8192
}
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]
model = genai.GenerativeModel(model_name="gemini-pro", generation_config=generation_config, safety_settings=safety_settings)

class QueryRequest(BaseModel):
    user_input: str = Form(...)

# Handle file upload and keep track of uploaded databases
@app.post("/upload-database/")
async def upload_database(file_name: str, file_path: str, db: Session = Depends(get_db)):
    # Save the uploaded database details
    new_database = Database(file_name=file_name, file_path=file_path, user_id=1)  # Assuming a user ID for now
    db.add(new_database)
    db.commit()
    return {"message": "Database uploaded successfully"}

# Handle user query submission and record the conversation
@app.post("/query/")
async def query_database(query_text: str, response_text: str, db: Session = Depends(get_db)):
    # Save the user query and its response
    new_query = Query(query_text=query_text, response_text=response_text, user_id=1, database_id=1)  # Assuming IDs for now
    db.add(new_query)
    db.commit()
    return {"message": "Query executed and saved successfully"}

# Get the list of uploaded databases
@app.get("/uploaded-databases/")
async def get_uploaded_databases():
    if uploaded_databases:
        return {"uploaded_databases": uploaded_databases}
    return {"message": "No databases have been uploaded yet."}

# Get the list of previous queries
@app.get("/previous-queries/")
async def get_previous_queries():
    if conversation_history:
        return {"conversation_history": conversation_history}
    return {"message": "No queries have been made yet."}

def generate_sql_query(user_input):
    prompt = (f"Generate an SQL query to find information based on the user's question: '{user_input}'. "
              "Note: The table names are 'PropertyRecords', 'HealthcareRecords', 'FinanceRecords' "
              "and the columns are 'PropertyID', 'OwnerName', 'Address', 'City', 'State', 'Zipcode', "
              "'PropertyType', 'MarketValue', 'LastSoldDate' for PropertyRecords; 'RecordID', 'PatientName', "
              "'Age', 'Gender', 'Diagnosis', 'Treatment', 'DoctorName', 'VisitDate' for HealthcareRecords; "
              "'RecordID', 'InvestorName', 'InvestmentType', 'AmountInvested', 'ROI', 'InvestmentDate', "
              "'MaturityDate' for FinanceRecords. Note: Give the query without '''sql at the start and end of the query. just give the query text content.")
    response = model.generate_content(prompt)
    return response.text

def execute_sql_query(query):
    try:
        conn = sqlite3.connect("user_db.db")
        cursor = conn.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        return results
    except Exception as e:
        return f"Error executing query: {str(e)}"

def format_response(user_input, query_results):
    if not query_results:
        return "No data found for your query."

    result_text = f"Found {len(query_results)} results: " + ', '.join([str(item) for sublist in query_results for item in sublist])
    
    prompt = f"Rephrase this in a more conversational and informative way based on the user's question: '{user_input}'. Here are the details: {result_text}. Please provide a clean, direct response without repeating the question or adding extra formatting."
    formatted_response = model.generate_content(prompt)
    return formatted_response.text
