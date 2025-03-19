import openai
import json
from dotenv import load_dotenv
import os
load_dotenv()
# Set up your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")
print(openai.api_key)
def createData(res, viz):
    # Define the query
    d1 = """
    Extract important data from the above response and output it in tabular json format to create the following visualizations listed below. Label the columns as x and y axis so it can be used in D3.js.
    """

    query = res + d1 + str(viz)

    # print(query)

    # Make an API request using the updated method
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": query}]
    )

    # Extract response
    response_text = response.choices[0].message.content

    return response_text