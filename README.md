# reddit-analysis-dashboard
An LLM and a Visualisation dashboard to answer user queries with real-user information taken directly from different subreddits. Dynamic Visualisations will be selected based on the user query and what makes sense. 

# DataTails

### Tagline
**Bridging Data to Insights with Semantic Intelligence**

---

## Overview
DataTails is a data analytics and visualization platform that uses advanced knowledge graphs and ontologies to transform unstructured data into structured, meaningful insights. Designed for handling large, complex datasets, DataTails supports efficient querying and displays relationships between entities through an intuitive graph-based visualization. This project focuses on leveraging machine learning, natural language processing (NLP), and semantic web technologies to provide an enriched analytical experience for users.

---

## Table of Contents
1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Ontology Logic and Knowledge Graph](#ontology-logic-and-knowledge-graph)
5. [Visualization](#visualization)
6. [Installation](#installation)
7. [Future Enhancements](#future-enhancements)

---

## Features
- **Data Structuring with Ontologies**: Transforms unstructured data into structured entities and relationships using ontology principles.
- **Knowledge Graph Generation**: Converts raw data into interactive knowledge graphs that allow for semantic search and relationship discovery.
- **Graph-Based Visualization**: Interactive visualizations help users explore relationships between entities.
- **Natural Language Querying**: Query-based LLM (Language Model) for answering user queries based on the structured knowledge graph.
- **Dynamic Chart Recommendations**: Chart recommendation system based on the data type and query context.
- **Scalability**: Designed to handle and visualize large datasets with efficient data linking and display techniques.

---

## Project Structure
```plaintext
DataTails/
├── src/
│   ├── ontology/              # Ontology logic and knowledge graph generation
│   ├── visualization/         # D3.js scripts for graph visualization
│   ├── data/                  # Raw and processed data files (e.g., JSON, CSV)
│   ├── models/                # ML models and language models for querying and insights
│   └── api/                   # Backend API for data processing and querying
├── D3KG.json                  # JSON file containing nodes and links for visualization
├── index.html                 # Main HTML for visualization with D3.js
└── README.md                  # Project documentation
```
---

## Core Components
- **Ontology Logic:** Handles the transformation of unstructured data into a structured format using predefined ontologies.
- **Knowledge Graph:** Builds an interactive graph that connects entities and relationships for deeper insights.
- **Dynamic Querying:** Integrates with LLMs to provide intelligent responses to user queries based on the knowledge graph.
- **Visualization:** Offers dynamic, real-time visualizations of data and relationships using D3.js.
- **API Integration:** Facilitates seamless communication between the frontend, backend, and the underlying models.

---

## Ontology Logic and Knowledge Graph
- **Ontology Creation:** Based on the principles of RDF (Resource Description Framework), data is structured into triples (subject-predicate-object) to represent relationships.
- **Knowledge Graph Generation:** The graph is dynamically built using user data and predefined schemas, represented in JSON (D3KG.json) for visualization.
- **Semantic Search:** Enables users to perform context-aware searches within the graph using natural language.
- **Customization:** Ontologies and graph schemas can be extended for domain-specific applications.

---
