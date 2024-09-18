import os
import pandas as pd

# directory = "/Users/fasihrem/Downloads/University/Final Year Project/data-tails/Backend/data/macbook"
ud = "/home/fasih/Final Year Project/data-tails/Backend/data/uni_pc/"

files = os.listdir(ud)
count = 0
for filename in files:
    if filename.endswith(".csv"):
        file_path = os.path.join(ud, filename)
        try:
            df = pd.read_csv(file_path)
            # print(df.columns)
            print(filename, " has total records: ", df.shape[0])
            count = count+df.shape[0]
        except Exception as e:
            print(f'Error reading {filename}: {e}')


print("total records: ", count)