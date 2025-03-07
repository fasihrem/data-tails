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
csv_file_path = "../Backend/conversation_history.csv"
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


# ✅ Multi-threaded BFS Traversal
def bfs_traverse_parallel(adjacency_list, start_nodes, max_depth=5):
    """Performs parallel BFS traversal for faster subgraph extraction."""
    if not adjacency_list:
        return "❌ Knowledge Graph not loaded."

    visited = set()
    queue = deque([(node, 0) for node in start_nodes])
    nodes_to_display, links_to_display = set(start_nodes), set()
    results = []

    def process_node(current_node, depth):
        if depth < max_depth:
            for s, p, o in adjacency_list.get(current_node, []):
                if isinstance(o, Literal):
                    results.append(str(o))
                else:
                    links_to_display.add((s, p, o))
                    queue.append((str(o), depth + 1))
                    queue.append((str(s), depth + 1))

            visited.add(current_node)

    with ThreadPoolExecutor(max_workers=4) as executor:
        while queue:
            current_node, depth = queue.popleft()
            executor.submit(process_node, current_node, depth)

    return {"context": results[:10]} if results else "❌ Data not found."


# ✅ Fast Context Retrieval
def retrieve_context_fast(kg_json, adjacency_list, user_query):
    """Finds relevant nodes based on user query and retrieves subgraph using BFS."""
    if not kg_json:
        return "❌ KG.json not loaded."

    query_keywords = preprocess_text(user_query)

    # **Step 1: Fast Lookup in KG.json**
    matched_entities = set()
    for entity_id, entity in kg_json.items():
        for key, value in entity.items():
            if isinstance(value, str) and any(keyword in value.lower() for keyword in query_keywords):
                matched_entities.add(entity_id)

    if not matched_entities:
        return "❌ Data not found."

    # **Step 2: BFS traversal in KG.ttl for details**
    context_results = []
    for entity in matched_entities:
        subgraph = bfs_traverse_parallel(adjacency_list, [entity], max_depth=5)
        if subgraph != "❌ Data not found.":
            context_results.extend(subgraph["context"])

    return {"context": context_results[:10]} if context_results else "❌ Data not found."


# ✅ Groq Chat API
def chat_with_groq(context, user_query):
    """Interacts with Groq model using retrieved KG context."""
    global conversation_history

    # Add user message to conversation history
    conversation_history.append({"role": "user", "content": user_query})

    # Create chat prompt
    prompt = f"""
    Context:
    {context}

    Question:
    {user_query}

    Provide a detailed answer based on the context.
    """

    # Call Groq API
    chat_completion = client.chat.completions.create(
        messages=conversation_history,
        model="llama3-8b-8192"
    )

    # Extract response
    response = chat_completion.choices[0].message.content

    # Add response to history
    conversation_history.append({"role": "assistant", "content": response})

    # Update conversation history in CSV
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Role", "Content"])
        for entry in conversation_history:
            writer.writerow([entry["role"], entry["content"]])

    return response


# ✅ Run Main Program
def chat_with_kg(user_query):
    kg_json_path = "../Backend/KG.json"
    kg_ttl_path = "./KG.ttl"

    print("\n🔍 Loading Knowledge Graphs...")
    kg_json = load_kg_json(kg_json_path)
    kg_ttl, adjacency_list = load_kg_ttl(kg_ttl_path)

    # user_query = input("Enter your query: ")

    print("\n🔍 Retrieving Context...")
    context = retrieve_context_fast(kg_json, adjacency_list, user_query)

    print("\n🤖 Querying Groq...")
    response = chat_with_groq(context, user_query)

    print("\n💡 Groq Response:", response)

    return response
