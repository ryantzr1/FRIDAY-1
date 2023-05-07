import openai
import os 
import pytz
from fastapi import FastAPI
from api.api_keys import *
from Agents import *
from Agents.utils import *

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
DIMENSIONS = 768
openai.api_key = os.getenv("OPENAI_API_KEY")
tz = pytz.timezone('Asia/Singapore')

### APP ###

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "alive"}

@app.get("/predict")
def predict(question: str, chat_history: list, company_info: dict) -> dict:
    router = ToolSelectionAgent(company_info)
    agent, tool_selection_usage = router.route(question, chat_history)
    
    ans_payload = agent.generate_answer(question, chat_history)
    ans = ans_payload["answer"]
    usage = sum_dict(tool_selection_usage, ans_payload["tool_selection_usage"])
    return {
        "question": question,
        "answer": ans,
        "usage": usage,
        "agent": str(agent)
    }
