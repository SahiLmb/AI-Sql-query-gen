import os
import io
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langdetect import detect
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from deep_translator import GoogleTranslator  # Use deep-translator instead of googletrans


# Initialize environment variables and translator
load_dotenv()

# Configure Google Generative AI
import google.generativeai as genai
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Helper functions
def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_file = io.BytesIO(pdf)
        pdf_reader = PdfReader(pdf_file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200, length_function=len)
    return text_splitter.split_text(text)

def get_vectorstore(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    return FAISS.from_texts(texts=text_chunks, embedding=embeddings)

def get_conversational_chain(vectorstore):
    prompt_template = """
    You are a helpful assistant. Answer the question based on the provided context with a structured response:
    
    - Briefly introduce if relevant.
    - Use clear headings or bullet points if applicable.
    - Conclude with a summary if the answer is lengthy.

    Context:
    {context}

    Question:
    {question}

    Answer:
    """
    model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.7, top_p=0.9)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    qa_chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)

    return ConversationalRetrievalChain.from_llm(
        llm=model,
        retriever=vectorstore.as_retriever(),
        memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    )

def process_default_pdf():
    default_pdf_path = os.path.join("data", "NEP.pdf")
    with open(default_pdf_path, "rb") as f:
        pdf_docs = [f.read()]
    raw_text = get_pdf_text(pdf_docs)
    text_chunks = get_text_chunks(raw_text)
    vectorstore = get_vectorstore(text_chunks)
    return get_conversational_chain(vectorstore)

def detect_and_translate_to_english(query):
    lang = detect(query)
    if lang == 'hi' or is_hinglish(query):
        return GoogleTranslator(src='auto', dest='en').translate(query), lang
    return query, lang

def is_hinglish(query):
    hinglish_keywords = ['kaise', 'hai', 'kya', 'bhi', 'kar', 'hoga', 'iski']
    return any(word in query.lower() for word in hinglish_keywords)
