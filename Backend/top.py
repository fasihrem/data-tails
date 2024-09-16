import praw
from datetime import datetime
import pandas as pd 
from pymongo import MongoClient
import warnings
import time
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bs4 import BeautifulSoup
import requests 

reddit = praw.Reddit(
            client_id='P4-FFLW065bTLnGSqfCnlg',
            client_secret='-EBrPckd7kwt0b8OaxJ-5cfwYRExQw',
            user_agent='MyRedditScraper/1.0 (Macintosh; Intel Mac OS X 14.3.1; Apple Silicon) Python/3.12 (fasihrem@gmail.com)'
        )

print(reddit.read_only)

df2 = pd.DataFrame(columns=[
    "type", "subReddit", "postTitle", "postDesc", "postTime", "authorName", "noOfUpvotes",
    "isNSFW", "comments", "noOfComments", "imageUrl", "postUrl"
])

subReddits = []

for subreddits in subReddits:
    subreddit = reddit.subreddit(subreddits)

    