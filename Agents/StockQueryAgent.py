from .ConversationalAgent import ConversationalAgent
import pandas as pd 
from .PromptTemplate import PromptTemplate

class StockQueryAgent(ConversationalAgent):
    def __init__(self, company_info) -> None:
        self.company_name = company_info["company_name"]

    def __str__(self) -> str:
        return "Agent with ability to access stock information"

    @property
    def prompt(self) -> None:
        s =  """You are a Customer Service assistant for {company_name}. 
    Current Stock:
    {price_list}
    Your Task:
    - Answer questions about product availability
    - If the customer asks for a product that is not in the stock list, output [NO ANSWER]
    - If the customer asks for multiple products, output the stocks in a nicely formatted table
    - If you are unclear about the product the user is referring to, just output all the products in a nicely formatted table
    
    Your output should either be the stocks, a table or [NO ANSWER]. Do not ask the user to specify their query.
    """
        return PromptTemplate(s)
    
    def generate_answer(self, query, chat_history = list(), system_prompt = None) -> str:

        # eventually can be some api call

        df = pd.read_csv("stocklistdemo.csv")
        formatted_prompt = self.prompt.format({
            "company_name": self.company_name,
            "price_list": df.to_string()
        })
        ans_payload = super().generate_answer(
            query = query,
            chat_history = chat_history,
            system_prompt = formatted_prompt
        )

        if "NO ANSWER" in ans_payload["answer"]:
            ans_payload["answer"] = "Sorry we do not have that product"

        return ans_payload
    
