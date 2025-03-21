import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const StackedAreaChart = ({ queryResponse }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!queryResponse || !containerRef.current) return;

        // Clear previous chart and errors
        d3.select(containerRef.current).selectAll("*").remove();
        setError(null);

        try {
            console.log("Raw query response:", queryResponse);
            
            // Step 1: Extract categories and data from the query response
            const extractData = () => {
                // Find all bold sections that have numeric data
                const boldSectionPattern = /\*\*([^*:]+)(?::|)\*\*([\s\S]*?)(?=\*\*|$)/g;
                const boldMatches = [...queryResponse.matchAll(boldSectionPattern)];
                
                const categories = [];
                const yearData = {};
                
                // Process each bold section
                boldMatches.forEach(match => {
                    const category = match[1].trim();
                    const content = match[2];
                    
                    // Check if this section contains numeric data (years and values)
                    const yearValuePattern = /(\d{4})(?:\s*\(.*?\))?:\s*(\d+)/g;
                    const yearValueMatches = [...content.matchAll(yearValuePattern)];
                    
                    if (yearValueMatches.length > 0) {
                        categories.push(category);
                        console.log("Found category with numeric data:", category);
                        
                        // Extract year-value pairs
                        yearValueMatches.forEach(yearMatch => {
                            const year = parseInt(yearMatch[1]);
                            const value = parseInt(yearMatch[2]);
                            
                            if (!yearData[year]) {
                                yearData[year] = {};
                            }
                            
                            yearData[year][category] = value;
                        });
                    }
                });
                
                // Convert yearData to array format
                const data = Object.keys(yearData)
                    .sort()
                    .map(year => {
                        const entry = { year: parseInt(year) };
                        categories.forEach(category => {
                            entry[category] = yearData[year][category] || 0;
                        });
                        return entry;
                    });
                
                console.log("Extracted categories:", categories);
                console.log("Structured data:", data);
                
                return { categories, data };
            };
            
            // Extract data
            const { categories, data } = extractData();
            
            // If no categories found or no data, show error
            if (categories.length === 0 || data.length === 0) {
                throw new Error("Could not extract categories or data from the query response");
            }
            
            // Step 2: Create the visualization
            const margin = { top: 20, right: 150, bottom: 40, left: 60 }; // Increased right margin for legend
            const width = containerRef.current.clientWidth - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;
            
            // Create SVG
            const svg = d3.select(containerRef.current)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            
            // Create scales
            const x = d3.scaleLinear()
                .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
                .range([0, width]);
            
            // Stack the data
            const stack = d3.stack()
                .keys(categories)
                .order(d3.stackOrderNone)
                .offset(d3.stackOffsetNone);
            
            const stackedData = stack(data);
            
            // Calculate the maximum y value
            const yMax = d3.max(stackedData, d => d3.max(d, d => d[1]));
            
            const y = d3.scaleLinear()
                .domain([0, yMax * 1.05])
                .range([height, 0])
                .nice();
            
            // Generate colors
            const color = d3.scaleOrdinal()
                .domain(categories)
                .range(d3.schemeCategory10);
            
            // Add areas with transition
            const area = d3.area()
                .x(d => x(d.data.year))
                .y0(d => y(d[0]))
                .y1(d => y(d[1]))
                .curve(d3.curveMonotoneX);
            
            // Add tooltip
            const tooltip = d3.select(containerRef.current)
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("padding", "10px")
                .style("border", "1px solid #ddd")
                .style("border-radius", "4px")
                .style("pointer-events", "none")
                .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
            
            // Add stacked areas with transition
            svg.selectAll(".area")
                .data(stackedData)
                .join("path")
                .attr("class", "area")
                .attr("fill", d => color(d.key))
                .attr("d", area)
                .attr("opacity", 0.8)
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .attr("opacity", 1)
                        .style("stroke", "#000")
                        .style("stroke-width", 1);
                    tooltip.style("opacity", 1);
                })
                .on("mousemove", function(event, d) {
                    const [xPos] = d3.pointer(event);
                    const year = Math.round(x.invert(xPos));
                    const yearData = d.find(p => p.data.year === year);
                    
                    if (yearData) {
                        const value = (yearData[1] - yearData[0]).toFixed(0);
                        
                        tooltip.html(`
                            <strong>${d.key}</strong><br>
                            Year: ${year}<br>
                            Value: ${value}
                        `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                    }
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr("opacity", 0.8)
                        .style("stroke", "none");
                    tooltip.style("opacity", 0);
                });
            
            // Add axes
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x)
                    .ticks(width > 600 ? 10 : 5)
                    .tickFormat(d3.format("d")));
            
            svg.append("g")
                .call(d3.axisLeft(y)
                    .ticks(5));
            
            // Create a separate HTML legend outside the SVG for better visibility
            const legendContainer = d3.select(containerRef.current)
                .append("div")
                .style("position", "absolute")
                .style("top", "20px")
                .style("right", "20px")
                .style("background-color", "rgba(255, 255, 255, 0.9)")
                .style("padding", "10px")
                .style("border-radius", "5px")
                .style("border", "1px solid #ddd")
                .style("max-width", "200px");
            
            categories.forEach((category, i) => {
                const legendItem = legendContainer.append("div")
                    .style("display", "flex")
                    .style("align-items", "center")
                    .style("margin-bottom", "8px");
                
                legendItem.append("div")
                    .style("width", "15px")
                    .style("height", "15px")
                    .style("background-color", color(category))
                    .style("margin-right", "8px")
                    .style("flex-shrink", "0");
                
                legendItem.append("div")
                    .text(category)
                    .style("white-space", "nowrap")
                    .style("overflow", "hidden")
                    .style("text-overflow", "ellipsis");
            });
            
        } catch (error) {
            console.error("Error creating chart:", error);
            setError(error.message);
            
            // Display error message in the container
            d3.select(containerRef.current)
                .append("div")
                .style("color", "red")
                .style("padding", "20px")
                .text(`Error creating chart: ${error.message}`);
        }
    }, [queryResponse]);

    return (
        <div ref={containerRef} 
            style={{ 
                width: '100%',
                height: '400px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative'
            }}
        />
    );
};

export default StackedAreaChart;