# FRIDAY

TODO



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
python Machine\ Learning/src/cli.py
```
