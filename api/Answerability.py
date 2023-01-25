from xgboost import XGBClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer
import pandas as pd
import numpy as np
import pickle
import transformers
import pickle
import nltk

nltk.download('punkt')

class AnswerabilityModel:
    def __init__(self):
        with open('Machine Learning/Models/AnswerabilityModel1.pkl', 'rb') as f:
            self.model = pickle.load(f)
            self.tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
            self.tfidf_vectorizer = TfidfVectorizer(stop_words ='english')
            self.sentence_t = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')

    def create_features(self,question, context):
        #HELPERS
        def intersec(q,r):
            return len([x for x in q if x in r])
        
        def vectorize(text):
            return self.tfidf_vectorizer.transform([text]).toarray()[0]

        def tokenize(text):
            return self.tokenizer(text,max_length=512,truncation=True).get('input_ids')
        
        def sentenceTransform(text):
            return self.sentence_t.encode(text)

        def cosine_similarity(a,b):
            return np.dot(a,b)/(np.linalg.norm(a) * np.linalg.norm(b))
        
        def dotproduct(a,b):
            return np.dot(a,b)
        
        def euclid_dist(a,b):
            return np.linalg.norm(a-b)
        self.tfidf_vectorizer.fit([question,context])

        df = pd.DataFrame({'Question':[question],'Context':[context]})
        df['Question_ntokens'] = df['Question'].apply(lambda x:len(tokenize(x)))
        df['Context_ntokens'] = df['Context'].apply(lambda x:len(tokenize(x)))
        df['Question_tokens'] = df['Question'].apply(lambda x:tokenize(x))
        df['Context_tokens'] = df['Context'].apply(lambda x:tokenize(x))
        df['intersec'] = df.apply(lambda row: intersec(row['Question'], row['Context']),axis=1)
        df['intersec_pct'] = df['intersec'] / df['Question_ntokens']
        df['Question_encoded'] = df['Question'].apply(lambda x: sentenceTransform(x))
        df['Context_encoded'] = df['Context'].apply(lambda x: sentenceTransform(x))
        df['Question_tfidf'] = df['Question'].apply(lambda x: vectorize(x))
        df['Context_tfidf'] = df['Context'].apply(lambda x: vectorize(x))

        for m in ['encoded','tfidf']:
            df[f'cosine_sim_{m}'] = df.apply(lambda row: cosine_similarity(row[f'Question_{m}'], row[f'Context_{m}']),axis =1 )
            df[f'dot_prod_{m}'] = df.apply(lambda row: dotproduct(row[f'Question_{m}'], row[f'Context_{m}']),axis =1 )
            df[f'euclid_dist_{m}'] = df.apply(lambda row: euclid_dist(row[f'Question_{m}'], row[f'Context_{m}']),axis =1 )
    
        df.drop(['Question_tokens','Context_tokens','Question_encoded','Context_encoded','Question_tfidf','Context_tfidf','Question','Context'],axis =1 , inplace = True)
        self.df = df
        return df

    def predict(self,question, context):
        features = self.create_features(question, context)
        return self.predict_proba(features)[0][1] > 0.4

