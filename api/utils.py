import openai
import time

### PROMPT TEMPLATES ###

### SYSTEM
system_prompt = '''
You are a chatbot that answers AirBnB questions from hosts.
Only answer questions about the module based soley on the contexts provided.
Be concise. Keep your answers short.
If the answer cannot be found in the context provided, reply only with "[NO ANSWER]" and stop. Do not add any additional text or reason.
'''

## USER
def generate_question(query, docsearch):
    start_time = time.time()
    docs = docsearch.similarity_search(query, k=3) ## Not sure if this affects speed actually 
    contexts = list(set([x.page_content for x in docs])) # Pinecone outputs duplicates
    combined = "\n\n".join(contexts)

    user_prompt = f'''
    Question: {query}

    Context: {combined}

    Answer:
    '''
    print(f"Generated User Prompt in {time.time() - start_time} seconds")
    return user_prompt

def generate_answer(query, docsearch, STATE, update = False):
    user_prompt = generate_question(query, docsearch)
    # print("Generated User Prompt")
    start_time = time.time()
    ans = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages = STATE + [
                {"role": "user", "content": user_prompt},
            ]
        )
    if update:
        STATE.append({"role": "user", "content": query})
        STATE.append({"role": "assistant", "content": ans['choices'][0]['message']['content']})
    print(f"Generated Answer in {time.time() - start_time} seconds")
    return ans, user_prompt, STATE



