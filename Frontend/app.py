from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, verify_jwt_in_request
from flask import Flask, jsonify, request, abort, g, make_response
# from groqbot import chat_with_groq
from flask_cors import CORS
import datetime
from kg_chat import chat_with_kg


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
    cronInterval = data.get('cronInterval')
    cronStart = data.get('cronTime')

    if not cronStart and not cronInterval:
        return jsonify({"error": "Nothing selected"}), 400

    print(f"Received: {cronStart, cronInterval}")
    return jsonify({"message": f"Received start time: {cronStart} and interval time: {cronInterval} successfully!"})

@app.route('/api/chatInput', methods=['POST'])
def chat_page():
    # Extract user input from the request
    user_input = request.json.get('message', '')
    # response = chat_with_groq(user_input)
    response = chat_with_kg(user_input)
    print(f"User input: {user_input}")  # Print to the console
    print(f"Groq Response: {response}")
    return jsonify({"response": f"{response}"})  # Send a response


if __name__ == '__main__':
    app.run(debug=True)
