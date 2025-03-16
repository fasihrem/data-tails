import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SmallMultiples = ({ queryResponse }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!queryResponse) return;

        // Clear previous visualization
        d3.select(containerRef.current).selectAll("*").remove();

        // Process query response into word frequency data
        const processData = (response) => {
            try {
                // Skip JSON parsing - directly process the text response
                const categories = [];
                const sections = response.split(/\d+\.\s+\*\*[^*]+\*\*/g).filter(Boolean);
                const categoryPattern = /\d+\.\s+\*\*([^*]+)\*\*/g;
                let categoryMatch;
                let categoryIndex = 0;

                while ((categoryMatch = categoryPattern.exec(response)) !== null) {
                    const categoryName = categoryMatch[1];
                    const sectionContent = sections[categoryIndex] || '';
                    
                    // Process text content into word frequencies
                    const words = sectionContent
                        .toLowerCase()
                        .replace(/[^\w\s]/g, '')
                        .split(/\s+/)
                        .filter(word => word.length > 3) // Filter out short words
                        .reduce((acc, word) => {
                            acc[word] = (acc[word] || 0) + 1;
                            return acc;
                        }, {});

                    // Convert to array and sort by frequency
                    const items = Object.entries(words)
                        .map(([word, count]) => ({
                            subcategory: word,
                            value: count,
                            description: `Appears ${count} times in ${categoryName}`
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 8); // Take top 8 words

                    if (items.length > 0) {
                        categories.push({
                            name: categoryName.trim(),
                            items: items
                        });
                    }

                    categoryIndex++;
                }

                return { categories };
            } catch (error) {
                console.error("Error processing data:", error);
                return { categories: [] };
            }
        };

        const data = processData(queryResponse);
        
        if (!data.categories || data.categories.length === 0) {
            console.log("No valid data to visualize");
            return;
        }

        // Setup dimensions and scales
        const margin = { top: 40, right: 20, bottom: 60, left: 60 };
        const containerWidth = containerRef.current.clientWidth;
        const numColumns = Math.min(3, Math.ceil(Math.sqrt(data.categories.length)));
        const smallWidth = (containerWidth / numColumns) - margin.left - margin.right;
        const smallHeight = 200;

        // Create color scale
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Create SVG container
        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", (Math.ceil(data.categories.length / numColumns) * 
                          (smallHeight + margin.top + margin.bottom)))
            .attr("style", "background-color: white;");

        // Find global max value for consistent y-scale
        const maxValue = d3.max(data.categories, c => 
            d3.max(c.items, d => d.value)
        );

        // Create small multiples
        data.categories.forEach((category, i) => {
            const row = Math.floor(i / numColumns);
            const col = i % numColumns;
            
            const g = svg.append("g")
                .attr("transform", `translate(
                    ${col * (smallWidth + margin.left + margin.right) + margin.left},
                    ${row * (smallHeight + margin.top + margin.bottom) + margin.top}
                )`);

            // Create scales for this chart
            const xScale = d3.scaleBand()
                .domain(category.items.map(d => d.subcategory))
                .range([0, smallWidth])
                .padding(0.1);

            const yScale = d3.scaleLinear()
                .domain([0, maxValue * 1.1])
                .range([smallHeight, 0]);

            // Add bars
            g.selectAll("rect")
                .data(category.items)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d.subcategory))
                .attr("y", d => yScale(d.value))
                .attr("width", xScale.bandwidth())
                .attr("height", d => smallHeight - yScale(d.value))
                .attr("fill", colorScale(category.name))
                .attr("opacity", 0.8)
                .on("mouseover", function(event, d) {
                    // Highlight bar
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1);

                    // Show tooltip
                    tooltip
                        .style("opacity", 1)
                        .html(`
                            <div style="font-weight: bold;">${d.subcategory}</div>
                            <div>Frequency: ${d.value}</div>
                            <div>${d.description}</div>
                        `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.8);
                    
                    tooltip.style("opacity", 0);
                });

            // Add axes
            g.append("g")
                .attr("transform", `translate(0,${smallHeight})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .style("font-size", "10px");

            g.append("g")
                .call(d3.axisLeft(yScale)
                    .ticks(5)
                    .tickFormat(d3.format("d"))
                );

            // Add title
            g.append("text")
                .attr("x", smallWidth / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("font-size", "14px")
                .text(category.name);
        });

        // Add tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "small-multiples-tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "10px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("font-size", "12px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

        // Cleanup
        return () => {
            d3.select(".small-multiples-tooltip").remove();
        };
    }, [queryResponse]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: '100%', 
                minHeight: '400px',
                overflow: 'auto',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
        />
    );
};

export default SmallMultiples; 