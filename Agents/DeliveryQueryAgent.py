from .ConversationalAgent import ConversationalAgent
import pandas as pd 
from datetime import datetime
from .PromptTemplate import PromptTemplate

class DeliveryQueryAgent(ConversationalAgent):
    def __init__(self, company_info) -> None:
        self.company_name = company_info["company_name"]

    def __str__(self) -> str:
        return "Agent with ability to access delivery status"

    @property
    def prompt(self) -> None:
        s = """You are a Customer Service assistant for {company_name}. 
    Delivery status:
    {delivery_status}
    Your Task:
    - Answer questions about the delivery status
    - You must first ask the user for their order number
    - If the user does not provide an order number, output [NO ORDER]
    - If the user provides an order number, output the delivery status of the order
    - If the user provides an order number that is not in the database, output [NO ANSWER]

    Current Date: {current_date}
    Current Day: {current_day}
    """
        return PromptTemplate(s)
    
    def generate_answer(self, query, chat_history = list(), system_prompt = None) -> dict:

        df = pd.read_csv("deliverystatusdemo.csv")
        formatted_prompt = self.prompt.format({
            "company_name": self.company_name,
            "delivery_status": df.to_string(),
            "current_date": datetime.now(),
            "current_day": datetime.now().weekday()
        })
        ans_payload = super().generate_answer(
            query = query,
            chat_history = chat_history,
            system_prompt = formatted_prompt,
        )

        if "NO ANSWER" in ans_payload["answer"]:
            ans_payload["answer"] = "Sorry we do not have seem to have a order under that number"
        
        return ans_payload
    
