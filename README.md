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

---

## Ontology Logic and Knowledge Graph

---
