import json
import rdflib
import csv
import re
import time
from collections import deque, defaultdict
from rdflib import Graph, Namespace, Literal, URIRef
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from groq import Groq
from concurrent.futures import ThreadPoolExecutor

# ✅ Initialize Groq Client
client = Groq(api_key="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")

# ✅ CSV File for Conversation History
csv_file_path = "conversation_history.csv"
conversation_history = []

# ✅ Define RDF Namespaces
SIOC = Namespace("http://rdfs.org/sioc/ns#")
DCMI = Namespace("http://purl.org/dc/elements/1.1/")
FOAF = Namespace("http://xmlns.com/foaf/0.1/")
REDDIT = Namespace("http://reddit.com/ns#")

# ✅ NLP Preprocessing
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))


def preprocess_text(text):
    """Extracts meaningful words from text."""
    if not isinstance(text, str):
        return []

    text = re.sub(r'[^\w\s]', '', text)
    tokens = word_tokenize(text.lower())
    return [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words and len(word) > 2]


# ✅ Load KG.json for Fast Lookups
def load_kg_json(file_path):
    """Loads KG.json and converts it into a dictionary for fast lookup."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"✅ Loaded KG.json with {len(data)} entities.")
        return {entity["@id"]: entity for entity in data}
    except Exception as e:
        print(f"❌ Error loading KG.json: {str(e)}")
        return None


# ✅ Load KG.ttl & Build Adjacency List
def load_kg_ttl(file_path):
    """Loads KG.ttl and builds an adjacency list for fast graph traversal."""
    try:
        g = Graph()
        g.parse(file_path, format="turtle")
        adjacency_list = defaultdict(list)

        for s, p, o in g:
            adjacency_list[str(s)].append((s, p, o))
            adjacency_list[str(o)].append((s, p, o))

        print(f"✅ Loaded KG.ttl with {len(g)} triples.")
        return g, adjacency_list
    except Exception as e:
        print(f"❌ Error loading KG.ttl: {str(e)}")
        return None, None


# ✅ **Optimized BFS Retrieval with Subreddit & Topic Filtering**
def retrieve_relevant_comments(kg_json, adjacency_list, subreddit, topic):
    """Retrieves only comments relevant to the given subreddit and topic."""
    if not kg_json:
        return "❌ KG.json not loaded."

    subreddit_uri = f"http://reddit.com/subreddit/{subreddit}"
    topic_uri = f"http://reddit.com/topic/{topic}"

    matched_comments = set()

    # **Step 1: Find Posts Related to Subreddit & Topic**
    relevant_posts = set()
    for entity_id, entity in kg_json.items():
        if "sioc:Container" in entity and entity["sioc:Container"] == subreddit_uri:
            # Check if topic is mentioned
            if "sioc:topic" in entity and topic_uri in entity["sioc:topic"]:
                relevant_posts.add(entity_id)

    if not relevant_posts:
        return "❌ No posts found for the given subreddit & topic."

    # **Step 2: Retrieve Only Comments from Relevant Posts**
    for post_uri in relevant_posts:
        for comment_uri, p, o in adjacency_list.get(post_uri, []):
            if "sioc:Comment" in str(o):
                matched_comments.add(comment_uri)

    if not matched_comments:
        return "❌ No relevant comments found."

    # **Step 3: Retrieve Context of Matched Comments**
    context_results = []
    for comment in matched_comments:
        comment_text = kg_json.get(comment, {}).get("dc:title", "")
        if comment_text:
            context_results.append(comment_text)

    return {"context": context_results[:10]} if context_results else "❌ Data not found."


# ✅ Groq Chat API
def chat_with_groq(context, user_query, userID):
    """Interacts with Groq model using retrieved KG context."""
    global conversation_history

    file_path = "conversation_history.csv"
    csv_file_path = f"{userID}_{file_path}"
    conversation_history = []

    conversation_history.append({"role": "user", "content": user_query})

    prompt = f"""
    Context:
    {context}

    Question:
    {user_query}

    Provide a detailed answer based on the context.
    """

    chat_completion = client.chat.completions.create(
        messages=conversation_history,
        model="llama3-8b-8192"
    )

    response = chat_completion.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": response})

    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Role", "Content"])
        for entry in conversation_history:
            writer.writerow([entry["role"], entry["content"]])

    return response

# ✅ Run Main Program
def chat_with_kg(user_query, userID):
    kg_json_path = "../Backend/KG.json"
    kg_ttl_path = "./KG.ttl"

    print("\n🔍 Loading Knowledge Graphs...")
    kg_json = load_kg_json(kg_json_path)
    kg_ttl, adjacency_list = load_kg_ttl(kg_ttl_path)

    subreddit = "Advice"
    topic = "Human Health"

    print("\n🔍 Retrieving Relevant Comments...")
    context = retrieve_relevant_comments(kg_json, adjacency_list, subreddit, topic)

    print("\n🤖 Querying Groq...")
    response = chat_with_groq(context, user_query, userID)

    print("\n💡 Groq Response:", response)

    return response



