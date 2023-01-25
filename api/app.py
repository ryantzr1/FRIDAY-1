from fastapi import FastAPI
from Questions import *
from Model import *
from Embeddings import *
from Answerability import *

CONTEXT_PATH = 'context.txt'

#Setup
embeddings = EmbeddingModel(CONTEXT_PATH)
embeddings.create_mappings(MAX_LENGTH=140)
trained_model = QandAModel()
trained_model.eval()
answerability = AnswerabilityModel()

app = FastAPI()

@app.get("/")
def read_root():
    return {"Test": "Hello World"}

@app.get("/predict")
def predict(question):
    context = embeddings.get_closest(question)
    if answerability.predict(question,context):
        answer = generate_answer(trained_model,generate_question(question,context))
    else:
        answer = "I am unable to answer your question, please wait for our customer service representative to answer your question."
    return {
        "question": question,
        "context": context,
        "answer": answer,
    }