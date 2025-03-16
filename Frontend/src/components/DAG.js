import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const DAG = ({ queryResponse }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Debug data
        console.log("DAG queryResponse received:", queryResponse);
        
        if (!queryResponse || !containerRef.current) {
            console.error("Missing queryResponse or container for DAG");
            setError("Missing data or container reference");
            return;
        }

        // Clear previous visualization and errors
        const container = d3.select(containerRef.current);
        container.selectAll("svg").remove();
        container.selectAll(".tooltip").remove();
        container.selectAll(".error-message").remove();
        setError(null);

        try {
            // Parse the query response to extract entities and relationships
            const parseQueryResponse = (text) => {
                const entities = new Map(); // Use Map to avoid duplicates
                const relationships = [];
                
                // Find all bold entities which might be nodes
                const boldPattern = /\*\*([^*]+)\*\*/g;
                const boldMatches = [...text.matchAll(boldPattern)];
                
                // Extract all bold entities as potential nodes
                boldMatches.forEach(match => {
                    const name = match[1].trim();
                    // Skip common formatting words that aren't entities
                    if (!['Note:', 'Major Tech Companies:', 'Acquisitions:', 'Partnerships:', 
                         'Competitive Relationships:', 'Other Relationships:', 'Analysis:', 
                         'Conclusion:'].includes(name)) {
                        
                        // Check if it's a company with a ticker
                        const tickerMatch = name.match(/(.+)\s+\(([A-Z]+)\)/);
                        if (tickerMatch) {
                            const companyName = tickerMatch[1].trim();
                            const ticker = tickerMatch[2];
                            if (!entities.has(companyName)) {
                                entities.set(companyName, {
                                    id: companyName,
                                    label: companyName,
                                    ticker: ticker,
                                    type: 'company'
                                });
                            }
                        } else if (!entities.has(name)) {
                            entities.set(name, {
                                id: name,
                                label: name,
                                type: 'entity'
                            });
                        }
                    }
                });
                
                // Look for relationship patterns in the text
                // 1. Acquisition pattern: "Company" + "acquired" + "Target"
                const acquisitionLines = text.split('\n');
                acquisitionLines.forEach(line => {
                    // Match acquisition patterns like "+ Entity (Year)" or "acquired Entity in Year"
                    const acquisitionMatch = line.match(/\+\s*([^(]+)(?:\((\d{4})\))?/);
                    if (acquisitionMatch) {
                        // Find the parent company by looking at previous lines
                        let parentCompany = null;
                        let i = acquisitionLines.indexOf(line) - 1;
                        while (i >= 0) {
                            const companyMatch = acquisitionLines[i].match(/\*\s*\*\*([^*]+)\*\*:/);
                            if (companyMatch) {
                                parentCompany = companyMatch[1].trim();
                                break;
                            }
                            i--;
                        }
                        
                        if (parentCompany && entities.has(parentCompany)) {
                            const target = acquisitionMatch[1].trim();
                            const year = acquisitionMatch[2];
                            
                            // Add target as entity if not exists
                            if (!entities.has(target)) {
                                entities.set(target, {
                                    id: target,
                                    label: target,
                                    type: 'acquisition',
                                    year: year
                                });
                            }
                            
                            // Add relationship
                            relationships.push({
                                source: parentCompany,
                                target: target,
                                type: 'acquisition',
                                year: year
                            });
                        }
                    }
                });
                
                // 2. Partnership pattern: "partnership with"
                const partnershipPattern = /partnership with\s+([^(,]+)/gi;
                const partnershipMatches = [...text.matchAll(partnershipPattern)];
                
                partnershipMatches.forEach(match => {
                    const partner = match[1].trim().replace(/\*\*/g, '');
                    
                    // Find the parent company and context
                    const context = text.substring(Math.max(0, match.index - 100), match.index);
                    const companyMatch = context.match(/\*\*([^*]+)\*\*:/);
                    
                    if (companyMatch) {
                        const company = companyMatch[1].trim();
                        
                        // Add partner as entity if not exists
                        if (!entities.has(partner)) {
                            entities.set(partner, {
                                id: partner,
                                label: partner,
                                type: 'partner'
                            });
                        }
                        
                        // Extract year and domain if available
                        const yearMatch = match[0].match(/\((\d{4})\)/);
                        const year = yearMatch ? yearMatch[1] : null;
                        
                        const domainMatch = match[0].match(/on\s+([^)]+)/);
                        const domain = domainMatch ? domainMatch[1].trim() : null;
                        
                        // Add relationship
                        relationships.push({
                            source: company,
                            target: partner,
                            type: 'partnership',
                            year: year,
                            domain: domain
                        });
                    }
                });
                
                // 3. Competitive pattern: "vs."
                const competitivePattern = /\*\*([^*]+)\*\*\s+vs\.\s+\*\*([^*]+)\*\*/g;
                const competitiveMatches = [...text.matchAll(competitivePattern)];
                
                competitiveMatches.forEach(match => {
                    const company1 = match[1].trim();
                    const company2 = match[2].trim();
                    
                    // Extract description if available
                    const context = text.substring(match.index, match.index + 200);
                    const descriptionMatch = context.match(/:\s+([^.]+)/);
                    const description = descriptionMatch ? descriptionMatch[1].trim() : null;
                    
                    // Add relationship
                    relationships.push({
                        source: company1,
                        target: company2,
                        type: 'competitive',
                        description: description
                    });
                });
                
                // 4. Generic relationship pattern: "and"
                const genericPattern = /\*\*([^*]+)\*\*\s+and\s+\*\*([^*]+)\*\*/g;
                const genericMatches = [...text.matchAll(genericPattern)];
                
                genericMatches.forEach(match => {
                    const entity1 = match[1].trim();
                    const entity2 = match[2].trim();
                    
                    // Extract description if available
                    const context = text.substring(match.index, match.index + 200);
                    const descriptionMatch = context.match(/:\s+([^.]+)/);
                    const description = descriptionMatch ? descriptionMatch[1].trim() : null;
                    
                    // Add relationship if not already captured by other patterns
                    const alreadyExists = relationships.some(r => 
                        (r.source === entity1 && r.target === entity2) || 
                        (r.source === entity2 && r.target === entity1)
                    );
                    
                    if (!alreadyExists) {
                        relationships.push({
                            source: entity1,
                            target: entity2,
                            type: 'generic',
                            description: description
                        });
                    }
                });
                
                // If no relationships were found, create some default ones
                if (relationships.length === 0 && entities.size > 1) {
                    console.log("No relationships found, creating default connections");
                    
                    // Convert entities Map to array
                    const entitiesArray = Array.from(entities.keys());
                    
                    // Create sequential connections
                    for (let i = 0; i < entitiesArray.length - 1; i++) {
                        relationships.push({
                            source: entitiesArray[i],
                            target: entitiesArray[i + 1],
                            type: 'default'
                        });
                    }
                    
                    // Add some cross connections for more interesting graph
                    if (entitiesArray.length > 3) {
                        for (let i = 0; i < Math.min(3, Math.floor(entitiesArray.length / 2)); i++) {
                            const source = entitiesArray[i];
                            const target = entitiesArray[i + 2];
                            
                            // Check if this connection already exists
                            const alreadyExists = relationships.some(r => 
                                (r.source === source && r.target === target) || 
                                (r.source === target && r.target === source)
                            );
                            
                            if (!alreadyExists) {
                                relationships.push({
                                    source: source,
                                    target: target,
                                    type: 'default'
                                });
                            }
                        }
                    }
                }
                
                return {
                    nodes: Array.from(entities.values()),
                    links: relationships.map(r => ({
                        source: r.source,
                        target: r.target,
                        type: r.type,
                        year: r.year,
                        domain: r.domain,
                        description: r.description
                    }))
                };
            };
            
            // Parse the query response
            const data = parseQueryResponse(queryResponse);
            console.log("Parsed data:", data);
            
            if (data.nodes.length === 0) {
           //     setError("No entities found in the response");
                return;
            }
            
            // Set up the SVG dimensions
            const width = containerRef.current.clientWidth - 40; // Padding
            const height = containerRef.current.clientHeight - 40; // Padding
            
            // Create SVG
            const svg = container.append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto;")
                .append("g");
            
            // Create tooltip
            const tooltip = container.append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "1px solid #ddd")
                .style("border-radius", "4px")
                .style("padding", "8px")
                .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
                .style("pointer-events", "none")
                .style("font-size", "12px")
                .style("z-index", "10");
            
            // Define arrow markers for different relationship types
            const defs = svg.append("defs");
            
            // Define a beautiful gradient for nodes - GREEN GRADIENT
            const gradient = defs.append("linearGradient")
                .attr("id", "node-gradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "100%");
                
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#34D399"); // Light green
                
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#10B981"); // Darker green
            
            // Create a force simulation
            const simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links)
                    .id(d => d.id)
                    .distance(100))
                .force("charge", d3.forceManyBody()
                    .strength(-800))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("x", d3.forceX(width / 2).strength(0.1))
                .force("y", d3.forceY(height / 2).strength(0.1))
                .force("collision", d3.forceCollide().radius(40));
            
            // Create links
            const link = svg.append("g")
                .selectAll("line")
                .data(data.links)
                .join("line")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.8)
                .attr("stroke-width", 2);
            
            // Create node groups
            const node = svg.append("g")
                .selectAll(".node")
                .data(data.nodes)
                .join("g")
                .attr("class", "node")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .style("cursor", "pointer");
            
            // Add circles to nodes with beautiful styling - SMALLER SIZE
            node.append("circle")
                .attr("r", 25) // Reduced from 30 to 25
                .attr("fill", "url(#node-gradient)")
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
                .style("filter", "drop-shadow(0px 3px 3px rgba(0,0,0,0.2))")
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr("r", 28) // Reduced from 35 to 28
                        .attr("stroke-width", 3);
                    
                    let tooltipContent = `<strong>${d.label}</strong><br>`;
                    if (d.ticker) tooltipContent += `Ticker: ${d.ticker}<br>`;
                    if (d.year) tooltipContent += `Year: ${d.year}<br>`;
                    if (d.type) tooltipContent += `Type: ${d.type}`;
                    
                    tooltip.html(tooltipContent)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px")
                        .style("opacity", 1);
                    
                    // Highlight connected links and nodes
                    link.style("stroke", l => 
                        (l.source.id === d.id || l.target.id === d.id) ? "#10B981" : "#999")
                        .style("stroke-opacity", l => 
                        (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2)
                        .style("stroke-width", l => 
                        (l.source.id === d.id || l.target.id === d.id) ? 3 : 1);
                    
                    node.style("opacity", n => 
                        (n.id === d.id || isConnected(d, n)) ? 1 : 0.3);
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr("r", 25) // Reduced from 30 to 25
                        .attr("stroke-width", 2);
                    
                    tooltip.style("opacity", 0);
                    
                    // Restore all links and nodes
                    link.style("stroke", "#999")
                        .style("stroke-opacity", 0.8)
                        .style("stroke-width", 2);
                    node.style("opacity", 1);
                });
            
            // Add labels to nodes with improved styling - BLACK TEXT
            node.append("text")
                .attr("dy", 5)
                .attr("text-anchor", "middle")
                .text(d => {
                    // Use ticker if available, otherwise use short label
                    if (d.ticker) return d.ticker;
                    
                    // Truncate long labels
                    const maxLength = 8;
                    return d.label.length > maxLength ? d.label.substring(0, maxLength) + '...' : d.label;
                })
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .style("fill", "#000") // Changed from #fff to #000 for black text
                .style("pointer-events", "none");
            
            // Helper function to check if nodes are connected
            function isConnected(a, b) {
                return data.links.some(l => 
                    (l.source.id === a.id && l.target.id === b.id) || 
                    (l.source.id === b.id && l.target.id === a.id)
                );
            }
            
            // Add zoom capability
            const zoom = d3.zoom()
                .scaleExtent([0.5, 3])
                .on("zoom", (event) => {
                    svg.attr("transform", event.transform);
                });
            
            d3.select(containerRef.current).select("svg")
                .call(zoom)
                .on("dblclick.zoom", null); // Disable double-click zoom
            
            // Fit nodes to screen after simulation stabilizes
            simulation.on("end", () => {
                // Calculate bounds
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                data.nodes.forEach(d => {
                    minX = Math.min(minX, d.x);
                    minY = Math.min(minY, d.y);
                    maxX = Math.max(maxX, d.x);
                    maxY = Math.max(maxY, d.y);
                });
                
                // Add padding
                const padding = 50;
                minX -= padding;
                minY -= padding;
                maxX += padding;
                maxY += padding;
                
                // Calculate scale and translate
                const scale = Math.min(
                    width / (maxX - minX),
                    height / (maxY - minY)
                );
                
                // Don't scale up too much for small graphs
                const boundedScale = Math.min(scale, 1.5);
                
                const translateX = width / 2 - (minX + maxX) / 2 * boundedScale;
                const translateY = height / 2 - (minY + maxY) / 2 * boundedScale;
                
                // Apply transform
                d3.select(containerRef.current).select("svg")
                    .transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity
                        .translate(translateX, translateY)
                        .scale(boundedScale));
            });
            
            // Update positions on simulation tick
            simulation.on("tick", () => {
                // Constrain nodes to viewport with padding
                const padding = 40;
                data.nodes.forEach(d => {
                    d.x = Math.max(padding, Math.min(width - padding, d.x));
                    d.y = Math.max(padding, Math.min(height - padding, d.y));
                });
                
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
                
                node
                    .attr("transform", d => `translate(${d.x},${d.y})`);
            });
            
            // Drag functions
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
        } catch (error) {
            console.error("Error creating DAG:", error);
            setError(error.message);
            
            // Display error message
            container.append("div")
                .attr("class", "error-message")
                .style("color", "red")
                .style("padding", "20px")
                .text(`Error creating DAG: ${error.message}`);
        }
    }, [queryResponse]);
    
    return (
        <div ref={containerRef} 
            style={{ 
                width: '100%',
                height: '600px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative'
            }}
        >
            {!queryResponse && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    No data provided for DAG visualization
                </div>
            )}
            {error && (
                <div style={{ color: 'red', padding: '20px' }}>
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default DAG;
