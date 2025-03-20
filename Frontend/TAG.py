import openai
import json
import re

# Set up your OpenAI API key

def createData(res, viz):
    # Define the query

    system_prompt = """
    you will be given a query response and list of visualisations. using the given data, you have to generate json formatted data for all the given visualisations. 
    
    an example of the type of data you need to export is:
    {
        chart name{
                [
                data   
        ]
        },
        chart2 name{
                [
                data
            ]
        },
    etc...
    }
    """

    query = "response: " + res + "\n\n type of visualisations: " + str(viz)

    # Make an API request using the updated method
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": system_prompt},
                  {"role": "user", "content": query}]
    )

    # Extract response
    response_text = response.choices[0].message.content.strip()

    if not response_text.startswith("{"):
        response_text = re.sub(r"^.*?({)", r"\1", response_text, flags=re.DOTALL)

    return response_text