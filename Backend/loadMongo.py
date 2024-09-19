import os
import glob
import pandas as pd
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Function to map the structure of a given DataFrame to the common schema
def MapToCommonSchema(DF):
    CommonSchema = {
        'type': None,  
        'postTitle': None,
        'postDesc': None,
        'postTime': None,
        'authorName': None,
        'noOfUpvotes': None,
        'isNSFW': None,
        'comments': None,
        'noOfComments': None,
        'imageUrl': None,
        'postUrl': None,
        'subReddit': None
    }

    if 'type' in DF.columns:
        CommonSchema['type'] = DF['type']
    if 'postTitle' in DF.columns:
        CommonSchema['postTitle'] = DF['postTitle']
    if 'postDesc' in DF.columns:
        CommonSchema['postDesc'] = DF['postDesc']
    if 'postTime' in DF.columns:
        CommonSchema['postTime'] = DF['postTime']
    if 'authorName' in DF.columns:
        CommonSchema['authorName'] = DF['authorName']
    if 'noOfUpvotes' in DF.columns:
        CommonSchema['noOfUpvotes'] = DF['noOfUpvotes']
    if 'isNSFW' in DF.columns:
        CommonSchema['isNSFW'] = DF['isNSFW']
    if 'comments' in DF.columns:
        CommonSchema['comments'] = DF['comments']
    elif all(x in DF.columns for x in ['comment1', 'comment2', 'comment3']):
        CommonSchema['comments'] = DF[['comment1', 'comment2', 'comment3']].apply(lambda row: [x for x in row if pd.notna(x)], axis=1)
    if 'noOfComments' in DF.columns:
        CommonSchema['noOfComments'] = DF['noOfComments']
    if 'imageUrl' in DF.columns:
        CommonSchema['imageUrl'] = DF['imageUrl']
    if 'postUrl' in DF.columns:
        CommonSchema['postUrl'] = DF['postUrl']
    if 'subReddit' in DF.columns:
        CommonSchema['subReddit'] = DF['subReddit']

    return pd.DataFrame(CommonSchema)

# Function to read and process different CSV formats based on the columns present in the CSV
def Reading(file_path):
    DF = pd.read_csv(file_path)
    if 'postTitle' in DF.columns and 'comment1' in DF.columns:
        return MapToCommonSchema(DF)
    elif 'postTitle' in DF.columns and 'comments' in DF.columns:
        return MapToCommonSchema(DF)
    else:
        raise ValueError(f"Unknown CSV format for: {file_path}")

# Connect to MongoDB
def MongoDBConnection():
    uri = "mongodb://localhost:27017"
    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))
    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

    db = client['DataTails'] 
    collection = db['Data']
    return collection

# Function to insert records into MongoDB while avoiding duplicates
def CheckingDuplicates(collection, records):
    for record in records:
        query = {
            'postUrl': record['postUrl'],
            'postTime': record['postTime'],
            'noOfComments': record['noOfComments']
        }
        # Insert the record if it doesn't already exist in the collection
        if collection.count_documents(query, limit=1) == 0:
            collection.insert_one(record)
        else:
            print(f"Duplicate record found and skipped: {record['postUrl']} at {record['postTime']} with {record['noOfComments']} comments")

# Directory containing the CSV files
Dir = '/home/fasih/Final Year Project/data-tails/Backend/data/uni_pc/'
Files = glob.glob(os.path.join(Dir, '*.csv'))
FinalDF = []
collection = MongoDBConnection()

for File in Files:
    try:
        ProcessedDF = Reading(File)
        FinalDF.append(ProcessedDF)
        print(f"file {File} added to FinalDF")
    except ValueError as e:
        print(e)

CombinedDF = pd.concat(FinalDF, ignore_index=True)
records = CombinedDF.to_dict(orient='records')

# Insert records into MongoDB, skipping duplicates based on postUrl, postTime, and noOfComments
CheckingDuplicates(collection, records)
print(f"Data processed and saved to MongoDB in the 'DataTails.Data' collection.")
