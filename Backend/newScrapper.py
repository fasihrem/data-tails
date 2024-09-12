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

reddit = praw.Reddit(client_id='P4-FFLW065bTLnGSqfCnlg', 
                    client_secret='-EBrPckd7kwt0b8OaxJ-5cfwYRExQw', user_agent='MyRedditScraper/1.0 (Macintosh; Intel Mac OS X 14.3.1; Apple Silicon) Python/3.12 (fasihrem@gmail.com)')

print(reddit.read_only)

uri = "mongodb://localhost:27017"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# upload data to db
# connection_string = "mongodb+srv://fasihrem:Z3Dgx6tG7oIrumRr@cluster0.hoksb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

connection_string = "mongodb://localhost:27017"

client = MongoClient(connection_string)
db = client['dataTails']  # Replace 'your_database_name' with the name of your database
collection = db['reddit-data']  # Replace 'your_collection_name' with the name of your collection

df2 = pd.DataFrame(columns=[
    "type", "subReddit", "postTitle", "postDesc", "postTime", "authorName", "noOfUpvotes",
    "isNSFW", "comments", "noOfComments", "imageUrl", "postUrl"
])

news = "new"

def GetData(SubReddit):
    global df2
    
    #rotateuseragent function call
    # headers = rotate_user_agent(proxy)
    for subreddits in SubReddit:  # Iterate through list of all subreddits individually
        subreddit = reddit.subreddit(subreddits)  # Make subreddit instance to scrape

        start_time = time.time()
        print(f"In subreddit r/{subreddits}, scraping new at {datetime.now()}")

        for submission in subreddit.new(limit=10):
            warnings.filterwarnings('ignore')

            postTitle = submission.title
            postDesc = submission.selftext

            
            query = {'postTitle': postTitle, 'postDesc': postDesc}
            result = collection.find_one(query)

            if result:
                print("alr exists")
            else:
                postTime = submission.created_utc
                timeAsDT = datetime.fromtimestamp(postTime)

                authorName = submission.author.name if submission.author else ""

                noOfUpvotes = submission.score
                isNSFW = submission.over_18

                noOfComments = submission.num_comments

                all_comments = get_all_comments(submission)
                newComments = []

                for comment in all_comments:
                    newComments.append(comment.body)

                imageUrl = submission.url
                postUrl = "https://www.reddit.com" + submission.permalink

                new_post = {
                    "type": news,
                    "subReddit": subreddits,
                    "postTitle": postTitle,
                    "postDesc": postDesc,
                    "postTime": timeAsDT,
                    "authorName": authorName,
                    "noOfUpvotes": noOfUpvotes,
                    "isNSFW": isNSFW,
                    "comments" : newComments,
                    "noOfComments": noOfComments,
                    "imageUrl": imageUrl,
                    "postUrl": postUrl
                }


        # Convert list to DataFrame and concatenate with existing DataFrame
        df2 = pd.concat([df2, new_post], ignore_index=True).drop_duplicates(subset=['postDesc', 'postTitle'])

        print(f"In subreddit r/{subreddits}, scraping hot at {datetime.now()}")


def get_all_comments(submission):
    comments = []
    comment_queue = list(submission.comments)
    while comment_queue:
        comment = comment_queue.pop(0)
        if isinstance(comment, praw.models.MoreComments):
            # Handle MoreComments object (you might want to load more comments here if necessary)
            comment_queue.extend(comment.comments())
        else:
            comments.append(comment)
    return comments