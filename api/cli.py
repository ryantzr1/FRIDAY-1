from langchain.vectorstores import Pinecone
from langchain.embeddings import HuggingFaceHubEmbeddings
from langchain.embeddings.openai import OpenAIEmbeddings
import openai
import pinecone
import os 
from api_keys import *
from utils import *

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ['PINECONE_API_ENV'] = PINECONE_API_ENV
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
os.environ["HUGGINGFACEHUB_API_TOKEN"] = HUGGINGFACEHUB_API_TOKEN
DIMENSIONS = 768

pinecone.init(api_key=os.environ["PINECONE_API_KEY"], api_env=os.environ['PINECONE_API_ENV'])
index_name = "airbnb"

### STATE ###

STATE = [
    {"role": "system", "content": system_prompt}
]
TOKENS = 0

if __name__ == "__main__":
    openai.api_key = os.getenv("OPENAI_API_KEY")

    embeddings = HuggingFaceHubEmbeddings()
    docsearch = Pinecone.from_existing_index(index_name, embeddings)
    while True:
        query = input("Question: ")
        if query == "exit":
            break
        ans, userprompt, STATE = generate_answer(query, docsearch, STATE, False)
        print(ans['choices'][0]['message']['content'])
        TOKENS += ans["usage"]["total_tokens"]
        print("\n")

    conversation = ""
    for m in STATE:
        if (m['role'] == "user"):
            conversation += f"User: {m['content']}"
        elif (m['role'] == "assistant"):
            conversation += f"Assistant: {m['content']}"
        conversation += "\n"

    print("\n\n")
    print(f"Total tokens used: {TOKENS}, Estimated cost: ${TOKENS/1000*0.002:0.5f}")