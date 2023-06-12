# F.R.I.D.A.Y

The purpose of our project is to create a self-learning API tool that allows small businesses to get on-demand AI customer service anytime, anywhere. This tool will be able to handle all types of customer questions through on-the-job training and learning from customer-seller conversations. By providing 24/7 support, continuously improving and adapting over time, and freeing up valuable time and resources for small businesses, our solution aims to improve customer satisfaction and loyalty, and help small businesses grow and become more profitable.

## Video Demo
-----


https://user-images.githubusercontent.com/81154837/212688498-3e8431ff-83a4-44d5-aeb4-90a6b908590b.mp4



Here we connect a Telegram channel to our API which allows a customer to interact with a drone company and find out more about their [product](https://www.amazon.com/DJI-Hasselblad-Professionals-Omnidirectional-Transmission/dp/B0BGMJN6MD/ref=sr_1_2?keywords=dji+mavic&qid=1673873146&sprefix=dji+mavi%2Caps%2C413&sr=8-2).



## Webpage
-----
Link to Webpage: https://friday-webpage.herokuapp.com/ 



## Question - Answering Pipeline 
-----
<p align="center">
  <img width="804" alt="image" src="https://user-images.githubusercontent.com/81154837/215249821-8fb0f80c-766f-4df5-8ab6-4a267642154e.png">
</p>

Our model is a T5 Transformer fine tuned for product question and answering. We chose the T5 Model due to its prowess at both transfer learning and Text-to-text generation. We first store all of the information regarding the product in a vector database. This is done via the use of Sentence Transformers which converts all the information into vectors. 

When we receive our customer query we embed it into a vector in a similar manner. We then compute the dot product of this query vector with all our information vectors to find the most appropriate context. Next, we feed this context and query pair into the Answerability model to determine the likelihood that the answer can be found withint that context. Our Answerability Model is a version of BERT finetuned on SQuAD v2 with an added linear layer and sigmoid function to turn it into a binary classifier model. If the model is not confident in finding an answer, we flag it and request for a human to answer this question. Otherwise, the query and context are fed to T5 to generate the answer.

*We had originally used xGBoost for the answerability model with features extracted from both the Embeddings and TF-IDF vectors of the context and query vectors. While both models had similar accuracy scores, we found that BERT had significantly higher specifity (lower number of false positives) which made it more appropriate. We have included the xGBoost variant for download as well.*

This pipeline allows for the model to learn on the job. As the vector database grows, its answer searching domain grows as well, allowing it to answer more questions, fufilling the needs of both the business and the customer. 


## Model Capabilities
-----
The current version of our model (v1.0 can be found [here](https://drive.google.com/file/d/1j4LY-kXIJsAyoD-zE7AZTDvX5LMRgdmn/view?usp=sharing) is a version of the [T5 Model](https://ai.googleblog.com/2020/02/exploring-transfer-learning-with-t5.html). The dataset we use is a combination of the [Amazon Review Dataset](https://jmcauley.ucsd.edu/data/amazon_v2/index.html) as well as a synthetic dataset generated in `Machine\ Learning/Notebooks/Question.ipynb`. The current version is trained on 3000 rows of data over 6 epochs and the training code can be found in `Machine\ Learning/Notebooks/Train.ipynb`. We have just been given access to AWS Activate credits and we aim to leverage on SageMaker and EC2 to not only train the model at a higher level but also generate a larger synthetic dataset. This section will thus outline the primary features of our model as well as examples we came across during our empirical testing. 

1. Abstractive Question Answering
```
Context: CHORTAU dash cam simultaneous records with Super High Resolution 1080P FHD Lens 170°wide-angle
Question: What type of camera does this dash cam use?
Answer: CHORTAU Dash Cam uses a fHD1080P camera.
```
Here, the model is able to a extract out the information from the given context accurately. Further, the sentence it generates does not exist in the given context. Interestingly enough, it is also able to do some form of Named Entity Recognition by capitalising the words 'Dash' and 'Cam'.


2. Word Association 
```
Context: ... Works with all devices that have a lightning connector and support iOS 10 or later.
Question: Does this earphone work with Apple iphone?
Answer: Yes
```
In this example, we note that neither 'Apple' nor 'iphone' appear in the given context. Yet the model was able to associate the term ios with 'Apple iphone'. Also, it is able to differentiate between a descriptive question in the first example and yes/no questions in this example. 

3. Synthesis 
```
Question: What imaging technology does the drone have?
Answer: It has a 4/3 CMOS camera. It can also record 4K/60fps pictures.
```
Here, the term *imaging technology* is extremely vague which might stump even human customer service agents. Yet the model is able to synthesis an adequate summary of the drone's capabilities. 

4. Question Inference
```
Question: Obstacle Avoidance?
Answer: APAS 5.0 - Mavic 3 Classic detects obstacles in all directions and avoids them.
```
We understand that customer service is about increasing customer convienience. Sometimes, customers might not ask questions in the form of full sentences. Our model is more than capable to answer questions in the form of incomplete sentences as well. 


## Usage
-----
This repository also provides a command line interface for the model. To do so on your local machine, carry out the following steps:

1. Clone this repository and run 
```
git clone https://github.com/nreHieW/FRIDAY.git <Your Directory>
pip3 install -r requirements.txt
```

2. Download the models either from [here](https://drive.google.com/file/d/1j4LY-kXIJsAyoD-zE7AZTDvX5LMRgdmn/view?usp=sharing) or run the folowing command:
```
pip install gdown
gdown 1j4LY-kXIJsAyoD-zE7AZTDvX5LMRgdmn
```

3. Unzip the model 
```
unzip Downloads/Models.zip -d /Machine\ Learning
```

4. Add any information you require into a `context.txt` file. This can be anything from product descriptions to reviews and FAQs, simply copy and paste it into `context.txt`. 

5. Run the following command:
```
python3 Machine\ Learning/src/cli.py
```


## Acknowledgements 
-------
We would like to cite the following papers in our work:

Ni, J., Li, J., &amp; McAuley, J. (2019). Justifying recommendations using distantly-labeled reviews and fined-grained aspectsJianmo . Empirical Methods    in Natural Language Processing (EMNLP). Retrieved 2023, from http://cseweb.ucsd.edu/~jmcauley/pdfs/emnlp19a.pdf 

Raffel, C., Shazeer, N., Roberts, A., Lee, K., Narang, S., Matena, M., Zhou, Y., Li, W., &amp; Liu, P. J. (2020, July 28). Exploring the limits of          transfer learning with a unified text-to-text transformer. arXiv.org. Retrieved January 16, 2023, from https://arxiv.org/abs/1910.10683 

Romero, M. (2021). T5 (base) fine-tuned on SQUAD for QG via AP. mrm8488/t5-base-finetuned-question-generation-ap · Hugging Face. Retrieved January 16,      2023, from https://huggingface.co/mrm8488/t5-base-finetuned-question-generation-ap 

Further, we would like to thank [Amazon Web Services (AWS)](https://aws.amazon.com/) and [HuggingFace 🤗](https://huggingface.co/) for providing the infrastructure that made this project possible.
