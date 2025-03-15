import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const ConnectionMap = ({ queryResponse, theme = 'light' }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);

    const processQueryData = (text) => {
        try {
            if (!text) return { connections: [] };

            const connections = [];
            const queryType = detectQueryType(text);

            // Extract sections and points
            const sections = text.split(/\*\*[^*]+\*\*/g).filter(Boolean);
            const pointPattern = /\d+\.\s+\*\*([^*]+)\*\*:?\s*([^.]+)/g;
            let match;

            while ((match = pointPattern.exec(text)) !== null) {
                const [_, title, description] = match;
                
                // Extract countries and cities using expanded patterns
                const locationPattern = /\b(?:United States|United Kingdom|South Korea|New Zealand|[A-Z][a-z]+ ?(?:[A-Z][a-z]+)*)\b/g;
                const cityPattern = /\b(?:Los Angeles|New York|Hong Kong|San Francisco|Las Vegas|[A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g;
                
                const locations = [...new Set([
                    ...(title.match(locationPattern) || []),
                    ...(description.match(locationPattern) || []),
                    ...(title.match(cityPattern) || []),
                    ...(description.match(cityPattern) || [])
                ])];

                // Create connections between consecutive locations
                for (let i = 0; i < locations.length - 1; i++) {
                    // Calculate connection value based on context
                    let value = 2;
                    const context = (title + description).toLowerCase();
                    
                    if (context.includes('major') || context.includes('busy') || 
                        context.includes('largest') || context.includes('significant')) {
                        value = 4;
                    } else if (context.includes('growing') || context.includes('important')) {
                        value = 3;
                    }

                    connections.push({
                        source: locations[i],
                        target: locations[i + 1],
                        value: value,
                        type: queryType,
                        description: description.trim(),
                        volume: context.includes('high') || context.includes('busy') ? 'High' :
                                context.includes('growing') ? 'Medium' : 'Normal'
                    });
                }
            }

            // Add special handling for data centers and music tours
            if (queryType === 'technology' || queryType === 'culture') {
                const cityPattern = /\b(?:Los Angeles|New York|Hong Kong|San Francisco|[A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g;
                const cities = text.match(cityPattern) || [];
                
                // Create hub-and-spoke connections for data centers
                if (cities.length > 1) {
                    const mainHub = cities[0];
                    cities.slice(1).forEach(city => {
                        connections.push({
                            source: mainHub,
                            target: city,
                            value: 3,
                            type: queryType,
                            description: `Major ${queryType === 'technology' ? 'data center' : 'music venue'} connection`,
                            volume: 'High'
                        });
                    });
                }
            }

            return { connections };
        } catch (error) {
            console.error("Error processing query:", error);
            return { connections: [] };
        }
    };

    const detectQueryType = (text) => {
        const keywords = {
            trade: ['trade', 'shipping', 'port', 'export', 'import'],
            technology: ['data center', 'server', 'cloud', 'internet'],
            culture: ['music', 'concert', 'tour', 'performance'],
            travel: ['tourism', 'travel', 'flight'],
            health: ['virus', 'pandemic', 'disease'],
            military: ['military', 'defense', 'weapons']
        };

        const content = text.toLowerCase();
        for (const [type, words] of Object.entries(keywords)) {
            if (words.some(word => content.includes(word))) {
                return type;
            }
        }
        return 'general';
    };

    const getConnectionStyle = (type) => {
        return {
            trade: { color: "#1976D2", opacity: 0.7 },
            technology: { color: "#00BCD4", opacity: 0.7 },
            culture: { color: "#9C27B0", opacity: 0.6 },
            travel: { color: "#4CAF50", opacity: 0.6 },
            health: { color: "#E91E63", opacity: 0.7, dasharray: "5,5" },
            military: { color: "#D32F2F", opacity: 0.7 },
            general: { color: "#757575", opacity: 0.5 }
        }[type] || { color: "#757575", opacity: 0.5 };
    };

    const renderConnectionMap = useCallback(() => {
        if (!containerRef.current || !svgRef.current || !queryResponse) {
            console.log("Missing refs or query response:", {
                container: !!containerRef.current,
                svg: !!svgRef.current,
                queryResponse: !!queryResponse
            });
            return;
        }

        // Clear previous rendering
        d3.select(svgRef.current).selectAll("*").remove();

        // Get container dimensions
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 600;
        console.log("Container dimensions:", width, height);

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background-color", theme === 'dark' ? '#2d3748' : '#ffffff');

        // Create map group
        const g = svg.append("g");

        // Create projection
        const projection = d3.geoMercator()
            .scale(width / 2 / Math.PI)
            .translate([width / 2, height / 2]);

        // Create path generator
        const path = d3.geoPath().projection(projection);

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Load world map data
        console.log("Loading world map data...");
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
            .then(worldData => {
                const countries = topojson.feature(worldData, worldData.objects.countries).features;
                
                // Track connected countries
                const connectedCountries = new Set();
                const processedData = processQueryData(queryResponse);
                
                if (processedData.connections) {
                    processedData.connections.forEach(conn => {
                        connectedCountries.add(conn.source.toLowerCase());
                        connectedCountries.add(conn.target.toLowerCase());
                    });
                }

                // Draw base map with highlighted connected countries
                g.selectAll("path.country")
                    .data(countries)
                    .enter()
                    .append("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .attr("fill", d => {
                        const isConnected = connectedCountries.has(d.properties.name.toLowerCase());
                        return isConnected ? "#90CAF9" : "#e0e0e0";
                    })
                    .attr("stroke", "#999")
                    .attr("stroke-width", d => {
                        const isConnected = connectedCountries.has(d.properties.name.toLowerCase());
                        return isConnected ? 1 : 0.5;
                    });

                // Add labels for connected countries with improved styling
                const addLabel = (country, centroid) => {
                    // Calculate label width based on text length
                    const labelPadding = 10;
                    const fontSize = 12;
                    const labelWidth = country.properties.name.length * (fontSize * 0.6) + (labelPadding * 2);
                    
                    // Add label background with drop shadow
                    g.append("rect")
                        .attr("x", centroid[0] - (labelWidth / 2))
                        .attr("y", centroid[1] - 10)
                        .attr("width", labelWidth)
                        .attr("height", 20)
                        .attr("fill", "white")
                        .attr("stroke", "#ccc")
                        .attr("stroke-width", 1)
                        .attr("rx", 4)
                        .attr("ry", 4)
                        .attr("filter", "url(#drop-shadow)")
                        .attr("opacity", 0.9);

                    // Add country label
                    g.append("text")
                        .attr("x", centroid[0])
                        .attr("y", centroid[1])
                        .attr("text-anchor", "middle")
                        .attr("alignment-baseline", "middle")
                        .attr("font-size", `${fontSize}px`)
                        .attr("font-family", "Arial, sans-serif")
                        .attr("font-weight", "600")
                        .attr("fill", "#333")
                        .attr("class", "country-label")
                        .text(country.properties.name);
                };

                // Add drop shadow filter
                const defs = svg.append("defs");
                const filter = defs.append("filter")
                    .attr("id", "drop-shadow")
                    .attr("height", "130%");

                filter.append("feGaussianBlur")
                    .attr("in", "SourceAlpha")
                    .attr("stdDeviation", 2)
                    .attr("result", "blur");

                filter.append("feOffset")
                    .attr("in", "blur")
                    .attr("dx", 1)
                    .attr("dy", 1)
                    .attr("result", "offsetBlur");

                const feMerge = filter.append("feMerge");
                feMerge.append("feMergeNode")
                    .attr("in", "offsetBlur");
                feMerge.append("feMergeNode")
                    .attr("in", "SourceGraphic");

                // Adjust label positions to avoid overlaps
                const adjustLabelPositions = (countries, connectedCountries) => {
                    const labels = [];
                    
                    countries.forEach(country => {
                        if (connectedCountries.has(country.properties.name.toLowerCase())) {
                            const centroid = path.centroid(country);
                            if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
                                labels.push({
                                    country,
                                    centroid,
                                    width: country.properties.name.length * 7 + 20,
                                    height: 20
                                });
                            }
                        }
                    });

                    // Sort labels by x position to handle overlaps
                    labels.sort((a, b) => a.centroid[0] - b.centroid[0]);

                    // Adjust vertical positions if labels overlap
                    for (let i = 0; i < labels.length - 1; i++) {
                        const current = labels[i];
                        const next = labels[i + 1];
                        
                        if (Math.abs(current.centroid[0] - next.centroid[0]) < (current.width + next.width) / 2) {
                            // Offset the second label vertically
                            next.centroid[1] += 25;
                        }
                    }

                    // Add adjusted labels
                    labels.forEach(label => {
                        addLabel(label.country, label.centroid);
                    });
                };

                // Use the adjusted label positioning in the main render flow
                if (processedData.connections && processedData.connections.length > 0) {
                    const connectedCountries = new Set(
                        processedData.connections.flatMap(conn => 
                            [conn.source.toLowerCase(), conn.target.toLowerCase()]
                        )
                    );
                    
                    adjustLabelPositions(countries, connectedCountries);
                }

                // Create tooltip div at the start
                const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "map-tooltip")
                    .style("opacity", 0)
                    .style("position", "absolute")
                    .style("background", "white")
                    .style("padding", "10px")
                    .style("border", "1px solid #ddd")
                    .style("border-radius", "4px")
                    .style("pointer-events", "none")
                    .style("font-size", "12px")
                    .style("max-width", "300px")
                    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

                // Draw connections with hover effects
                if (processedData.connections && processedData.connections.length > 0) {
                    processedData.connections.forEach(conn => {
                        const sourceCountry = countries.find(c => 
                            c.properties.name.toLowerCase().includes(conn.source.toLowerCase())
                        );
                        const targetCountry = countries.find(c => 
                            c.properties.name.toLowerCase().includes(conn.target.toLowerCase())
                        );

                        if (sourceCountry && targetCountry) {
                            const source = path.centroid(sourceCountry);
                            const target = path.centroid(targetCountry);

                            if (source && target && !isNaN(source[0]) && !isNaN(target[0])) {
                                const style = getConnectionStyle(conn.type);
                                const dx = target[0] - source[0];
                                const dy = target[1] - source[1];
                                const curve = `M ${source[0]},${source[1]} ` +
                                            `Q ${(source[0] + target[0])/2},${(source[1] + target[1])/2 - Math.abs(dx/4)} ` +
                                            `${target[0]},${target[1]}`;

                                // Add connection path with hover effects
                                g.append("path")
                                    .datum(conn)
                                    .attr("class", "connection")
                                    .attr("d", curve)
                                    .attr("stroke", style.color)
                                    .attr("stroke-width", conn.value || 2)
                                    .attr("stroke-dasharray", style.dasharray || "none")
                                    .attr("fill", "none")
                                    .attr("opacity", style.opacity)
                                    .style("cursor", "pointer")
                                    .on("mouseover", function(event) {
                                        // Highlight current connection
                                        d3.select(this)
                                            .transition()
                                            .duration(200)
                                            .attr("stroke-width", (conn.value || 2) * 2)
                                            .attr("opacity", 0.9);

                                        // Highlight connected countries
                                        g.selectAll("path.country")
                                            .filter(d => 
                                                d.properties.name === conn.source || 
                                                d.properties.name === conn.target
                                            )
                                            .transition()
                                            .duration(200)
                                            .attr("fill", "#90CAF9");

                                        // Update tooltip usage in mouseover
                                        const tooltipContent = `
                                            <div style="font-weight: bold;">${conn.source} → ${conn.target}</div>
                                            <div style="margin-top: 5px;">${conn.description || ''}</div>
                                            ${conn.volume ? `<div style="margin-top: 3px;">Volume: ${conn.volume}</div>` : ''}
                                            ${conn.type ? `<div style="margin-top: 3px;">Type: ${conn.type}</div>` : ''}
                                        `;

                                        tooltip
                                            .style("opacity", 1)
                                            .html(tooltipContent)
                                            .style("left", (event.pageX + 10) + "px")
                                            .style("top", (event.pageY - 10) + "px");
                                    })
                                    .on("mouseout", function() {
                                        // Reset current connection
                                        d3.select(this)
                                            .transition()
                                            .duration(200)
                                            .attr("stroke-width", conn.value || 2)
                                            .attr("opacity", style.opacity);

                                        // Reset country colors
                                        g.selectAll("path.country")
                                            .transition()
                                            .duration(200)
                                            .attr("fill", d => {
                                                const isConnected = processedData.connections.some(c => 
                                                    c.source === d.properties.name || 
                                                    c.target === d.properties.name
                                                );
                                                return isConnected ? "#90CAF9" : "#e0e0e0";
                                            });

                                        // Hide tooltip
                                        tooltip.style("opacity", 0);
                                    });
                            }
                        }
                    });
                } else {
                    console.log("No connections to draw");
                    
                    // Draw a simple example connection to verify the map works
                    const usa = countries.find(c => c.properties.name.includes("United States"));
                    const china = countries.find(c => c.properties.name === "China");
                    
                    if (usa && china) {
                        const source = path.centroid(usa);
                        const target = path.centroid(china);
                        
                        g.append("path")
                            .attr("class", "connection")
                            .attr("d", `M${source[0]},${source[1]} Q${(source[0] + target[0])/2},${(source[1] + target[1])/2 - 100} ${target[0]},${target[1]}`)
                            .attr("stroke", "#1976D2")
                            .attr("stroke-width", 3)
                            .attr("fill", "none")
                            .attr("opacity", 0.7);
                            
                        console.log("Drew example connection to verify map works");
                    }
                }

                // Clean up tooltip on component unmount
                return () => {
                    d3.select(".map-tooltip").remove();
                };
            })
            .catch(error => {
                console.error("Error loading map data:", error);
            });
    }, [queryResponse, theme]);

    // Make sure the component re-renders when queryResponse changes
    useEffect(() => {
        console.log("QueryResponse changed, rendering map...");
        renderConnectionMap();
    }, [renderConnectionMap]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            console.log("Window resized, updating map...");
            renderConnectionMap();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [renderConnectionMap]);

    // Add CSS for hover effects
    const mapStyles = {
        country: {
            transition: 'fill 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
                fill: '#64B5F6'
            }
        },
        label: {
            pointerEvents: 'none',
            userSelect: 'none'
        }
    };

    return (
        <div ref={containerRef} style={{ 
            width: '100%', 
            height: '600px', 
            position: 'relative',
            backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #ccc'
        }}>
            <svg 
                ref={svgRef} 
                style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'block' // Ensure proper rendering
                }} 
            />
        </div>
    );
};

export default ConnectionMap;
