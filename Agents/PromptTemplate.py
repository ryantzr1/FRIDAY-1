class PromptTemplate:
    def __init__(self, s: str) -> None:
        self.str = s.replace("\t", "").replace("  ", " ")

    def format(self, params: dict) -> str:
        return self.str.format(**params)