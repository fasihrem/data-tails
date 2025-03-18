import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const LineChart = ({ queryResponse }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!queryResponse || !containerRef.current) {
            setError("Missing data or container reference");
            return;
        }

        const container = d3.select(containerRef.current);
        container.selectAll("svg").remove();
        container.selectAll(".tooltip").remove();
        setError(null);

        try {
            console.log("Raw queryResponse:", queryResponse);

            // Parse the data
            const data = [];
            const lines = queryResponse.split('\n');
            
            // Multiple patterns to try
            const patterns = [
                // Pattern 1: Year with number (with optional $ and billion/million)
                /(\d{4}).*?[^\d](\d+\.?\d*)\s*(billion|million)?/i,
                // Pattern 2: Year with events/count
                /(\d{4}).*?(\d+)\s*events?/i,
                // Pattern 3: Year with any number after colon
                /(\d{4}):\s*.*?(\d+\.?\d*)/,
                // Pattern 4: Year with any number in the line
                /(\d{4}).*?[^\d](\d+\.?\d*)/
            ];
            
            lines.forEach((line, index) => {
                console.log(`Processing line ${index}:`, line);
                
                for (const pattern of patterns) {
                    const match = line.trim().match(pattern);
                    if (match) {
                        const year = parseInt(match[1]);
                        let value = parseFloat(match[2]);
                        
                        // Adjust value if billion/million is specified
                        if (match[3]) {
                            if (match[3].toLowerCase() === 'billion') {
                                value *= 1000;
                            }
                            if (match[3].toLowerCase() === 'million') {
                                value *= 1;
                            }
                        }
                        
                        if (!isNaN(year) && !isNaN(value)) {
                            const existingPoint = data.find(d => d.date.getFullYear() === year);
                            if (!existingPoint) {
                                data.push({
                                    date: new Date(year, 0),
                                    value: value
                                });
                                console.log("Added data point:", { year, value });
                                break; // Stop trying other patterns
                            }
                        }
                    }
                }
            });

            if (data.length === 0) {
                throw new Error("No valid data points found in the response");
            }

            // Sort data chronologically
            data.sort((a, b) => a.date - b.date);
            console.log("Final parsed data:", data);

            const width = containerRef.current.clientWidth;
            const height = 400;
            const margin = { top: 20, right: 30, bottom: 30, left: 60 };

            // Create SVG
            const svg = container.append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height]);

            // Create scales
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([margin.left, width - margin.right]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value) * 1.1])
                .nice()
                .range([height - margin.bottom, margin.top]);

            // Add X axis
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x)
                    .tickFormat(d3.timeFormat("%Y")))
                .call(g => g.select(".domain").attr("stroke", "#999"))
                .call(g => g.selectAll(".tick line").attr("stroke", "#999"))
                .call(g => g.selectAll(".tick text")
                    .attr("fill", "#666")
                    .style("font-size", "12px"));

            // Add Y axis with flexible formatting
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y)
                    .tickFormat(d => {
                        if (d >= 1000) return `${d/1000}K`;
                        return d.toString();
                    }))
                .call(g => g.select(".domain").attr("stroke", "#999"))
                .call(g => g.selectAll(".tick line").attr("stroke", "#999"))
                .call(g => g.selectAll(".tick text")
                    .attr("fill", "#666")
                    .style("font-size", "12px"));

            // Add the line
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value))
                .curve(d3.curveMonotoneX);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#4CAF50")
                .attr("stroke-width", 2)
                .attr("d", line);

            // Add dots
            svg.selectAll("circle")
                .data(data)
                .join("circle")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.value))
                .attr("r", 4)
                .attr("fill", "#4CAF50")
                .attr("stroke", "white")
                .attr("stroke-width", 2);

            // Add tooltip with flexible formatting
            const tooltip = container.append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "1px solid #999")
                .style("border-radius", "4px")
                .style("padding", "8px")
                .style("font-size", "12px")
                .style("pointer-events", "none")
                .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

            // Add hover effects
            svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mousemove", function(event) {
                    const [xPos] = d3.pointer(event, this);
                    const bisect = d3.bisector(d => d.date).left;
                    const x0 = x.invert(xPos);
                    const i = bisect(data, x0, 1);
                    if (i >= data.length) return;
                    
                    const d0 = data[i - 1];
                    const d1 = data[i];
                    if (!d0 || !d1) return;
                    
                    const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                    tooltip.style("opacity", 1)
                        .html(`Year: ${d.date.getFullYear()}<br/>Value: ${d.value >= 1000 ? (d.value/1000).toFixed(1) + 'K' : d.value}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");

                    svg.selectAll("circle")
                        .attr("r", 4)
                        .filter(dd => dd === d)
                        .attr("r", 6);
                })
                .on("mouseleave", function() {
                    tooltip.style("opacity", 0);
                    svg.selectAll("circle").attr("r", 4);
                });

        } catch (error) {
            console.error("Error creating LineChart:", error);
            setError(error.message);
        }
    }, [queryResponse]);

    return (
        <div ref={containerRef} 
            style={{ 
                width: "100%",
                height: "400px",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
        >
            {!queryResponse && <div style={{ padding: "20px", textAlign: "center" }}>No data provided for Line Chart</div>}
            {error && <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>}
        </div>
    );
};

export default LineChart;
