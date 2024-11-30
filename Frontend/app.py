from flask import Flask, jsonify, request
from flask_cors import CORS
from groqbot import chat_with_groq
import pymongo

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/api/chatInput', methods=['POST'])
def chat_page():
    # Extract user input from the request
    user_input = request.json.get('message', '')
    response = chat_with_groq(user_input)
    print(f"User input: {user_input}")  # Print to the console
    print(f"Groq Response: {response}")
    return jsonify({"response": f"{response}"})  # Send a response


USER_CREDENTIALS = {
    "username": "fas",
    "password": "1234"
}

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json  # Get JSON data from the request
    username = data.get('username', '')
    password = data.get('password', '')

    # Validate credentials
    if username == USER_CREDENTIALS['username'] and password == USER_CREDENTIALS['password']:
        return jsonify({"success": True, "message": "Login successful!"})
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    fname = data.get('firstName', '')
    lname = data.get('lastName', '')
    username = data.get('username', '')
    password = data.get('password', '')

    print(f"Full Name: {fname} , {lname} Username: {username}, Password: {password}")

    return jsonify({"success": True, "message": "Signup successful!"})

if __name__ == '__main__':
    app.run(debug=True)
