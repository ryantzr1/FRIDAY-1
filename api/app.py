from fastapi import FastAPI
from .Questions import *
from .Model import *
from .Embeddings import *

CONTEXT_PATH = 'context.txt'

#Setup
embeddings = EmbeddingModel(CONTEXT_PATH)
embeddings.create_mappings()
trained_model = QandAModel()
trained_model.eval()

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/predict")
def predict(question):
    context = embeddings.get_closest(question)
    answer = generate_answer(trained_model,generate_question(question,context))
    return {
        "question": question,
        "context": context,
        "answer": answer,
    }