import torch
import pandas as pd
from torch.utils.data import DataLoader
from transformers import AdamW
from transformers import T5ForConditionalGeneration, T5Tokenizer, AdamW 
import sys, argparse, subprocess, os


def pip_install(package):
    subprocess.call([sys.executable, "-m", "pip", "install", package, "--upgrade"])

pip_install("pytorch_lightning")

from pytorch_lightning.callbacks import ModelCheckpoint,  TQDMProgressBar
import pytorch_lightning as pl

MODEL_NAME = 't5-large'

N_EPOCHS = 6
MAX_LEN = 512

class Dataset(torch.utils.data.Dataset):
  def __init__(self, data: pd.DataFrame, tokenizer: T5Tokenizer, 
               source_max_token_len: int = MAX_LEN, target_max_token_len: int = 32 ):
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



class DataModule(pl.LightningDataModule):
  def __init__(self, train_df: pd.DataFrame, val_df: pd.DataFrame, test_df: pd.DataFrame, tokenizer:T5Tokenizer, 
               batch_size: int = 8, source_max_token_len: int = MAX_LEN, target_max_token_len: int = 32):
    super().__init__()
    self.batch_size = batch_size
    self.train_df = train_df.reset_index(drop=True)
    self.val_df = val_df.reset_index(drop=True)
    self.test_df = test_df.reset_index(drop=True)
    self.tokenizer = tokenizer
    self.source_max_token_len = source_max_token_len
    self.target_max_token_len = target_max_token_len

  def setup(self, stage = None):
    self.train_dataset = Dataset(self.train_df, self.tokenizer, self.source_max_token_len,self.target_max_token_len)
    self.test_dataset = Dataset(self.test_df, self.tokenizer, self.source_max_token_len,self.target_max_token_len)
    self.val_dataset = Dataset(self.val_df, self.tokenizer, self.source_max_token_len,self.target_max_token_len)

  def train_dataloader(self):
    return DataLoader(self.train_dataset, batch_size = self.batch_size, shuffle = True, num_workers = 8)
  
  def val_dataloader(self):
    return DataLoader(self.val_dataset, batch_size = 1, num_workers = 8)

  def test_dataloader(self):
    return DataLoader(self.test_dataset, batch_size = 1, num_workers = 8)
  



class QandAModel(pl.LightningModule):
  def __init__(self, model_name,lr = 1e-5):
    super().__init__()
    self.model = T5ForConditionalGeneration.from_pretrained(model_name, return_dict = True)
    self.lr = lr

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
    return AdamW(self.parameters(),lr=self.lr)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    
    parser.add_argument('--epochs', type=int, default=1)
    parser.add_argument('--model-name', type=str, default='t5-large')
    parser.add_argument('--train-batch-size', type=int, default=16)

    parser.add_argument('--model-dir', type=str, default=os.environ['SM_MODEL_DIR'])
    parser.add_argument('--n-gpus', type=str, default=os.environ['SM_NUM_GPUS'])
    parser.add_argument('--train-dir', type=str, default=os.environ['SM_CHANNEL_TRAIN'])
    parser.add_argument('--valid-dir', type=str, default=os.environ['SM_CHANNEL_VALID'])
    parser.add_argument('--test-dir', type=str, default=os.environ['SM_CHANNEL_TEST'])

    args, _ = parser.parse_known_args()

    print('Loading Data')
    train_df = pd.read_csv(args.train_dir)
    val_df = pd.read_csv(args.valid_dir)
    test_df = pd.read_csv(args.test_dir)

    tokenizer = T5Tokenizer.from_pretrained(args.model_name)
    
    data_module = DataModule(train_df,val_df, test_df, tokenizer, batch_size = args.train_batch_size)
    data_module.setup()

    model = QandAModel(args.model_name)

    check_point = ModelCheckpoint(dirpath = "checkpoints",filename = 'best-checkpoint',
                              save_top_k = 1, verbose = True, monitor = "val_loss", 
                              mode = "min")
                      
    print('Finding Best LR')
    trainer = pl.Trainer(gpus =1)
    lr_finder = trainer.tuner.lr_find(model, data_module, max_lr=1e-3, min_lr=1e-6, num_training=100)
    new_lr = lr_finder.suggestion()
    model.lr = new_lr

    print('Training Begins')
    trainer = pl.Trainer(callbacks = [check_point,TQDMProgressBar(refresh_rate=30)], 
                     max_epochs = args.epochs, accelerator ='gpu',devices = args.n_gpus)
    trainer.fit(model, data_module)