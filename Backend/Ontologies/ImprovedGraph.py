# Install required libraries
# !pip install pyvis pymongo rdflib plotly gensim

import re
import nltk
import json
import rdflib
import pandas as pd
from rdflib import URIRef, Literal, Graph, Namespace
from collections import deque
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from pymongo import MongoClient
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('wordnet')

# Configurations
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = 'DataTails'
COLLECTION_NAME = 'Data'
GRAPH_DB_COLLECTION = 'GraphData'  # Collection for storing graph nodes/edges
OUTPUT_DIR = 'D:/FYP/Github/data-tails/Backend/Ontologies/'

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
data_collection = db[COLLECTION_NAME]
graph_collection = db[GRAPH_DB_COLLECTION]

# Stopwords and Lemmatizer
lemmatizer = WordNetLemmatizer()
StopWords = set(stopwords.words('english'))
custom_stopwords = StopWords | {"make", "thing", "know", "get", "want", "like", "would", "could", "you", "say", "also", "aita", "com", "www", "made", "ago", "day", "000"}

# Utility Functions
def preprocess_text(text):
    """Preprocess text by removing stopwords, lemmatizing, and tokenizing."""
    text = re.sub(r'\W', ' ', text)  # Remove non-alphanumeric characters
    text = re.sub(r'\b\w{1,2}\b', '', text)  # Remove short words
    tokens = word_tokenize(text.lower())
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in custom_stopwords]
    return tokens

def add_to_graph_db(node, node_type, edge_target=None, edge_type=None):
    """
    Add a node and optional edge to MongoDB.
    """
    graph_collection.update_one(
        {"_id": node},
        {"$setOnInsert": {"type": node_type}},
        upsert=True
    )
    if edge_target:
        graph_collection.update_one(
            {"_id": node},
            {"$addToSet": {"edges": {"target": edge_target, "type": edge_type}}},
            upsert=True
        )

# Preprocessing Data
def preprocess_dataframe(data_cursor):
    """Preprocess the dataframe for ontology and graph creation."""
    df = pd.DataFrame(list(data_cursor))
    
    # Handle missing data
    cols = ['subReddit', 'postTitle', 'postDesc', 'postTime', 'authorName', 'noOfUpvotes', 
            'comments', 'noOfComments', 'postUrl', 'imageUrl', 'isNSFW']
    df = df[cols]
    df.fillna({'subReddit': 'Unknown_SubReddit', 'authorName': 'Unknown_Author',
               'postTitle': 'Untitled', 'postDesc': '', 'postUrl': 'http://example.com/NOPOST.png',
               'imageUrl': 'http://example.com/NOImage.png', 'isNSFW': False, 'noOfUpvotes': 0,
               'noOfComments': 0, 'comments': ''}, inplace=True)
    df['postTime'] = pd.to_datetime(df['postTime'], errors='coerce')
    
    # Apply preprocessing
    df['postTitle'] = df['postTitle'].apply(preprocess_text)
    df['postDesc'] = df['postDesc'].apply(preprocess_text)
    df['comments'] = df['comments'].apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
    
    return df

# Creating RDF Graph
def create_ontology(df):
    """Create RDF graph and store in Turtle/JSON-LD formats."""
    g = rdflib.Graph()
    SIOC = rdflib.Namespace("http://rdfs.org/sioc/ns#")
    g.bind("sioc", SIOC)
    
    for index, row in df.iterrows():
        post_uri = URIRef(f"http://reddit.com/post{index}")
        g.add((post_uri, rdflib.RDF.type, SIOC.Post))
        g.add((post_uri, SIOC.title, Literal(' '.join(row['postTitle']))))
        g.add((post_uri, SIOC.description, Literal(' '.join(row['postDesc']))))
        
        # Add nodes and edges to graph DB
        add_to_graph_db(f"post_{index}", "post")
        add_to_graph_db(f"subreddit_{row['subReddit']}", "subreddit", f"post_{index}", "contains")
    
    # Save RDF graph
    g.serialize(f"{OUTPUT_DIR}/KG.ttl", format="turtle")
    g.serialize(f"{OUTPUT_DIR}/KG.json", format="json-ld")

# BFS for Graph Querying
def bfs_traverse(start_node, max_depth=1):
    """
    Perform BFS on the graph starting from `start_node`.
    Returns nodes and edges up to `max_depth`.
    """
    visited = set()
    queue = deque([(start_node, 0)])  # (node, depth)
    result_nodes = set()
    result_edges = []

    while queue:
        node, depth = queue.popleft()
        if depth > max_depth or node in visited:
            continue
        visited.add(node)
        result_nodes.add(node)
        
        # Get edges from DB
        node_data = graph_collection.find_one({"_id": node})
        if "edges" in node_data:
            for edge in node_data["edges"]:
                target = edge["target"]
                edge_type = edge["type"]
                result_edges.append((node, target, edge_type))
                queue.append((target, depth + 1))
    
    return {"nodes": list(result_nodes), "edges": result_edges}

# Main Workflow
if __name__ == "__main__":
    # Step 1: Fetch and preprocess data
    data_cursor = data_collection.find({})
    df = preprocess_dataframe(data_cursor)
    
    # Step 2: Create ontology and save to RDF
    create_ontology(df)
    
    # Step 3: Example BFS query
    start_node = "post_0"
    max_depth = 2
    result = bfs_traverse(start_node, max_depth)
    print(f"BFS Result (Depth {max_depth}):", result)
