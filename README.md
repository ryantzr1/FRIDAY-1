# FRIDAY

TODO

## Question - Answering Pipeline 
-----

<img width="865" alt="image" src="https://user-images.githubusercontent.com/81154837/212583228-318e0d73-5b75-471e-a0aa-825a1475a715.png">
Our model is a T5 Transformer fine tuned for product question and answering. We first store all of the information regarding the product in a vector database. This is done via the use of Sentence Transformers in `Machine \ Learning/src/Embeddings.py` which converts all the information into vectors. 

When we receive our customer query we embed it into a vector in a similar manner. We then compute the dot product of this query vector with all our information vectors to find the most appropriate context. Next, we feed this context and query pair into the model to generate an answer. 

This pipeline allows for the model to learn on the job. As the vector database grows, its answer searching domain grows as well, allowing it to answer more questions, fufilling the needs of both the business and the customer. 


## Model Capabilities
-----
The current version of our model (v1.0 can be found [here](https://drive.google.com/file/d/1xHvjKEh4drOFQKmfZn2deAdGQgYUvbxi/view?usp=share_link)) is a version of the [T5 Model](https://ai.googleblog.com/2020/02/exploring-transfer-learning-with-t5.html). The dataset we use is a combination of the [Amazon Review Dataset](https://jmcauley.ucsd.edu/data/amazon_v2/index.html) as well as a synthetic dataset generated in `Machine\ Learning/Notebooks/Question.ipynb`. The current version is trained on 3000 rows of data over 6 epochs and the training code can be found in `Machine\ Learning/Notebooks/Train.ipynb`. We have just been given access to AWS Activate credits and we aim to leverage on SageMaker and EC2 to not only train the model at a higher level but also generate a larger synthetic dataset. This section will thus outline the primary features of our model as well as examples we came across during our empirical testing. 

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



## Usage
-----
This repository also provides a command line interface for the model. To do so on your local machine, carry out the following steps:

1. Clone this repository and run 
```
git clone https://github.com/nreHieW/FRIDAY.git <Your Directory>
pip3 install -r requirements.txt
```

2. Download the models either from [here](https://drive.google.com/file/d/1xHvjKEh4drOFQKmfZn2deAdGQgYUvbxi/view?usp=share_link) or run the folowing command:
```
pip install gdown
gdown 1xHvjKEh4drOFQKmfZn2deAdGQgYUvbxi
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

Further, we would like to thank [Amazon Web Services (AWS)](https://aws.amazon.com/) and [HuggingFace 🤗](https://huggingface.co/) for providing the infrastructure that made this project possible
