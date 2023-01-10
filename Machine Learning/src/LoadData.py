import pandas as pd 
import gzip
import json
import requests
from io import BytesIO
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class DataLoader:

    def __init__(self, url):
        self.url = url
    
    def download_and_extract(self, url):
        response = requests.get(url, verify=False)
        gzipped_file = BytesIO(response.content)
        with gzip.GzipFile(fileobj=gzipped_file) as f:
            json_bytes = f.read()
        json_str = json_bytes.decode('utf-8')
        return json_str

    def create_dataframe(self, url):
        data = self.download_and_extract(url)
        split_data = data.split('\n')
        dfs = []
        for item in split_data:
            dfs.append(pd.read_json(item, lines=True))
        df = pd.concat(dfs).reset_index(drop=True)
        df['description'] = df['description'].apply(lambda item: ' '.join([y for y in ''.join(item).split('<') if '>' not in y]))
        return df[['title','asin', 'description']].drop_duplicates()