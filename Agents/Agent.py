from abc import ABC, abstractmethod, ABCMeta, abstractproperty
from .PromptTemplate import PromptTemplate


class Agent(ABC):
    '''
    Abstract class for agents to communicate with OPENAI API
    '''
    @abstractproperty
    def prompt(self) -> PromptTemplate:
        '''
        Prompt for the agent
        '''
        pass

    @abstractmethod
    def generate_answer(self, query, company_name, chat_history = list(), system_prompt = None) -> dict:
        '''
        Generate answer to a query
        '''
        pass


