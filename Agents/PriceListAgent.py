from .ConversationalAgent import ConversationalAgent
import pandas as pd 
from .PromptTemplate import PromptTemplate

class PriceListAgent(ConversationalAgent):
    def __init__(self, company_info) -> None:
        self.company_desc = company_info["company_desc"]

    def __str__(self) -> str:
        return "Agent with ability to access price list"

    @property
    def prompt(self) -> None:
        s =  """You are a Customer Service assistant for {company_desc}. 
    Price List:
    {price_list}
    Your Task:
    - Answer questions about the price list
    - If the customer asks for a price of a product, output the price
    - If the customer asks for a product that is not in the price list, output [NO ANSWER]
    - If the customer asks for multiple prices, output the prices in a nicely formatted table
    - If you are unclear about the product the user is referring to, just output all the products in a nicely formatted table
    
    The customer does not have any information about the price list, so you must always provide a list of options.

    Your output should either be the price, a table or [NO ANSWER]. Do not ask the user to specify their query.
    """
        return PromptTemplate(s)
    
    def generate_answer(self, query, chat_history = list(), system_prompt = None) -> dict:

        # eventually can be some api call

        df = pd.read_csv("pricelistdemo.csv")
        formatted_prompt = self.prompt.format({
            "company_desc": self.company_desc,
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
    
