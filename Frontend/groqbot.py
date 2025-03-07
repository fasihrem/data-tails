import csv
from kg_chat import Groq

# Initialize the Groq client
client = Groq(api_key="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")

# Path to the CSV file where the conversation history will be saved
csv_file_path = "conversation_history.csv"

# Initialize the conversation history
conversation_history = []


# Function to write conversation history to a CSV file
def update_csv_file(history, file_path):
    with open(file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Role", "Content"])  # Write the header
        for entry in history:
            writer.writerow([entry["role"], entry["content"]])  # Write each message


# Function to interact with the Groq model
def chat_with_groq(message):
    global conversation_history

    # Add the user message to the conversation history
    conversation_history.append({"role": "user", "content": message})

    # Call the Groq API to get a response
    chat_completion = client.chat.completions.create(
        messages=conversation_history,  # Pass the entire conversation history
        model="llama3-8b-8192"
    )

    # Extract the response content
    response = chat_completion.choices[0].message.content

    # Add the model's response to the conversation history
    conversation_history.append({"role": "assistant", "content": response})

    # Update the CSV file with the latest history
    update_csv_file(conversation_history, csv_file_path)

    return response


# Example usage
# response = chat_with_groq("Explain the importance of fast language models")
# print("Assistant:", response)
#
# response = chat_with_groq("Why are they important for real-time applications?")
# print("Assistant:", response)

# The conversation history is now saved in "conversation_history.csv"
