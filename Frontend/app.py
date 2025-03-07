from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, verify_jwt_in_request
from flask import Flask, jsonify, request, abort, g, make_response
# from groqbot import chat_with_groq
from flask_cors import CORS
import datetime
from kg_chat import chat_with_kg


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
users = {"fasihrem": "123456"}

@app.route('/api/setFilter', methods=['POST'])
def getFilters():

    return jsonify("got filters")

@app.route('/api/setCronjob', methods=['POST'])
def getCronjob():

    return jsonify("got cronjob deets")

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
