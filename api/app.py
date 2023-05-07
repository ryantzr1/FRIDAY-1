import openai
import os 
import pytz
import logging
import time
from fastapi import FastAPI, HTTPException, Query, Body
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

@app.post("/predict")
async def predict(
    question: str = Query(..., description="The question to be answered"),
    chat_history: list = Query([], description="The chat history"),
    company_info: dict = Body(..., description="Information about the company"),
) -> dict:
    try:
        start = time.time()
        usable_tools = company_info["usable_tools"] # usable tools 
        usable_tools = [x+"Agent" for x in usable_tools] # for compatibility with tools
        router = ToolSelectionAgent(company_info)
        agent, tool_selection_usage = router.route(question, chat_history)
        if type(agent).__name__ in usable_tools:
            ans_payload = agent.generate_answer(question, chat_history)
            ans = ans_payload["answer"]
            usage = sum_dict(tool_selection_usage, ans_payload["usage"])
        else:
            ans = "",
            usage = tool_selection_usage
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "question": question,
        "answer": ans,
        "usage": usage,
        "agent": str(agent),
        "time_taken": time.time() - start,
    }
