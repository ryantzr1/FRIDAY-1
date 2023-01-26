from transformers import BertTokenizerFast as BertTokenizer, BertModel, AdamW
import torch
import torch.nn as nn
import pytorch_lightning as pl
BERT_MODEL_NAME = 'bert-base-cased'

class ClassifierModel(pl.LightningModule):
  def __init__(self,lr = 1e-5):
    super().__init__()
    self.model = BertModel.from_pretrained(BERT_MODEL_NAME, return_dict = True)
    self.lr = lr
    self.classifier = nn.Linear(self.model.config.hidden_size,2)
    self.criterion = nn.BCELoss()
    self.tokenizer = BertTokenizer.from_pretrained("Machine Learning/Models/BertTokenizer")

  def forward(self, input_ids, attention_mask, labels = None):
    output = self.model(input_ids = input_ids, attention_mask = attention_mask)
    output = self.classifier(output.pooler_output)
    output = torch.sigmoid(output)    
    loss = 0
    if labels is not None:
        loss = self.criterion(output, labels)
    return loss, output

  def configure_optimizers(self):
    return AdamW(self.parameters(),lr=self.lr)