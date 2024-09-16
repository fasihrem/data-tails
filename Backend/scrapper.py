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

# print(subReddit) 

#setting up praw
# reddit = praw.Reddit(client_id='P4-FFLW065bTLnGSqfCnlg', 
#                     client_secret='-EBrPckd7kwt0b8OaxJ-5cfwYRExQw',
#                     user_agent='MyRedditScraper/1.0 (Macintosh; Intel Mac OS X 14.3.1; Apple Silicon) Python/3.12 (fasihrem@gmail.com)')

# print(reddit.read_only)


# uri = "mongodb+srv://fasihrem:Z3Dgx6tG7oIrumRr@cluster0.hoksb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
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

hots = "hot"
tops = "top"
news = "new"


def get_valid_proxies():
    proxy_list_url = 'https://free-proxy-list.net/'
    response = requests.get(proxy_list_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    proxy_data = []
    rows = soup.find_all('tr')[1:]
    for row in rows:
        columns = row.find_all('td')
        if len(columns) >= 8:
            ip_address = columns[0].text.strip()
            google_enabled = columns[5].text.strip().lower() == 'yes'
            https_enabled = columns[6].text.strip().lower() == 'yes'
            last_checked = columns[7].text.strip()
            if (last_checked.endswith('mins ago') and int(last_checked.split(' ')[0]) < 15) or last_checked.endswith('hours ago'):
                if google_enabled or https_enabled:
                    proxy_data.append({'ip_address': ip_address, 'google_enabled': google_enabled, 'https_enabled': https_enabled})

    return proxy_data

def rotate_user_agent(proxy):
    if proxy:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'http': f'http://{proxy}',
            'https': f'https://{proxy}'
        }
    else:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    return headers


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


def scrapper_func(subReddit, proxy_list):

    global df2

    for subreddits in subReddit:  # Iterate through list of all subreddits individually
        # headers, proxies = rotate_user_agent(proxy_list)
        reddit = praw.Reddit(
            client_id='P4-FFLW065bTLnGSqfCnlg',
            client_secret='-EBrPckd7kwt0b8OaxJ-5cfwYRExQw',
            user_agent='MyRedditScraper/1.0 (Macintosh; Intel Mac OS X 14.3.1; Apple Silicon) Python/3.12 (fasihrem@gmail.com)'
        )

        subreddit = reddit.subreddit(subreddits)  # Make subreddit instance to scrape


        start_time = time.time()
        # print(f"In subreddit r/{subreddits}, scraping new at {datetime.now()}")

        # new_posts = []
  
        # for submission in subreddit.new(limit=1000):
        #     warnings.filterwarnings('ignore')

        #     postTitle = submission.title
        #     postDesc = submission.selftext
        #     postTime = submission.created_utc
        #     timeAsDT = datetime.fromtimestamp(postTime)

        #     authorName = submission.author.name if submission.author else ""

        #     noOfUpvotes = submission.score
        #     isNSFW = submission.over_18
            
            
        #     # try:
        #     #     comment1 = submission.comments[0].body if len(submission.comments) > 0 else ""
        #     # except IndexError:
        #     #     comment1 = ""
        #     # try:
        #     #     comment2 = submission.comments[1].body if len(submission.comments) > 1 else ""
        #     # except IndexError:
        #     #     comment2 = ""
        #     # try:
        #     #     comment3 = submission.comments[2].body if len(submission.comments) > 2 else ""
        #     # except IndexError:
        #     #     comment3 = ""

        #     noOfComments = submission.num_comments

        #     all_comments = get_all_comments(submission)
        #     newComments = []

        #     for comment in all_comments:
        #         newComments.append(comment.body)

        #     imageUrl = submission.url
            
        #     postUrl = "https://www.reddit.com" + submission.permalink
            


        #     new_post = {
        #         "type": news,
        #         "subReddit": subreddits,
        #         "postTitle": postTitle,
        #         "postDesc": postDesc,
        #         "postTime": timeAsDT,
        #         "authorName": authorName,
        #         "noOfUpvotes": noOfUpvotes,
        #         "isNSFW": isNSFW,
        #         "comments" : newComments,
        #         "noOfComments": noOfComments,
        #         "imageUrl": imageUrl,
        #         "postUrl": postUrl
        #     }

        #     new_posts.append(new_post)
            


        # # Convert list to DataFrame and concatenate with existing DataFrame
        # new_posts_df = pd.DataFrame(new_posts)
        # df2 = pd.concat([df2, new_posts_df], ignore_index=True).drop_duplicates(subset=['postDesc', 'postTitle'])
        # time.sleep(5)

        # print(f"In subreddit r/{subreddits}, scraping hot at {datetime.now()}")

        # hot_posts = []
        # for submission in subreddit.hot(limit=1000):
        #     warnings.filterwarnings('ignore')
        #     postTitle = submission.title
        #     postDesc = submission.selftext
        #     postTime = submission.created_utc
        #     timeAsDT = datetime.fromtimestamp(postTime)

        #     authorName = submission.author.name if submission.author else ""

        #     noOfUpvotes = submission.score
        #     isNSFW = submission.over_18

        #     # try:
        #     #     comment1 = submission.comments[0].body if len(submission.comments) > 0 else ""
        #     # except IndexError:
        #     #     comment1 = ""
        #     # try:
        #     #     comment2 = submission.comments[1].body if len(submission.comments) > 1 else ""
        #     # except IndexError:
        #     #     comment2 = ""
        #     # try:
        #     #     comment3 = submission.comments[2].body if len(submission.comments) > 2 else ""
        #     # except IndexError:
        #     #     comment3 = ""

        #     noOfComments = submission.num_comments

        #     all_comments = get_all_comments(submission)
        #     hotComments = []


        #     for comment in all_comments:
        #         hotComments.append(comment.body)

        #     imageUrl = submission.url
        #     postUrl = "https://www.reddit.com" + submission.permalink

        #     hot_post = {
        #         "type": hots,
        #         "subReddit": subreddits,
        #         "postTitle": postTitle,
        #         "postDesc": postDesc,
        #         "postTime": timeAsDT,
        #         "authorName": authorName,
        #         "noOfUpvotes": noOfUpvotes,
        #         "isNSFW": isNSFW,
        #         "comments": hotComments,
        #         "noOfComments": noOfComments,
        #         "imageUrl": imageUrl,
        #         "postUrl": postUrl
        #     }

        #     hot_posts.append(hot_post)

        # # Convert list to DataFrame and concatenate with existing DataFrame
        # hot_posts_df = pd.DataFrame(hot_posts)
        # df2 = pd.concat([df2, hot_posts_df], ignore_index=True).drop_duplicates(subset=['postDesc', 'postTitle'])
        # time.sleep(5)

        print(f"In subreddit r/{subreddits}, scraping top at {datetime.now()}")

        top_posts = []
        for submission in subreddit.top(limit=1000, time_filter="all"):
            warnings.filterwarnings('ignore')
            topComments = []
            postTitle = submission.title
            postDesc = submission.selftext
            postTime = submission.created_utc
            timeAsDT = datetime.fromtimestamp(postTime)

            authorName = submission.author.name if submission.author else ""

            noOfUpvotes = submission.score
            isNSFW = submission.over_18

            # try:
            #     comment1 = submission.comments[0].body if len(submission.comments) > 0 else ""
            # except IndexError:
            #     comment1 = ""
            # try:
            #     comment2 = submission.comments[1].body if len(submission.comments) > 1 else ""
            # except IndexError:
            #     comment2 = ""
            # try:
            #     comment3 = submission.comments[2].body if len(submission.comments) > 2 else ""
            # except IndexError:
            #     comment3 = ""

            noOfComments = submission.num_comments

            all_comments = get_all_comments(submission)
            topComments = []


            for comment in all_comments:
                topComments.append(comment.body)

            imageUrl = submission.url
            postUrl = "https://www.reddit.com" + submission.permalink

            top_post = {
                "type": tops,
                "subReddit": subreddits,
                "postTitle": postTitle,
                "postDesc": postDesc,
                "postTime": timeAsDT,
                "authorName": authorName,
                "noOfUpvotes": noOfUpvotes,
                "isNSFW": isNSFW,
                "comments": topComments,
                "noOfComments": noOfComments,
                "imageUrl": imageUrl,
                "postUrl": postUrl
            }

            duplicate = df2[(df2['postDesc'] == top_post['postDesc']) & (df2['postTitle'] == top_post['postTitle'])]
        
            if not duplicate.empty:
                print("nah man u dupe")
            else:
                top_posts.append(top_post)

        # Convert list to DataFrame and concatenate with existing DataFrame
        # top_posts_df = pd.DataFrame(top_posts)
        # df2 = pd.concat([df2, top_posts_df], ignore_index=True).drop_duplicates(subset=['postDesc', 'postTitle'])
        df2 = pd.concat([df2, top_posts], ignore_index=True)

        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"Finished scraping subreddit r/{subreddits} in {elapsed_time:.2f} seconds")

        print(f"Total Number of records fetched: {df2.shape[0]}")

        data_dict = df2.to_dict(orient='records')
        collection.insert_many(data_dict)
        print(f"Successfully uploaded r/{subreddits} onto MongoDB")

        # Save data to CSV
        df2.to_csv(f"./data/{subreddits}.csv", sep=',', encoding="utf-8")
        print("Saved as CSV file")

        df2 = pd.DataFrame(columns=df2.columns)  # Clear DataFrame for next subreddit
        time.sleep(60)  # Adjust the sleep time as needed (in seconds)

    print("All data successfully saved to MongoDB and separate CSV files")


def main():

    df = pd.read_csv("/home/fasih/Final Year Project/data-tails/Backend/data/Subreddits.csv")
    subReddit = df['Subreddits'].to_list() #actual list of all subreddits

    valid_proxies = get_valid_proxies()

    print(valid_proxies)

    scrapper_func(subReddit, valid_proxies)

if __name__ == "__main__":
    main()