from sentence_transformers import SentenceTransformer, util
import nltk
import numpy as np

MODEL_PATH = "Machine Learning/Models/SentenceTransformer"

class EmbeddingModel():
    def __init__(self,path):
        self.model = SentenceTransformer(MODEL_PATH)
        nltk.download('punkt',quiet = True)
        with open(path) as f:
            self.context = f.read()
        self.sentences = nltk.sent_tokenize(self.context)
    
    def word_count(self,sentence):
        return len(nltk.word_tokenize(sentence))

    def create_mappings(self,MAX_LENGTH = 120):
        chunks = []
        curr_count = 0
        chunk = []
        for sentence in self.sentences:
            word_c = self.word_count(sentence)
            curr_count += word_c
            if curr_count < MAX_LENGTH:
                chunk.append(sentence)
            else:
                curr_count = 0
                chunks.append(' '.join(chunk))
                chunk = []
        if chunk:
            chunks.append(' '.join(chunk))
        self.chunks = chunks
        mapping = {}
        for i,chunk in enumerate(chunks):
            embeddings = self.model.encode(chunk)
            mapping[i] = embeddings
        self.mapping = mapping
        return 
    
    def get_closest(self, query):
        q_embedding = self.model.encode(query)
        HIGHEST = 0
        index = -1
        for k,v in self.mapping.items():
            dot_product = np.dot(q_embedding, v)
            if dot_product > HIGHEST:
                HIGHEST = dot_product
                index = k
        return self.chunks[index]

    