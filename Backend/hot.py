import praw
from datetime import datetime
import pandas as pd
import time


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

#fasih
# subReddits = ["pakistan", "islamabad", "lahore", "karachi", "technology", "tech", "technews", "news",
#              "worldnews", "sports", "youtube", "television", "relationship_advice", "relationships",
#              "AskReddit", "ask", "Discussion", "Filmmakers", "filmmaking", "Movies", "MovieSuggestions",
#              "FASTNU", "NUST", "LinusTechTips"]

#religious - fasih (alr done = religion)
#subReddits = ["Christianity", "Catholicism", "islam", "progressive_islam", "Judaism", "Buddhism", "hinduism", "Freethought", "exmuslim",
#               "exmormon", "skeptic"]

#shitba:
# subReddits = ["Music", "todayilearned", "science", "showerthoughts", "space", "askscience", "mildlyinteresting",
#        "explainlikeimfive", "LifeProTips", "GetMotivated", "Gadgets", "dataisbeautiful", "futurology",
#        "Documentaries", "UpliftingNews", "personalfinance", "tifu", "philosophy", "history", "Damnthatsinteresting",
#        "wallstreetbets", "NatureIsFuckingLit", "creepy", "InternetIsBeautiful"]

#maryam:
# subReddits = ["lifehacks", "nba", "Fitness", "interestingasfuck", "travel", "nfl", "AdviceAnimals", "CryptoCurrency",
#         "politics", "NetflixBestOf", "mildlyinfuriating", "soccer", "Parenting", "europe", "buildapc", "gardening",
#         "Bitcoin", "cars", "programming", "apple", "YouShouldKnow", "nevertellmetheodds" "frugal", "coolguides",
#         "socialskills", "foodhacks", "nasa", "nutrition", "NoStupidQuestions", "Economics", "TravelHacks", "biology",
#         "dating_advice"]

#uni pc
subReddits =  ["Survival", "unpopularopinion", "formula1", "PremierLeague", "bodyweightfitness", "MovieDetails", "learnprogramming", "Cooking",
                "iphone", "hardware", "Entrepreneur", "unitedkingdom", "careerguidance", "homeautomation", "changemyview", "psychology", "running",
                "compsci", "motorcycles", "math", "HealthyFood", "chemistry", "Baking", "StockMarket", "oddlyspecific", "JapanTravel", "bodybuilding",
                "Astronomy", "writing", "Health", "Atheism", "travelpartners"]

count = 0

for subreddits in subReddits:
    subreddit = reddit.subreddit(subreddits)
    start_time = time.time()
    print(f"in r/{subreddits}")

    for submission in subreddit.hot(limit=1000):
        postTitle = submission.title
        postDesc = submission.selftext
        postTime = submission.created_utc
        timeAsDT = datetime.fromtimestamp(postTime)
        authorName = submission.author.name if submission.author else ""
        noOfUpvotes = submission.score
        isNSFW = submission.over_18
        noOfComments = submission.num_comments

        comments_list = []
        try:
            for comment in submission.comments.list()[:noOfComments]:
                comment_body = comment.body
                comments_list.append(comment_body)
                # print(comment_body)
        except Exception as e:
            # Handle any exceptions that might occur while accessing comments
            print(f"Error accessing comments: {e}")

        imageUrl = submission.url
        postUrl = "https://www.reddit.com" + submission.permalink

        duplicate = df2[(df2['postDesc'] == postDesc) & (df2['postTitle'] == postTitle)]

        if not duplicate.empty:
            print("dupe")
        else:
            hot_post = {
                "type": "hot",
                "subReddit": subreddits,
                "postTitle": postTitle,
                "postDesc": postDesc,
                "postTime": timeAsDT,
                "authorName": authorName,
                "noOfUpvotes": noOfUpvotes,
                "isNSFW": isNSFW,
                "comments": comments_list,
                "noOfComments": noOfComments,
                "imageUrl": imageUrl,
                "postUrl": postUrl
            }

        hot_posts_df = pd.DataFrame([hot_post])
        df2 = pd.concat([df2, hot_posts_df], ignore_index=True)

        count = count+1
        print("records: ", count)

    df2.to_csv("/home/fasih/Final Year Project/data-tails/Backend/data/uni_pc/"+subreddits+"_hot.csv", sep=',', encoding="utf-8")
    df2 = pd.DataFrame(columns=df2.columns)
    count = 0

    time.sleep(5)
    print(f"done with r/{subreddits} and csv saved")
