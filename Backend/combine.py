import os
import pandas as pd

directory = "/Users/fasihrem/Downloads/University/Final Year Project/data-tails/Backend/data/macbook"

files = os.listdir(directory)

mainDF = pd.DataFrame()

for filename in files:
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(filename)
            mainDF = pd.concat([mainDF, df], ignore_index=True)
            print(f"added file {filename} into mainDF")
    except Exception as e:
        print(f"Error loading file, {e}")

mainDF.to_csv("./Backend/data/fasih_data.csv", sep=',', encoding="utf-8")
print("mainDF saved as csv")
