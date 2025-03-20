import json

def convertToJson(data):
    try:
        data1 = json.loads(data)
        with open("public/output1.json", "w") as file:
            json.dump(data1, file)
            file.close()
        print("no error")
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")


