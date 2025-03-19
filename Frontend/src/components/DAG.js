import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const DAG = ({ queryResponse }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!queryResponse || !containerRef.current) {
            setError("Missing data or container reference");
            return;
        }

        const container = d3.select(containerRef.current);
        container.selectAll("svg").remove();
        setError(null);

        try {
            // Function to parse structured JSON if available
            const parseResponseToJson = (text) => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    return null;
                }
            };

            let data = parseResponseToJson(queryResponse);

            // If JSON parsing fails, extract entities and relationships dynamically
            if (!data || !data.nodes || !data.links) {
                const sentences = queryResponse.split('. ').filter(s => s.length > 5);
                const words = sentences.map((s, i) => ({ id: `node${i}`, label: s.split(' ')[0] }));
                const links = words.slice(1).map((w, i) => ({
                    source: words[i].id,
                    target: w.id
                }));

                data = { nodes: words, links };
            }

            const width = containerRef.current.clientWidth - 40;
            const height = containerRef.current.clientHeight - 40;

            const svg = container.append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g");

            const simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
                .force("charge", d3.forceManyBody().strength(-300))
                .force("center", d3.forceCenter(width / 2, height / 2));

            const link = svg.append("g")
                .selectAll("line")
                .data(data.links)
                .join("line")
                .attr("stroke", "#999")
                .attr("stroke-width", 2);

            const node = svg.append("g")
                .selectAll(".node")
                .data(data.nodes)
                .join("g")
                .attr("class", "node")
                .call(d3.drag()
                    .on("start", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    })
                    .on("drag", (event, d) => {
                        d.fx = event.x;
                        d.fy = event.y;
                    })
                    .on("end", (event, d) => {
                        if (!event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    })
                );

            node.append("circle")
                .attr("r", 20)
                .attr("fill", "#34D399")
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);

            node.append("text")
                .attr("dy", 5)
                .attr("text-anchor", "middle")
                .text(d => d.label)
                .style("font-size", "12px")
                .style("fill", "#000");

            simulation.on("tick", () => {
                link.attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node.attr("transform", d => `translate(${d.x},${d.y})`);
            });

        } catch (error) {
            console.error("Error rendering DAG:", error);
            setError("Failed to process data.");
        }
    }, [queryResponse]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '500px', border: '1px solid #ddd' }}>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default DAG;
