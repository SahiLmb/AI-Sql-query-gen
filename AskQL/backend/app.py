# main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PyPDF2 import PdfReader
import io

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv


# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, or specify your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Global variable to store the conversational chain
conversation_chain = None

# Read PDF and extract text
def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_file = io.BytesIO(pdf)
        pdf_reader = PdfReader(pdf_file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text

# Split text into chunks
def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=200, 
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks

# Create vector store
def get_vectorstore(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    return vectorstore

# Set up the conversational chain
def get_conversational_chain(vectorstore):
    prompt_template = """
    Answer the question as detailed and structured as possible from the provided context. Avoid using markdown symbols or asterisks for formatting. Provide the answer in a conversational manner with clear sentences and proper paragraph structure.
    If the answer is not in the provided context, just say, "answer is not available in the context,"and don't provide the wrong answer.\n\n
    Context:\n{context}?\n
    Question:\n{question}\n
    Answer:
    """

    model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    qa_chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)

    # Create ConversationalRetrievalChain
    conversational_chain = ConversationalRetrievalChain.from_llm(
        llm=model,
        retriever=vectorstore.as_retriever(),
        memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    )

    return conversational_chain

# Function to process the default PDF on startup
def process_default_pdf():
    global conversation_chain
    default_pdf_path = os.path.join("data", "NEP.pdf")

    # Read the default PDF
    with open(default_pdf_path, "rb") as f:
        pdf_docs = [f.read()]

    # Extract text, split into chunks, and create vectorstore
    raw_text = get_pdf_text(pdf_docs)
    text_chunks = get_text_chunks(raw_text)
    vectorstore = get_vectorstore(text_chunks)
    
    # Initialize the conversation chain with the default PDF
    conversation_chain = get_conversational_chain(vectorstore)
    print("Default PDF processed successfully.")

# Call this function to process the default PDF during app startup
process_default_pdf()

# Endpoints
@app.post("/process_pdfs/")
async def process_pdfs(files: list[UploadFile] = File(...)):
    global conversation_chain
    pdf_docs = [await file.read() for file in files]
    raw_text = get_pdf_text(pdf_docs)
    text_chunks = get_text_chunks(raw_text)
    vectorstore = get_vectorstore(text_chunks)
    conversation_chain = get_conversational_chain(vectorstore)

    return JSONResponse(content={"status": "success", "message": "PDFs processed successfully."})


class Question(BaseModel):
    question: str
    
@app.post("/ask_question/")
async def ask_question(data: Question):
    # Access the 'question' attribute from the data object
    question_text = data.question

    # Print the question text being processed for debugging
    print(f"Processing question: {question_text}")
    
    if conversation_chain is None:
        return JSONResponse(content={"error": "No conversation chain found. Please process PDFs first."}, status_code=400)
    
    try:
        # Call conversation_chain with the correct parameter and get the response
        response = conversation_chain({'question': question_text})

        # Ensure that response is JSON serializable
        if isinstance(response, dict) and 'answer' in response:
            response_text = response['answer']
        else:
            response_text = str(response)  # Convert to string in case it's not a dictionary
        
        # Debugging: print response type and content
        print(f"Response type: {type(response_text)}, Response content: {response_text}")
        
        # Return the response as JSON
        return JSONResponse(content={"response": response_text})
    
    except Exception as e:
        # Handle unexpected errors and log them
        print(f"Error processing question: {e}")
        return JSONResponse(content={"error": "Failed to process the question."}, status_code=500)

@app.get("/default_pdf/")
async def get_default_pdf():
    default_pdf_path = os.path.join("data", "NEP.pdf")
    return {"pdf_path": default_pdf_path}










# from fastapi import FastAPI, File, UploadFile, Form
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# import sqlite3
# import os
# from dotenv import load_dotenv
# import google.generativeai as genai

# load_dotenv()

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Database and previous queries history
# uploaded_databases = []  # Store the list of uploaded database files
# conversation_history = []  # Store user queries and responses

# # Initialize generative AI
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
# generation_config = {
#     "temperature": 0.5,
#     "top_p": 0.90,
#     "top_k": 0,
#     "max_output_tokens": 8192
# }
# safety_settings = [
#     {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
#     {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
#     {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
#     {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
# ]
# model = genai.GenerativeModel(model_name="gemini-pro", generation_config=generation_config, safety_settings=safety_settings)

# class QueryRequest(BaseModel):
#     user_input: str = Form(...)


# # Home page
# @app.get("/")
# def index():
#     return{"details": "Welcome!"}

# # Handle file upload and keep track of uploaded databases
# @app.post("/upload-database/")
# async def upload_database(file: UploadFile = File(...)):
#     db_path = f"databases/{file.filename}"  # Save the file in a 'databases' directory
#     os.makedirs('databases', exist_ok=True)  # Ensure the directory exists

#     with open(db_path, "wb") as buffer:
#         buffer.write(file.file.read())
    
#     uploaded_databases.append(file.filename)  # Add the uploaded database to the list

#     return {"message": "Database uploaded successfully", "filename": file.filename}

# # Handle user query submission and record the conversation
# @app.post("/query/")
# async def query_database(request: QueryRequest):
#     user_input = request.user_input
#     conversation_history.append({"query": user_input})  # Add the query to the conversation history
    
#     # Generate SQL query using AI model
#     sql_query = generate_sql_query(user_input)
    
#     # Execute the query and get results
#     query_results = execute_sql_query(sql_query)

#     # Format the response into a conversational form
#     formatted_answer = format_response(user_input, query_results)
    
#     # Save the formatted answer in conversation history
#     conversation_history[-1]["answer"] = formatted_answer

#     return {"response": formatted_answer}

# # Get the list of uploaded databases
# @app.get("/uploaded-databases/")
# async def get_uploaded_databases():
#     if uploaded_databases:
#         return {"uploaded_databases": uploaded_databases}
#     return {"message": "No databases have been uploaded yet."}

# # Get the list of previous queries
# @app.get("/previous-queries/")
# async def get_previous_queries():
#     if conversation_history:
#         return {"conversation_history": conversation_history}
#     return {"message": "No queries have been made yet."}

# def generate_sql_query(user_input):
#     prompt = (f"Generate an SQL query to find information based on the user's question: '{user_input}'. "
#               "Note: The table names are 'PropertyRecords', 'HealthcareRecords', 'FinanceRecords' "
#               "and the columns are 'PropertyID', 'OwnerName', 'Address', 'City', 'State', 'Zipcode', "
#               "'PropertyType', 'MarketValue', 'LastSoldDate' for PropertyRecords; 'RecordID', 'PatientName', "
#               "'Age', 'Gender', 'Diagnosis', 'Treatment', 'DoctorName', 'VisitDate' for HealthcareRecords; "
#               "'RecordID', 'InvestorName', 'InvestmentType', 'AmountInvested', 'ROI', 'InvestmentDate', "
#               "'MaturityDate' for FinanceRecords. Note: Give the query without '''sql at the start and end of the query. just give the query text content.")
#     response = model.generate_content(prompt)
#     return response.text

# def execute_sql_query(query):
#     try:
#         conn = sqlite3.connect("user_db.db")
#         cursor = conn.cursor()
#         cursor.execute(query)
#         results = cursor.fetchall()
#         cursor.close()
#         conn.close()

#         return results
#     except Exception as e:
#         return f"Error executing query: {str(e)}"

# def format_response(user_input, query_results):
#     if not query_results:
#         return "No data found for your query."

#     result_text = f"Found {len(query_results)} results: " + ', '.join([str(item) for sublist in query_results for item in sublist])
    
#     prompt = f"Rephrase this in a more conversational and informative way based on the user's question: '{user_input}'. Here are the details: {result_text}. Please provide a clean, direct response without repeating the question or adding extra formatting."
#     formatted_response = model.generate_content(prompt)
#     return formatted_response.text
