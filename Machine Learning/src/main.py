import torch
from transformers import AutoTokenizer, T5Tokenizer,T5ForConditionalGeneration
from Model import *
from Embeddings import *

CONTEXT_PATH = 'context.txt'

def generate_answer(trained_model,question):
  source_encoding = trained_model.tokenizer(
      question['Question'],
      question['Context'],
      max_length = 396,
      padding = "max_length",
      truncation = 'only_second',
      return_attention_mask=True,
      add_special_tokens = True,
      return_tensors ='pt'
  )

  generated_ids = trained_model.model.generate(
      input_ids = source_encoding['input_ids'],
      attention_mask = source_encoding['attention_mask'],
      num_beams = 1,
      max_length = 80,
      early_stopping = True,
      use_cache = True
  )
  preds = [
      trained_model.tokenizer.decode(id,skip_special_tokens = True,clean_up_tokenization_spaces = True) for id in generated_ids
  ]

  return "".join(preds)

def generate_question(question,context):
  return {
      'Question': question,
      'Context': context,
  }

if __name__ == "__main__":
    print('Initialising Database...             ', end = '\r')
    embeddings = EmbeddingModel(CONTEXT_PATH)
    embeddings.create_mappings()
    print('Database Initialised...             ')

    trained_model = QandAModel()
    trained_model.eval()
    while True:
        question = input('Question: ')
        if question == 'exit':
            break
        context = embeddings.get_closest(question)
        answer = generate_answer(trained_model,generate_question(question,context))
        print(answer)
