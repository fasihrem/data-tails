import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load NLP models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer('all-MiniLM-L6-v2')

# Define visualization categories
chart_types = {
    "area_chart": "Shows cumulative data trends with a filled area.",
    "bar_chart": "Used for comparing categories or ranking values.",
    "chord_diagram": "Best for visualizing relationships and interactions.",
    "circle_packing": "Represents hierarchical relationships in a compact form.",
    "connection_map": "Visualizes spatial relationships and geographic data.",
    "DAG": "Shows directed relationships, commonly used for processes or networks.",
    "donut_chart": "A variation of the pie chart, highlighting proportions.",
    "heatmap_chart": "Displays intensity values in a matrix format.",
    "line_chart": "Best for showing trends over time or sequential data.",
    "mosaic_plot": "Used to show the relationship between categorical variables.",
    "network_graph": "Illustrates complex relationships in networks.",
    "polar_area": "Represents cyclic data with proportionally scaled segments.",
    "small_multiples": "Facilitates comparisons across multiple categories.",
    "stacked_area_chart": "Shows part-to-whole relationships over time.",
    "sunburst_chart": "Depicts hierarchical data as concentric layers.",
    "tree_diagram": "Illustrates hierarchical relationships in tree structure.",
    "treemap_chart": "Depicts hierarchical structures using nested rectangles.",
    "voronoi_map": "Divides spatial regions based on distance.",
    "word_cloud": "Visualizes common words and keyword frequency in text-heavy data."
}

# Precompute chart category embeddings
category_embeddings = {
    chart: model.encode(description, normalize_embeddings=True)
    for chart, description in chart_types.items()
}


# Extract features from query & response
def extract_features(query, response):
    """Extracts key elements from the query-response pair."""
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

    # Identify text-heavy responses
    is_text_heavy = len(keywords) > 30

    return {
        "numbers": numbers,
        "locations": locations,
        "trends": trends,
        "relationships": relationships,
        "geo_features": geo_features,
        "rankings": rankings,
        "keywords": keywords,
        "is_text_heavy": is_text_heavy  # New feature
    }


# Adjust scores based on extracted features
def boost_scores(scores, response_type, features):
    """Boosts scores dynamically based on detected features."""
    boosts = {
        "numeric": {"bar_chart": 0.6, "line_chart": 0.5, "heatmap_chart": 0.4},
        "geographic": {"connection_map": 0.7, "voronoi_map": 0.6, "network_graph": 0.5},
        "textual": {"word_cloud": 0.7, "chord_diagram": 0.5}
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
        scores["connection_map"] += 0.7
        scores["network_graph"] += 0.6

    if features["rankings"]:
        scores["bar_chart"] += 0.7
        scores["mosaic_plot"] += 0.5

    # Ensure Word Cloud is boosted for text-heavy responses
    if features["is_text_heavy"]:
        scores["word_cloud"] += 1.0

    return scores


# Function to recommend all visualizations
def recommend_visualizations(query, response):
    """Recommends a ranked list of all visualizations."""
    features = extract_features(query, response)
    response_embedding = model.encode(query + " " + response, normalize_embeddings=True)

    similarity_scores = {
        chart: cosine_similarity([response_embedding], [embedding]).flatten()[0]
        for chart, embedding in category_embeddings.items()
    }

    # Apply feature-based score boosts
    similarity_scores = boost_scores(similarity_scores, "numeric", features)

    # Normalize scores for better ranking
    min_score = min(similarity_scores.values())
    max_score = max(similarity_scores.values())
    if max_score - min_score > 0:  # Avoid division by zero
        for chart in similarity_scores:
            similarity_scores[chart] = (similarity_scores[chart] - min_score) / (max_score - min_score)

    # Sort and return all charts
    ranked_charts = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)[:4]

    return [(chart, round(score, 2)) for chart, score in ranked_charts]


def getViz(user_query, response):
    recommended_charts = recommend_visualizations(user_query, response)
    for chart, score in recommended_charts:
        print(f"{chart}: {score}")

    return recommended_charts
