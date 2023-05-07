from .ConversationalAgent import ConversationalAgent
from googlesearch import search
import requests 
from bs4 import BeautifulSoup
from urllib.parse import urlencode
from .PromptTemplate import PromptTemplate
from .utils import sum_dict

class GoogleSearchAgent(ConversationalAgent):
    def __init__(self, company_info) -> None:
        self.company_name = company_info["company_name"]

    def __str__(self) -> str:
        return "Agent with ability to Google Search"

    @property
    def prompt(self) -> None:
        s =  """You are a Question Answering assistant for {company_name}. 
    Your Task:
    - Given some context and a question, answer the question
    - If you cannot answer the question, output [NO ANSWER]
    - Keep the answer short and specific

    Your output should either be a short answer or [NO ANSWER]
    """
        return PromptTemplate(s)
    
    def generate_answer(self, query, chat_history = list(), system_prompt = None) -> dict:
        google_query = self.get_search_query(query)
        top_k_results = self.get_top_k_google_search_results(google_query)
        system_prompt = self.prompt.format({"company_name": self.company_name})

        for result in top_k_results:
            body_text = self.scrape_website(result)
            if body_text != "":
                query = f"Context: {body_text} \nQuery: {query}"
                ans_payload = super().generate_answer(
                    query = query,
                    chat_history = chat_history,
                    system_prompt = system_prompt
                )
                if "NO ANSWER" not in ans_payload["answer"]:
                    ans_payload["usage"] = sum_dict(ans_payload["usage"], self.usage)
                    ans_payload["answer"] = ans_payload["answer"] + "\n Find out more at: " + result
                    return ans_payload

        if "NO ANSWER" in ans_payload["answer"]:
            ans_payload["answer"] = "NO ANSWER"
        
        return ans_payload
    


    def get_search_query(self, query) -> str:
        prompt = """
        You are an assistant trained to teach people how to use google search effectively. 

        Given some question output only the search query that will give the best results.

        Example of good search queries:
        Input: I am interested in italian food, i want to know how to make a good pizza
        Output: Pizza recipe

        Input: Who is the CEO of Apple?
        Output: Apple CEO

        Input: What is the capital of France?
        Output: Capital of France

        A good search query is:
        - short and specific
        - A single question

        Your output should be short and contain only the query. Do not provide any reasoning or explanation.
        """
        q = super().generate_answer(
            query = query,
            chat_history = list(),
            system_prompt = prompt
        )
        self.usage = q["usage"]
        return q
    

    def get_top_k_google_search_results(self, query, k = 3) -> list:
        # Todo catch exception

        headers = {
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0'
        }
        resp = requests.get(self.encode_url(query), headers=headers)
        soup = BeautifulSoup(resp.text, "html.parser")
        result_block = soup.find_all("div", attrs={"class": "g"})
        links  = []
        for result in result_block:
            link = result.find("a", href=True)
            links.append(link['href'])
        return [x for x in links if x.startswith("https://")][:k]

    
    def encode_url(self, string):
        '''Helper function to encode the url'''

        root = "https://www.google.com/search?"
        encoded = root + urlencode({'q': string})
        return encoded
    
    def scrape_website(self, url) -> str:
        headers = {
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0'
        }
        try: 
            r = requests.get(url, headers = headers)
            soup = BeautifulSoup(r.text, 'html.parser')
            body = soup.find("body")
            body_text = body.get_text().replace("\n", " ")
            
            MAX_WORDS = 900
            to_return =  " ".join(body_text.split(" ")[:MAX_WORDS])
        except:
            to_return = ""
        
        return to_return
    
    
