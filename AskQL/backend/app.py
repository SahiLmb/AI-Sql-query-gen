from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI()

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

# Connect to SQLite
def get_db_connection():
    conn = sqlite3.connect("multiinfo.db")
    conn.row_factory = sqlite3.Row  # This will allow for dict-like access to rows
    return conn

# Create a table for storing queries and responses
def create_query_table():
    conn = get_db_connection()
    conn.execute("""
    CREATE TABLE IF NOT EXISTS queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_input TEXT NOT NULL,
        response TEXT NOT NULL
    );
    """)
    conn.commit()
    conn.close()

# Run the function to ensure the table exists
create_query_table()

class QueryRequest(BaseModel):
    user_input: str = Form(...)

# Handle file upload and keep track of uploaded databases
@app.post("/upload-database/")
async def upload_database(file: UploadFile = File(...)):
    db_path = f"databases/{file.filename}"  # Save the file in a 'databases' directory
    os.makedirs('databases', exist_ok=True)  # Ensure the directory exists

    with open(db_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    uploaded_databases.append(file.filename)  # Add the uploaded database to the list

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all table names and columns
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    db_structure = {}
    for table in tables:
        table_name = table[0]
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        db_structure[table_name] = column_names
        
    conn.close()
    
    # Store the uploaded database structure in SQLite
    conn = get_db_connection()
    conn.execute("INSERT INTO uploaded_databases (filename, structure) VALUES (?, ?)", (file.filename, str(db_structure)))
    conn.commit()
    conn.close()
    
    return {"message": "Database uploaded successfully", "filename": file.filename}

# Handle user query submission and record the conversation
@app.post("/query/")
async def query_database(request: QueryRequest):
    user_input = request.user_input
    
    # Generate SQL query using AI model
    sql_query = generate_sql_query(user_input)
    
    # Execute the query and get results
    query_results = execute_sql_query(sql_query)

    # Format the response into a conversational form
    formatted_answer = format_response(user_input, query_results)
    
  # Save the query and response in the database
    conn = get_db_connection()
    conn.execute("INSERT INTO queries (user_input, response) VALUES (?, ?)", (user_input, formatted_answer))
    conn.commit()
    conn.close()

    return {"response": formatted_answer}

# Get the list of uploaded databases
@app.get("/uploaded-databases/")
async def get_uploaded_databases():
    conn = get_db_connection()
    databases = conn.execute("SELECT filename, structure FROM uploaded_databases").fetchall()
    conn.close()

    if databases:
        return {"uploaded_databases": [dict(db) for db in databases]}
    
    return {"message": "No databases have been uploaded yet."}

# Get the list of previous queries
@app.get("/previous-queries/")
async def get_previous_queries():
    conn = get_db_connection()
    queries = conn.execute("SELECT user_input, response FROM queries").fetchall()
    conn.close()

    if queries:
        return {"conversation_history": [dict(query) for query in queries]}
    
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
