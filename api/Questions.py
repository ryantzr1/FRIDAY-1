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