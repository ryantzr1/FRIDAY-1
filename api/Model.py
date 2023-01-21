from transformers import T5ForConditionalGeneration, AdamW, T5Tokenizer
import pytorch_lightning as pl
import torch
import pandas as pd
from torch.utils.data import DataLoader
from pytorch_lightning.callbacks import TQDMProgressBar

MODEL_PATH = "Machine Learning/Models/Model_v1.0"
TOKENIZER_PATH = "Machine Learning/Models/Model_v1.0"

class QandAModel(pl.LightningModule):
    '''
    Model that allows to generate answers to questions given a context using T5 fine tuned using custom dataset. 

    Class is different from the one in train.ipybn because this loads the model locally.
    
    '''

    def __init__(self):
        super().__init__()
        self.model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH,local_files_only=True, return_dict = True)
        self.tokenizer = T5Tokenizer.from_pretrained(TOKENIZER_PATH)
    def forward(self, input_ids, attention_mask, labels = None):
        output = self.model(input_ids = input_ids, attention_mask = attention_mask, labels = labels)
        return output.loss, output.logits

    def training_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, outputs = self(input_ids, attention_mask, labels)
        self.log("train_loss", loss, prog_bar = True, logger = True)
        return loss

    def validation_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, outputs = self(input_ids, attention_mask, labels)
        self.log("val_loss", loss, prog_bar = True, logger = True)
        return loss

    def test_step(self, batch, batch_idx):
        input_ids = batch['input_ids']
        attention_mask = batch['attention_mask']
        labels = batch['labels']
        loss, outputs = self(input_ids, attention_mask, labels)
        self.log("test_loss", loss, prog_bar = True, logger = True)
        return loss

    def configure_optimizers(self):
        return AdamW(self.parameters(),lr=5e-5)


class DataModule(pl.LightningDataModule):
    def __init__(self, train_df: pd.DataFrame,test_df: pd.DataFrame, tokenizer:T5Tokenizer, 
                batch_size: int = 8, source_max_token_len: int = 396, target_max_token_len: int = 32):
        super().__init__()
        self.batch_size = batch_size
        self.train_df = train_df.reset_index(drop=True)
        self.test_df = test_df.reset_index(drop=True)
        self.tokenizer = tokenizer
        self.source_max_token_len = source_max_token_len
        self.target_max_token_len = target_max_token_len

    def setup(self, stage = None):
        self.train_dataset = Dataset(self.train_df, self.tokenizer, self.source_max_token_len,self.target_max_token_len)
        self.test_dataset = Dataset(self.test_df, self.tokenizer, self.source_max_token_len,self.target_max_token_len)

    def train_dataloader(self):
        return DataLoader(self.train_dataset, batch_size = self.batch_size, shuffle = True, num_workers = 4)
    
    def val_dataloader(self):
        return DataLoader(self.test_dataset, batch_size = 1, num_workers = 4)

    def test_dataloader(self):
        return DataLoader(self.test_dataset, batch_size = 1, num_workers = 4)
    
class Dataset(torch.utils.data.Dataset):
    def __init__(self, data: pd.DataFrame, tokenizer: T5Tokenizer, 
                source_max_token_len: int = 396, target_max_token_len: int = 32 ):
        super().__init__()
        self.tokenizer = tokenizer
        self.data = data
        self.source_max_token_len = source_max_token_len
        self.target_max_token_len = target_max_token_len

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx: int):
        data_row = self.data.iloc[idx]

        source_encoding = self.tokenizer(data_row['Question'], 
            data_row['Context'], 
            max_length = self.source_max_token_len, 
            padding = 'max_length',
            truncation ='only_second',
            return_attention_mask = True,
            add_special_tokens = True,
            return_tensors = 'pt')
        
        target_encoding = self.tokenizer(data_row['Answer'], 
            max_length = self.target_max_token_len, 
            padding = 'max_length',
            truncation = True,
            return_attention_mask = True,
            add_special_tokens = True,
            return_tensors = 'pt')
        
        labels = target_encoding['input_ids']
        labels[labels == self.tokenizer.pad_token_id] = -100 #replace padding tokens 

        return dict(
            question = data_row['Question'],
            context = data_row['Context'],
            answer_text = data_row["Answer"],
            input_ids = source_encoding['input_ids'].flatten(),
            attention_mask = source_encoding["attention_mask"].flatten(),
            labels = labels.flatten()
        )

  