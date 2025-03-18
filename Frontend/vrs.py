import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load NLP models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer('all-MiniLM-L6-v2')

# Define visualization categories conceptually
chart_types = {
    "bar_chart": "Used for comparing categories or ranking values.",
    "line_chart": "Best for showing trends over time or sequential data.",
    "area_chart": "Shows cumulative data trends with a filled area.",
    "scatterplot": "Visualizes relationships or correlations between two variables.",
    "density_facet": "Represents distribution patterns across multiple facets.",
    "gradient_encoding": "Indicates intensity or magnitude with color gradients.",
    "candlestick_chart": "Commonly used for stock market trends and price movements.",
    "stacked_normalized_area_chart": "Shows part-to-whole relationships over time.",
    "circle_packing": "Represents hierarchical relationships in a compact form.",
    "dendrogram": "Illustrates hierarchical clustering or tree structures.",
    "DAG": "Shows directed relationships, commonly used for processes or networks.",
    "treemap": "Depicts hierarchical structures using nested rectangles.",
    "chord_diagram": "Best for visualizing relationships and interactions.",
    "heatmap": "Displays intensity values in a matrix format.",
    "connection_map": "Visualizes spatial relationships and geographic data.",
    "maps": "Represents geographic data with location-based insights.",
    "map_small_multiples": "Shows multiple maps for comparison.",
    "hexbin_map": "Aggregates spatial data into hexagonal bins.",
    "centerline_labelling": "Enhances map readability with labeled centerlines.",
    "voronoi_map": "Divides spatial regions based on distance.",
    "sorted_heatmap": "Ranks and sorts data in a matrix format."
}

# Precompute chart category embeddings
category_embeddings = {
    chart: model.encode(description, normalize_embeddings=True)
    for chart, description in chart_types.items()
}

# Function to extract features from both the query and response
def extract_features(query, response):
    """Extracts numerical data, locations, trends, and relationships from text."""
    combined_text = query + " " + response
    doc = nlp(combined_text)

    numbers = [token.text for token in doc if token.like_num]
    locations = [ent.text for ent in doc.ents if ent.label_ in {"GPE", "LOC"}]

    trend_keywords = {"increase", "decline", "growth", "rise", "drop", "trend", "fall", "reduce", "expansion"}
    trends = [token.lemma_ for token in doc if token.lemma_ in trend_keywords]

    relationship_keywords = {"prefer", "dominate", "compared", "versus", "majority", "minority"}
    relationships = [token.lemma_ for token in doc if token.lemma_ in relationship_keywords]

    ranking_keywords = {"ranking", "top", "best", "percent", "favorite", "most popular"}
    rankings = [token.lemma_ for token in doc if token.lemma_ in ranking_keywords]

    geo_terms = {"earthquake", "magnitude", "epicenter", "seismic", "hurricane", "flood", "storm"}
    geo_features = [token.lemma_ for token in doc if token.lemma_ in geo_terms]

    keywords = [token.lemma_ for token in doc if token.is_alpha and not token.is_stop]

    return {
        "numbers": numbers,
        "locations": locations,
        "trends": trends,
        "relationships": relationships,
        "geo_features": geo_features,
        "rankings": rankings,
        "keywords": keywords
    }

# Adjust similarity scores based on extracted features
def boost_scores(scores, response_type, features):
    """Dynamically boosts scores based on response type and detected keywords."""
    boosts = {
        "numeric": {"bar_chart": 0.6, "line_chart": 0.5, "heatmap": 0.4},
        "geographic": {"maps": 0.7, "connection_map": 0.6, "hexbin_map": 0.5, "voronoi_map": 0.5},
        "textual": {"scatterplot": 0.2, "DAG": 0.2, "chord_diagram": 0.2}
    }

    if response_type in boosts:
        for chart, boost in boosts[response_type].items():
            scores[chart] += boost

    if features["trends"]:
        scores["line_chart"] += 0.6
        scores["area_chart"] += 0.5

    if features["relationships"]:
        scores["bar_chart"] += 0.6
        scores["chord_diagram"] += 0.5

    if features["geo_features"]:
        scores["maps"] += 0.7
        scores["connection_map"] += 0.6
        scores["hexbin_map"] += 0.5

    if features["rankings"]:
        scores["bar_chart"] += 0.7
        scores["sorted_heatmap"] += 0.5

    return scores

# Function to recommend visualizations
def recommend_visualizations(query, response):
    """Recommends the most relevant visualizations based on query and response context."""
    features = extract_features(query, response)
    response_embedding = model.encode(query + " " + response, normalize_embeddings=True)

    similarity_scores = {
        chart: cosine_similarity([response_embedding], [embedding]).flatten()[0]
        for chart, embedding in category_embeddings.items()
    }

    similarity_scores = boost_scores(similarity_scores, "numeric", features)

    top_recommendations = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)[:3]

    return [(chart, round(score, 2)) for chart, score in top_recommendations]



def getViz(user_input, response):
    # Example Usage
    user_query = "Show iphone vs Samsung smartphone market share"
    groq_response = "A crucial topic in the tech world! Let's create a visualization of the iPhone vs Samsung smartphone market share. Market Share Trends:  2011: iPhone held around 25% of the global smartphone market share, while Samsung had around 10%.  2014: iPhone's market share peaked at around 46%, while Samsung's share reached 31%.  2018: Samsung surpassed Apple, with a market share of around 21.5%, compared to iPhone's 17.9%.  2020: The competition remained intense, with Samsung holding 22.1% of the market share, and iPhone holding 17.4%. Visual Representation: Here's a simplified visualization of the iPhone vs Samsung smartphone market share: mermaid graph LR subgraph 'Global Smartphone Market Share' iPhone -->|2011| 25% Samsung -->|2011| 10% iPhone -->|2014| 46% Samsung -->|2014| 31% iPhone -->|2018| 17.9% Samsung -->|2018| 21.5% iPhone -->|2020| 17.4% Samsung -->|2020| 22.1% end  This diagram shows the changing market share of iPhone and Samsung over the years, with arrows indicating the direction of change. Note that this is a simplified representation and is not meant to be a comprehensive or scientifically accurate diagram. Some interesting statistics:  As of 2020, the global smartphone market size was estimated to be around 1.5 billion devices.  Samsung's share of the global smartphone market has been steadily increasing since 2011, with a growth rate of around 2% per annum.  Apple's share of the global smartphone market has been relatively flat since 2018, with a growth rate of around 0.2% per annum."

    recommended_charts = recommend_visualizations(user_input, response)

    return recommended_charts
