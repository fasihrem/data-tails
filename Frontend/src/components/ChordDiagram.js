import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChordDiagram = ({ queryResponse }) => {
    const svgRef = useRef();

    const parseResponseToMatrix = (text) => {
        if (!text) return { matrix: [], names: [] };

        try {
            // Extract topics using regex patterns
            const topicPatterns = [
                /\*\*([^*]+)\*\*/g,  // Matches text between **
                /r\/([a-zA-Z0-9_]+)/g,  // Matches subreddit names
                /\b([A-Z][a-zA-Z]+)\b/g,  // Matches capitalized words
                /["']([^"']+)["']/g  // Matches quoted text
            ];

            let topics = new Set();
            topicPatterns.forEach(pattern => {
                const matches = [...text.matchAll(pattern)];
                matches.forEach(match => {
                    // Clean up the matched text and add to topics
                    const topic = match[1].trim()
                        .replace(/^r\//, '')  // Remove r/ prefix
                        .replace(/\s+/g, ' '); // Normalize spaces
                    if (topic.length > 2) {  // Only add meaningful topics
                        topics.add(topic);
                    }
                });
            });

            // Convert to array and limit to most relevant topics (max 12)
            const topicsArray = Array.from(topics).slice(0, 12);

            // Create matrix with meaningful relationships
            const matrix = Array(topicsArray.length).fill()
                .map(() => Array(topicsArray.length).fill(0));

            // Calculate strength between topics
            const calculateStrength = (topic1, topic2, text) => {
                // Base strength
                let strength = 1;
                
                // Check direct mentions together
                if (text.toLowerCase().includes(topic1.toLowerCase() + ' ' + topic2.toLowerCase()) ||
                    text.toLowerCase().includes(topic2.toLowerCase() + ' ' + topic1.toLowerCase())) {
                    strength += 3;
                }
                
                // Check proximity (within 50 characters)
                const index1 = text.toLowerCase().indexOf(topic1.toLowerCase());
                const index2 = text.toLowerCase().indexOf(topic2.toLowerCase());
                if (Math.abs(index1 - index2) < 50) {
                    strength += 2;
                }
                
                // Check frequency of co-occurrence
                const segments = text.toLowerCase().split('.');
                const coOccurrences = segments.filter(segment => 
                    segment.includes(topic1.toLowerCase()) && 
                    segment.includes(topic2.toLowerCase())
                ).length;
                
                strength += Math.min(coOccurrences, 3); // Cap at 3 additional points
                
                return strength;
            };

            // Use in relationship creation
            topicsArray.forEach((topic, i) => {
                topicsArray.forEach((otherTopic, j) => {
                    if (i !== j) {
                        matrix[i][j] = calculateStrength(topic, otherTopic, text);
                        matrix[j][i] = matrix[i][j]; // Make it bidirectional
                    }
                });
            });

            console.log('Extracted Topics:', topicsArray);
            console.log('Relationship Matrix:', matrix);

            return { matrix, names: topicsArray };
        } catch (error) {
            console.error('Error parsing data:', error);
            return { matrix: [], names: [] };
        }
    };

    useEffect(() => {
        if (!queryResponse) return;

        // Clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        // Set up dimensions
        const width = 800;
        const height = 800;
        const outerRadius = Math.min(width, height) * 0.35;
        const innerRadius = outerRadius - 40;

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("width", "100%")
            .attr("height", "100%");

        // Parse data
        const { matrix, names } = parseResponseToMatrix(queryResponse);

        if (matrix.length === 0) return;

        // Create chord layout
        const chord = d3.chord()
            .padAngle(0.1)
            .sortSubgroups(d3.descending)(matrix);

        // Enhanced color scale
        const color = d3.scaleOrdinal()
            .domain(names)
            .range([
                '#FF6B6B', // Coral Red
                '#4ECDC4', // Teal
                '#45B7D1', // Light Blue
                '#96CEB4', // Mint
                '#9B59B6', // Purple
                '#3498DB', // Blue
                '#E74C3C', // Dark Red
                '#2ECC71', // Green
                '#F1C40F', // Yellow
                '#E67E22', // Orange
                '#1ABC9C', // Turquoise
                '#8E44AD'  // Dark Purple
            ]);

        // Add groups with thicker arcs
        const group = svg.append("g")
            .selectAll("g")
            .data(chord.groups)
            .join("g");

        // Add arcs with gradients
        const arcGenerator = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .cornerRadius(5);

        // Create gradients
        const gradients = svg.append("defs")
            .selectAll("linearGradient")
            .data(chord.groups)
            .join("linearGradient")
            .attr("id", (d, i) => `gradient-${i}`)
            .attr("gradientUnits", "userSpaceOnUse");

        gradients.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d => d3.rgb(color(names[d.index])).brighter(0.5));

        gradients.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d => d3.rgb(color(names[d.index])).darker(0.2));

        // Add arcs with enhanced styling
        group.append("path")
            .attr("fill", (d, i) => `url(#gradient-${i})`)
            .attr("d", arcGenerator)
            .style("stroke", "#fff")
            .style("stroke-width", 2);

        // Add labels with better positioning
        group.append("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${outerRadius + 15})
                ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => names[d.index])
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#333");

        // Add ribbons with enhanced styling
        const ribbons = svg.append("g")
            .selectAll("path")
            .data(chord)
            .join("path")
            .attr("d", d3.ribbon().radius(innerRadius))
            .attr("fill", d => color(names[d.source.index]))
            .attr("stroke", "#fff")
            .style("stroke-width", 1)
            .style("opacity", 0.7);

        // Add tooltip div
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "chord-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(255, 255, 255, 0.95)")
            .style("padding", "10px")
            .style("border-radius", "6px")
            .style("box-shadow", "0 0 10px rgba(0,0,0,0.2)")
            .style("font-size", "14px")
            .style("max-width", "300px")
            .style("pointer-events", "none")
            .style("z-index", "1000");

        // Enhanced group hover interaction
        group.on("mouseover", function(event, d) {
            // Highlight connected ribbons
            ribbons.style("opacity", 0.1);
            const connectedRibbons = ribbons.filter(p => 
                p.source.index === d.index || 
                p.target.index === d.index
            );
            connectedRibbons.style("opacity", 0.7);

            // Get all connections for this segment
            const connections = chord
                .filter(c => c.source.index === d.index || c.target.index === d.index)
                .map(c => {
                    const otherIndex = c.source.index === d.index ? c.target.index : c.source.index;
                    const value = matrix[d.index][otherIndex];
                    return {
                        name: names[otherIndex],
                        value: value
                    };
                });

            // Create tooltip content
            const tooltipContent = `
                <div style="color: ${color(names[d.index])}; font-weight: bold; font-size: 16px; margin-bottom: 8px;">
                    ${names[d.index]}
                </div>
                <div style="margin-bottom: 8px;">Connected to:</div>
                ${connections.map(conn => `
                    <div style="margin-left: 10px; margin-bottom: 4px;">
                        • ${conn.name} 
                        <span style="color: #666; font-size: 12px;">
                            (Strength: ${conn.value.toFixed(1)})
                        </span>
                    </div>
                `).join('')}
            `;

            tooltip
                .style("visibility", "visible")
                .html(tooltipContent);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            ribbons.style("opacity", 0.7);
            tooltip.style("visibility", "hidden");
        });

        // Enhanced ribbon hover interaction
        ribbons
            .on("mouseover", function(event, d) {
                // Highlight this ribbon
                ribbons.style("opacity", 0.1);
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke-width", 2);

                // Show connection details
                const tooltipContent = `
                    <div style="margin-bottom: 8px; font-weight: bold;">
                        <span style="color: ${color(names[d.source.index])}">
                            ${names[d.source.index]}
                        </span>
                        ↔
                        <span style="color: ${color(names[d.target.index])}">
                            ${names[d.target.index]}
                        </span>
                    </div>
                    <div>
                        Connection strength: ${matrix[d.source.index][d.target.index].toFixed(1)}
                    </div>
                `;

                tooltip
                    .style("visibility", "visible")
                    .html(tooltipContent);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                ribbons.style("opacity", 0.7);
                d3.select(this)
                    .style("stroke-width", 1);
                tooltip.style("visibility", "hidden");
            });

        // Cleanup function
        return () => {
            tooltip.remove();
        };

    }, [queryResponse]);

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: 'white'
        }}>
            <svg 
                ref={svgRef}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    backgroundColor: 'white'
                }}
            />
        </div>
    );
};

export default ChordDiagram;
