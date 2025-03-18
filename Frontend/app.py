from flask import Flask, jsonify, request, abort, g, make_response
# from groqbot import chat_with_groq
from kg_chat import chat_with_kg
from flask_cors import CORS
from crontab import CronTab
import datetime


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

subreddit_topics = {
    "AskReddit": [
        "Life experiences",
        "Personal opinions",
        "Funny stories",
        "Would you rather questions",
        "Advice requests"
    ],
    "Damnthatsinteresting": [
        "Scientific discoveries",
        "Historical facts",
        "Unusual phenomena",
        "Bizarre events",
        "Mind-blowing facts"
    ],
    "Music": [
        "New album releases",
        "Music recommendations",
        "Underrated artists",
        "Music production tips",
        "Concert experiences"
    ],
    "mildlyinteresting": [
        "Everyday oddities",
        "Unexpected coincidences",
        "Strange objects",
        "Weirdly satisfying images",
        "Slightly amusing observations"
    ],
    "news": [
        "Current events",
        "Politics",
        "Technology advancements",
        "Health and science",
        "Breaking news"
    ],
    "showerthoughts": [
        "Deep philosophical ideas",
        "Random realizations",
        "Funny but insightful thoughts",
        "Observations about life",
        "Unique perspectives"
    ],
    "todayilearned": [
        "Interesting historical facts",
        "Scientific discoveries",
        "Unusual laws",
        "Cultural traditions",
        "Lesser-known people in history"
    ],
    "wallstreetbets": [
        "Stock market speculation",
        "Meme stocks",
        "Options trading",
        "YOLO investing strategies",
        "Crypto discussions"
    ],
    "worldnews": [
        "International politics",
        "Global conflicts",
        "Climate change news",
        "Human rights issues",
        "Global economy"
    ],
    "StockMarket": [
        "Investment strategies",
        "Stock market analysis",
        "Market trends",
        "Earnings reports",
        "Risk management"
    ],
    "travel": [
        "Best travel destinations",
        "Travel tips",
        "Budget-friendly travel",
        "Hidden gems",
        "Solo travel experiences"
    ],
    "TravelHacks": [
        "Packing tips",
        "Finding cheap flights",
        "Hotel booking tricks",
        "Travel safety tips",
        "Airport hacks"
    ],
    "CryptoCurrency": [
        "Bitcoin & Ethereum discussions",
        "Altcoin analysis",
        "Crypto regulations",
        "Blockchain technology",
        "Crypto investing strategies"
    ],
    "YouShouldKnow": [
        "Life hacks",
        "Helpful tips",
        "Uncommon knowledge",
        "Everyday safety tips",
        "Consumer awareness"
    ],
    "LifeProTips": [
        "Self-improvement",
        "Productivity hacks",
        "Career advice",
        "Health & fitness tips",
               "Money management"
    ]
}

CRON_COMMAND = "/Users/fasihrem/Downloads/University/data-tails/venv/bin/python3 /Users/fasihrem/Downloads/University/data-tails/Backend/hot.py"

@app.route('/api/setFilter', methods=['POST'])
def getFilters():
    data = request.json
    selected_option = data.get('selectedOption')

    if not selected_option:
        return jsonify({"error": "No option selected"}), 400

    print(f"Received: {selected_option}")
    return jsonify({"message": f"Received {selected_option} successfully!"})

@app.route('/api/setCronjob', methods=['POST'])
def getCronjob():
    data = request.json
    cronInterval = int(data.get('cronInterval'))
    cronStart = int(data.get('cronTime'))

    print(f"cron start: {cronStart}")
    print(f"cronInterval: {cronInterval}")


    try:
        if not cronStart and not cronInterval:
            return jsonify({"error": "Nothing selected"}), 400
            print("empty")

        if cronStart < 1 or cronStart > 23:
            return jsonify({"error": "invalid start time"})
            print("start time not in range")

        # if cronInterval < 30:
        #     return jsonify({"error": "interval too short, must be more than 30m"})
        #     print("interval too little")

        cron = CronTab(user=True)

        for job in cron:
            if job.command == CRON_COMMAND:
                print("cron exists")
                cron.remove(job)
                print("cron removed")

        new_job = cron.new(command=CRON_COMMAND)
        print(new_job, "\n")

        new_job.setall(f"{cronStart} */{cronInterval} * * *")
        print("cron set")
        cron.write()

        print("cron applied")
        return jsonify({"message": f"cronjob successfully applied at {cronStart} every {cronInterval} minutes"}), 200

    except:
        return jsonify({"error": "what da fuck"})




@app.route('/api/chatInput', methods=['POST'])
def chat_page():
    try:
        data = request.json
        user_id = data.get("userId")
        user_input = data.get("message")

        response = chat_with_kg(user_input, user_id)


        print(f"user input: {user_input}")
        print(f"groq response: {response}")

        return jsonify({"response": f"{response}"}), 200
    # Extract user input from the request
    # user_input = request.json.get('message', '')
    except Exception as e:
        print("Server error:", str(e))
        return jsonify({"error": "Server error"}), 500


if __name__ == '__main__':
    app.run(debug=True)
