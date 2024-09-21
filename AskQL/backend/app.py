from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from dotenv import load_dotenv  # Import this to load environment variables
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Adding CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection helper
def get_db_connection():
    conn = sqlite3.connect("multiinfo.db")
    return conn

# Initialize generative AI with your API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
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

# Global variables to store the database structure and conversation history
database_structure = {}
conversation_history = []

# Model to accept user input in POST request
class QueryRequest(BaseModel):
    user_input: str = Form(...)

@app.post("/upload-database/")
async def upload_database(file: UploadFile = File(...)):
    db_path = "user_db.db"
    with open(db_path, "wb") as buffer:
        buffer.write(file.file.read())
        
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
    
    global database_structure
    database_structure = db_structure
    return {"message": "Database uploaded and structure extracted", "structure": db_structure}

@app.post("/query/")
async def query_database(request: QueryRequest):
    global conversation_history
    
    user_input = request.user_input  # Extract user_input from the request body
    
    # Add user input to conversation history
    conversation_history.append({"role": "user", "content": user_input})
    
    # Generate SQL query using AI model
    sql_query = generate_sql_query(user_input)
    
    # Execute the query and get results
    query_results = execute_sql_query(sql_query)

    # Format the response into a conversational form using AI
    formatted_answer = format_response(user_input, query_results)
    
    return {"response": formatted_answer}

def generate_sql_query(user_input):
    prompt = (f"Generate an SQL query to find information based on the user's question: '{user_input}'. "
              "Note: The table names are 'PropertyRecords', 'HealthcareRecords', 'FinanceRecords' "
              "and the columns are 'PropertyID', 'OwnerName', 'Address', 'City', 'State', 'Zipcode', "
              "'PropertyType', 'MarketValue', 'LastSoldDate' for PropertyRecords; 'RecordID', 'PatientName', "
              "'Age', 'Gender', 'Diagnosis', 'Treatment', 'DoctorName', 'VisitDate' for HealthcareRecords; "
              "'RecordID', 'InvestorName', 'InvestmentType', 'AmountInvested', 'ROI', 'InvestmentDate', "
              "'MaturityDate' for FinanceRecords. Note: Give the query without '''sql at the start and end of the query. just give the query text content.")
    response = model.generate_content(prompt)
    print(response.text)
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
    
    prompt = f"Rephrase this in a more conversational and informative way based on the user's question: '{user_input}'. Here are the details: {result_text}. Please provide a clean, direct response without repeating the question or adding extra formatting. The answer should be clear and concise. Note: as its a conversational response, give the response in correct mannser with correct formatting"
    formatted_response = model.generate_content(prompt)
    print(formatted_response.text)
    return formatted_response.text