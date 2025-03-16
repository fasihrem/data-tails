import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Delaunay } from 'd3-delaunay';

const VoronoiMap = ({ queryResponse }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!queryResponse) return;

        // Clear previous visualization
        d3.select(containerRef.current).selectAll("*").remove();

        // Setup dimensions
        const width = containerRef.current.clientWidth;
        const height = width;
        const margin = 40;
        const radius = Math.min(width, height) / 2 - margin;

        // Create SVG
        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        // Process data to include labels
        const processData = (response) => {
            try {
                if (!response || typeof response !== 'string') return [];

                const categories = [];
                const pattern = /\d+\.\s+\*\*([^*]+)\*\*:\s*([^.]+)/g;
                const matches = [...response.matchAll(pattern)];
                
                matches.forEach((match, index) => {
                    const [_, category, description] = match;
                    categories.push({
                        name: category.trim(),
                        value: 100 / Math.pow(1.2, index),
                        description: description.trim()
                    });
                });

                return categories;
            } catch (error) {
                console.error("Error processing data:", error);
                return [];
            }
        };

        const data = processData(queryResponse);
        
        // Generate points with associated data
        const points = data.map((d, i) => {
            const angle = (i / data.length) * 2 * Math.PI;
            const noise = Math.random() * 0.3 + 0.7; // Random between 0.7 and 1
            const r = radius * noise;
            return {
                x: r * Math.cos(angle),
                y: r * Math.sin(angle),
                ...d
            };
        });

        // Create Voronoi diagram
        const delaunay = Delaunay.from(points, d => d.x, d => d.y);
        const voronoi = delaunay.voronoi([-radius, -radius, radius, radius]);

        // Create clip path for circle
        svg.append("clipPath")
            .attr("id", "circle-clip")
            .append("circle")
            .attr("r", radius);

        // Color scale
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw Voronoi cells
        const cells = svg.append("g")
            .attr("clip-path", "url(#circle-clip)")
            .selectAll("path")
            .data(points)
            .enter()
            .append("path")
            .attr("d", (_, i) => voronoi.renderCell(i))
            .attr("fill", (_, i) => colorScale(i))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .style("opacity", 0.7)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke-width", 3);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("opacity", 0.7)
                    .style("stroke-width", 2);
            })
            .on("click", function(event, d) {
                console.log("Cell coordinates:", d);
            });

        // Add seed points
        svg.append("g")
            .selectAll("circle")
            .data(points)
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 3)
            .attr("fill", "black");

        // Add labels
        const labels = svg.append("g")
            .selectAll("text")
            .data(points)
            .enter()
            .append("g")
            .attr("transform", d => {
                const cell = voronoi.cellPolygon(points.indexOf(d));
                if (!cell) return "";
                const [cx, cy] = d3.polygonCentroid(cell);
                return `translate(${cx},${cy})`;
            });

        // Add name labels
        labels.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.5em")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("fill", "black")
            .text(d => d.name);

        // Add percentage labels
        labels.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("fill", "black")
            .text(d => `${Math.round(d.value)}%`);

        // Add circle border
        svg.append("circle")
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2);

        // Handle window resize
        const handleResize = () => {
            const newWidth = containerRef.current.clientWidth;
            svg.attr("width", newWidth)
               .attr("height", newWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, [queryResponse]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: '100%', 
                minHeight: '400px',
                overflow: 'hidden',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        />
    );
};

export default VoronoiMap; 