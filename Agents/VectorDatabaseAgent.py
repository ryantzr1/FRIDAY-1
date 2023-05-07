import requests
from langchain.embeddings import HuggingFaceHubEmbeddings
from .ConversationalAgent import ConversationalAgent
from .PromptTemplate import PromptTemplate
from .utils import sum_dict

class VectorDatabaseAgent(ConversationalAgent):
    '''
    Vector database agent
    '''

    def __init__(self, company_info) -> None:
        self.embeddings = HuggingFaceHubEmbeddings()
        self.product_list = company_info["product_list"]
        self.company_name = company_info["company_name"]

    def __str__(self) -> str:
        return "Agent with ability to lookup vector database"

    @property
    def prompt(self) -> None:
        s =  """You are a customer service assistant for {company_name}.
Only answer questions about the module based only on the contexts provided.
Be as concise as possible. Keep your answers short. Only use the part of the context that is relevant to the question.
If the answer cannot be found in the context provided, reply only with "[NO ANSWER]" and stop. Do not add any additional text or reason. Do not provide any additional information not found in the context.
Thus, your answer should ONLY be one of the following: 
-[NO ANSWER] 
- answer from context"""
        return PromptTemplate(s) 

    def generate_answer(self, query, chat_history, system_prompt = None) -> dict:

        if system_prompt is None:
            system_prompt = self.prompt.format({
                "company_name": self.company_name
            })

        user_prompt = self.use_tool(query, chat_history)

        ans_payload = super().generate_answer(
            query = user_prompt,
            chat_history = chat_history,
            system_prompt = system_prompt
        )
        # ans_payload["usage"] = sum_dict(ans_payload["usage"], self.usage)
        return ans_payload
    
    def use_tool(self, query, chat_history) -> str:
        
        # namespace = self.get_product(query, chat_history)
        # namespace = self.company_name.lower() + "-" + namespace

        # docs = self.docsearch.similarity_search(query, k=7, namespace=namespace) 
        contexts = self.ask_grove(query)
        combined = ""
        for i, item in enumerate(contexts):
            combined += f"{i+1}: {item}\n\n"

        user_prompt = '''
        Question: {query}

        Context: {combined}

        Answer:
        '''
        return PromptTemplate(user_prompt).format({
            "query": query,
            "combined": combined
        })
    
    def ask_grove(self, query) -> str:
        ip =  "http://52.192.225.247/"
        r = requests.get(ip + "search", params = {"root_name": self.company_name, "query": query, "k" : 5})
        return r.json()["results"]
    
    def get_product(self, query, chat_history) -> str:
        prompt = '''Given a conversation history, identify what product the customer is talking about

        Conversation history:
        {chat_history}

        Your output should only be one of the following:
        {product_list}
        '''
        formatted_history = "\n".join([f"{message['role']}: {message['content']}" for message in chat_history + [{"role": "user", "content": query}]])
        prompt = PromptTemplate(prompt).format({
            "chat_history": formatted_history,
            "product_list": self.product_list
        })

        product = super().generate_answer(
            query = "What product is the customer talking about? Product:",
            chat_history = chat_history,
            system_prompt = prompt
        )
        self.usage = product["usage"]
        return product['answer'].lower()