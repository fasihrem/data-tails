import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const CirclePacking = ({ queryResponse }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!queryResponse || !containerRef.current) {
            console.error("Missing queryResponse or container for CirclePacking");
            setError("Missing data or container reference");
            return;
        }

        const container = d3.select(containerRef.current);
        container.selectAll("svg").remove();
        container.selectAll(".tooltip").remove();
        setError(null);

        try {
            const hierarchicalData = parseQueryResponseToHierarchy(queryResponse);

            const width = containerRef.current.clientWidth;
            const height = 600;
            const margin = { top: 10, right: 10, bottom: 10, left: 10 };

            const svg = container.append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .style("background", "#f5f7fa")  
                .style("border-radius", "12px");

            const tooltip = container.append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background", "rgba(0, 0, 0, 0.8)")
                .style("color", "white")
                .style("border-radius", "6px")
                .style("padding", "6px")
                .style("pointer-events", "none")
                .style("font-size", "10px")
                .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");

            const root = d3.hierarchy(hierarchicalData)
                .sum(d => d.value || 1)
                .sort((a, b) => b.value - a.value);

            const pack = d3.pack()
                .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
                .padding(3);

            const packedData = pack(root);

            const color = d3.scaleOrdinal(d3.schemeSet2);  

            const g = svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const node = g.selectAll("g")
                .data(packedData.descendants().filter(d => !isNaN(d.r) && d.r > 0))
                .join("g")
                .attr("transform", d => `translate(${d.x},${d.y})`);

            node.append("circle")
                .attr("r", d => d.r)
                .attr("fill", d => color(d.depth))
                .attr("fill-opacity", 0.85)
                .attr("stroke", "white")
                .attr("stroke-width", 2)
                .style("cursor", "pointer")
                .on("mouseover", function (event, d) {
                    d3.select(this).attr("stroke-width", 3);
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`<strong>${d.data.name}</strong><br/>${d.value ? `Count: ${d.value}` : ""}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke-width", 2);
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            node.append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .style("font-family", "Arial, sans-serif")
                .style("pointer-events", "none")
                .style("fill", "#000000")  
                .style("font-weight", "bold")
                .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.7)")  
                .each(function (d) {
                    const text = d3.select(this);
                    const name = d.data.name;

                    const fontSize = Math.max(5, Math.min(d.r / 4, 12));  
                    text.style("font-size", fontSize + "px");

                    if (d.r < 10) {
                        text.text("");  
                    } else if (d.r < 25) {
                        text.text(name.substring(0, Math.min(2, name.length)));  
                    } else {
                        const maxChars = Math.floor(d.r / (fontSize * 0.6));
                        text.text(name.length > maxChars ? name.substring(0, maxChars) + "..." : name);
                    }
                });

            const zoom = d3.zoom()
                .scaleExtent([0.5, 5])
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                });

            svg.call(zoom);

        } catch (error) {
            console.error("Error creating CirclePacking:", error);
            setError(error.message);
            container.append("div")
                .attr("class", "error-message")
                .style("color", "red")
                .style("padding", "20px")
                .text(`Error creating CirclePacking: ${error.message}`);
        }
    }, [queryResponse]);

    const parseQueryResponseToHierarchy = (text) => {
        const root = { name: "Categories", children: [] };
        let currentCategory = null;
        const categoryMap = new Map();
        const lines = text.split("\n");
        // Common English stop words to filter out
        const stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
            'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
            'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'when',
            'where', 'who', 'which', 'why', 'how', 'etc', 'other', 'others', 'type', 'types', 'technology', 'technologies', 'and', 'or', 'the', 'of', 'in', 'to', 'from', 'by', 'with', 'as', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'as', 'until', 'while', 'as', 'until', 'while'
        ]);

        // Helper function to clean text by removing stop words
        const removeStopWords = (text) => {
            return text
                .toLowerCase()
                .split(/\s+/)
                .filter(word => !stopWords.has(word))
                .join(' ');
        };

        // Clean the input text before processing
        text = text.split('\n').map(line => {
            if (line.startsWith('**')) {
                // Preserve category headers
                return line;
            }
            return line.split(':').map((part, index) => {
                if (index === 0) {
                    // Preserve subcategory names
                    return part;
                }
                // Clean items
                return part.split(',')
                    .map(item => removeStopWords(item.trim()))
                    .join(',');
            }).join(':');
        }).join('\n');

        lines.forEach(line => {
            const categoryMatch = line.match(/^\*\*([^*:]+)(?:\*\*:|\*\*)/) || line.match(/^\*\*([^*:]+):/);
            if (categoryMatch) {
                currentCategory = categoryMatch[1].trim();
                if (!categoryMap.has(currentCategory)) {
                    const newCategory = { name: currentCategory, children: [] };
                    categoryMap.set(currentCategory, newCategory);
                    root.children.push(newCategory);
                }
            } else if (currentCategory && line.includes(":")) {
                const parts = line.split(":");
                if (parts.length === 2) {
                    const subcategoryName = parts[0].trim();
                    const items = parts[1].split(",").map(item => item.trim());

                    const subcategory = { name: subcategoryName, children: [] };
                    categoryMap.get(currentCategory).children.push(subcategory);

                    items.forEach(item => {
                        if (item) subcategory.children.push({ name: item, value: 1 });
                    });
                }
            }
        });

        root.children = root.children.filter(cat => cat.children.length > 0);
        return root;
    };

    return (
        <div ref={containerRef} 
            style={{ 
                width: "100%",
                height: "600px",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                position: "relative"
            }}
        >
            {!queryResponse && <div style={{ padding: "20px", textAlign: "center" }}>No data provided for Circle Packing visualization</div>}
            {error && <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>}
        </div>
    );
};

export default CirclePacking;
