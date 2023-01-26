from xgboost import XGBClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer, util
from transformers import BertTokenizerFast as BertTokenizer, BertModel, AdamW
import pandas as pd
import numpy as np
import torch
import pickle
import torch.nn as nn
import nltk
import pytorch_lightning as pl
from Bert import ClassifierModel

# nltk.download('punkt')

class AnswerabilityClassifier:
    def __init__(self):
        classifier = ClassifierModel()
        classifier.load_state_dict(torch.load('Machine Learning/Models/AnswerabilityModel.pt', map_location = torch.device('cpu')))
        classifier.eval()
        self.classifier = classifier

    def predict(self,question, context):
        # features = self.create_features(question, context)
        # return self.model.predict_proba(features)[0][1] > 0.4

        string = f'''
        Context: {context};
        Question: {question}
        '''
        encoding = self.classifier.tokenizer(string, 
            max_length = 512, 
            padding = 'max_length',
            truncation = True,
            return_attention_mask = True,
            add_special_tokens = True,
            return_tensors = 'pt')
        
        _, test_prediction = self.classifier(encoding["input_ids"], encoding["attention_mask"])
        test_prediction = test_prediction.flatten().detach().numpy()
        return test_prediction[1] > 0


