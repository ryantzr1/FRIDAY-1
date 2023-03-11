from fastapi import FastAPI
from langchain.vectorstores import Pinecone
from langchain.embeddings import HuggingFaceHubEmbeddings
import openai
import pinecone
import os 
from api.api_keys import *
from api.utils import *

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ['PINECONE_API_ENV'] = PINECONE_API_ENV
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
os.environ["HUGGINGFACEHUB_API_TOKEN"] = HUGGINGFACEHUB_API_TOKEN
DIMENSIONS = 768

pinecone.init(api_key=os.environ["PINECONE_API_KEY"], api_env=os.environ['PINECONE_API_ENV'])
index_name = "airbnb"

openai.api_key = os.getenv("OPENAI_API_KEY")
embeddings = HuggingFaceHubEmbeddings()
docsearch = Pinecone.from_existing_index(index_name, embeddings)

### STATE ###

STATE = [
    {"role": "system", "content": system_prompt}
]
TOKENS = 0

### APP ###

app = FastAPI()

@app.get("/")
def read_root():
    return {"Test": "Hello World"}

@app.get("/predict")
def predict(query):
    global STATE
    ans, userprompt, STATE = generate_answer(query, docsearch, STATE, False)
    reply = ans['choices'][0]['message']['content']
    tokens = ans["usage"]["total_tokens"]
    print("\n")

    print(f"Total tokens used: {tokens}, Estimated cost: ${tokens/1000*0.002:0.5f}")

    ## Time being 
    STATE = [
    {"role": "system", "content": system_prompt}
    ]

    return {
    "question": query,
    "user_prompt": userprompt,
    "answer": reply,
}
