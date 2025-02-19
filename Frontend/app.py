from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, verify_jwt_in_request
from flask import Flask, jsonify, request, abort, g, make_response
from groqbot import chat_with_groq
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_cors import CORS
import datetime
import pymongo


app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = 'gmR3xyhYkOuQf4EjaQm1XFMbey_rJmcl8xz0SGAPTaOg6BbFEaq2zMHqz0ovhZ05'
# app.config["JWT_TOKEN_LOCATION"] = ["cookies"]  # Store tokens in cookies
# app.config["JWT_COOKIE_SECURE"] = True  # Only send over HTTPS in production
# app.config["JWT_COOKIE_SAMESITE"] = "Strict"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(days=1)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

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
    response = chat_with_groq(user_input)
    print(f"User input: {user_input}")  # Print to the console
    print(f"Groq Response: {response}")
    return jsonify({"response": f"{response}"})  # Send a response

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json  # Get JSON data from the request
    username = data.get('username')
    password = data.get('password')

    print("login attempt: ", username, password)
    # meow meow meow

    if users.get(username) != password:
        return jsonify({"error": "invalid credentials"}), 402

    access_token = create_access_token(identity=username)

    response = make_response(jsonify({"message": "Login successful!", "access_token": access_token}))

    response.set_cookie(
        "authToken",
        access_token,
        httponly=True,
        secure=False,  # 🔴 Change to False for localhost testing
        samesite="Lax",  # Ensures cookies work across navigation
    )

    return response

if __name__ == '__main__':
    app.run(debug=True)
