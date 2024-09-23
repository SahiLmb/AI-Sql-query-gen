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

    return {"message": "Database uploaded successfully", "filename": file.filename}

# Handle user query submission and record the conversation
@app.post("/query/")
async def query_database(request: QueryRequest):
    user_input = request.user_input
    conversation_history.append({"query": user_input})  # Add the query to the conversation history
    
    # Generate SQL query using AI model
    sql_query = generate_sql_query(user_input)
    
    # Execute the query and get results
    query_results = execute_sql_query(sql_query)

    # Format the response into a conversational form
    formatted_answer = format_response(user_input, query_results)
    
    # Save the formatted answer in conversation history
    conversation_history[-1]["answer"] = formatted_answer

    return {"response": formatted_answer}

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
