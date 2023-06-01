import fitz
import os
import requests
from api.api_keys import OPENAI_API_KEY

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
DIMENSIONS = 768
GROVE_IP = "http://52.192.225.247/"

def split_tuples(text_tuples):
    questions = []
    current_question = None
    for flag, color, text in text_tuples:
        if (flag == 16) & (color == 0):  # bolded text flag
            if current_question:
                if questions and current_question['question'] == questions[-1]['question']:
                    # update previous question's answer
                    questions[-1]['answer'] += text
                elif len(text.split()) < 3:  # not a question
                    current_question['answer'] += " " + text
                else:  # new question
                    questions.append(current_question)
                    current_question = {'question': text, 'answer': ''}
            else:
                current_question = {'question': text, 'answer': ''}
        else:  # non-bolded text flag
            if current_question:
                current_question['answer'] += " " + text
    if current_question:
        questions.append(current_question)
    return questions

if __name__ == "__main__":
    fname = "A500S.pdf"
    doc = fitz.open(fname)  # open document
    text_tuples = [(s["flags"], s["color"],s["text"]) for page in doc for block in page.get_text("dict")["blocks"] for line in block["lines"] for s in line["spans"]]
    questions = split_tuples(text_tuples)
    questions = [x["question"] + "\n" + x["answer"] for x in questions if x["answer"] != ""]
    