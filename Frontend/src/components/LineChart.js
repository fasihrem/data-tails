import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const parseResponseToData = (response) => {
    try {
        const data = [];
        const lines = response.split("\n").map(line => line.trim()).filter(line => line); // Clean & split response

        lines.forEach((line) => {
            const parts = line.split(/[:,-]/); // Split by common delimiters like ':', ',' or '-'
            if (parts.length < 2) return; // Skip if the format is unclear

            let label = parts[0].trim(); // First part is the label/category
            let valueMatch = parts[1].match(/([\d,.]+)\s*(%|percent|billion|million|\$|medals|units)?/i); // Extract numeric value and type

            if (valueMatch) {
                let value = parseFloat(valueMatch[1].replace(/,/g, ''));
                let type = "number"; // Default type

                if (valueMatch[2]) {
                    if (valueMatch[2].toLowerCase().includes("percent") || valueMatch[2] === "%") {
                        type = "percentage";
                    } else if (valueMatch[2].toLowerCase().includes("billion")) {
                        type = "currency";
                        value *= 1000; // Convert billion to million
                    } else if (valueMatch[2].toLowerCase().includes("million")) {
                        type = "currency";
                    } else if (valueMatch[2].toLowerCase().includes("medals") || valueMatch[2].toLowerCase().includes("units")) {
                        type = "count";
                    }
                }

                data.push({
                    label,
                    value,
                    type,
                });
            }
        });

        if (data.length === 0) {
            throw new Error("No valid data points found");
        }

        return { data, type: data[0].type || "number" };
    } catch (error) {
        console.error("Data parsing error:", error);
        throw new Error("Failed to parse data from response");
    }
};

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
            const { data, contexts, type } = parseResponseToData(queryResponse);

            if (data.length === 0) {
                throw new Error("No valid data points found in the response");
            }

            // Adjust dimensions for better visibility
            const margin = { 
                top: 50,
                right: 80,     // More space for y-axis labels
                bottom: 80,    // Space for x-axis labels
                left: 120      // More space for y-axis labels with billions
            };

            // Optimize dimensions
            const width = 850;   // Slightly smaller width
            const height = 600;  // Slightly smaller height

            // Clear previous chart
            container.selectAll("*").remove();

            const svg = container.append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet");

            // Update scales with more padding and better ranges
            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([margin.left, width - margin.right])
                .nice();

            // Adjust y-axis scale to focus on the data range
            const yMin = d3.min(data, d => d.value) * 0.9; // 10% padding below
            const yMax = d3.max(data, d => d.value) * 1.1; // 10% padding above

            const y = d3.scaleLinear()
                .domain([yMin, yMax])
                .range([height - margin.bottom, margin.top])
                .nice();

            // Dynamic y-axis formatting based on data type
            const yAxisFormat = (d) => {
                switch (type) {
                    case 'currency':
                        return d >= 1000 ? `$${d/1000}B` : `$${d}M`;
                    case 'percentage':
                        return `${d}%`;
                    case 'count':
                        return d.toLocaleString();
                    default:
                        return d.toLocaleString();
                }
            };

            // Update y-axis
            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", `translate(${margin.left},0)`)
                .style("font-weight", "bold")
                .call(d3.axisLeft(y).tickFormat(yAxisFormat));

            // Update x-axis with consistent styling and single set of labels
            const xAxis = svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x)
                    .ticks(8)  // Adjust number of ticks as needed
                    .tickFormat(d3.timeFormat("%Y")))
                .call(g => {
                    g.selectAll(".tick text")
                        .style("fill", "#000")  // Consistent black color
                        .style("font-size", "12px")
                        .style("font-weight", "normal");
                    
                    g.selectAll(".tick line")
                        .style("stroke", "#999")
                        .style("stroke-width", "1px");
                    
                    g.select(".domain")
                        .style("stroke", "#999")
                        .style("stroke-width", "1px");
                });

            // Remove any duplicate or background grid lines for x-axis
            svg.selectAll(".x-grid")
                .remove();

            // Add clean grid lines if needed
            svg.append("g")
                .attr("class", "grid x-grid")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .style("stroke-dasharray", "3,3")
                .style("opacity", 0.1)
                .call(d3.axisBottom(x)
                    .ticks(8)
                    .tickSize(-(height - margin.top - margin.bottom))
                    .tickFormat("")
                )
                .call(g => g.select(".domain").remove());

            // Add X-axis label
            svg.append("text")
                .attr("class", "x-label")
                .attr("text-anchor", "middle")
                .attr("x", width/2)
                .attr("y", height - margin.bottom/3)
                .style("font-size", "14px")
                .style("fill", "#666")
                .text("Year");

            // Add Y axis label
            svg.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("y", margin.left/3)
                .attr("x", -height/2)
                .style("font-size", "14px")
                .style("fill", "#666")
                .text("");

            // Update line generator
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.value))
                .curve(d3.curveMonotoneX);

            // Add the line with animation
            const path = svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#2196F3")
                .attr("stroke-width", 2)
                .attr("d", line);

            // Animate the line
            const pathLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", pathLength + " " + pathLength)
                .attr("stroke-dashoffset", pathLength)
                .transition()
                .duration(1000)
                .attr("stroke-dashoffset", 0);

            // Add data points with dynamic labels
            const dots = svg.selectAll(".data-point")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "data-point");

            // Define color scale for multiple series/contexts
            const colorScale = d3.scaleOrdinal()
                .domain(contexts)
                .range(d3.schemeCategory10); // Built-in D3 color scheme

            // Add dots
            dots.append("circle")
                .attr("r", 4)
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.value))
                .style("fill", d => contexts.length > 1 ? colorScale(d.context) : "#2196F3")
                .style("stroke", "white")
                .style("stroke-width", 2);

            // Add value labels
            dots.append("text")
                .attr("x", d => x(d.date))
                .attr("y", d => y(d.value) - 15)
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .style("fill", "#666")
                .text(d => yAxisFormat(d.value));

            // Add context labels if available
            if (contexts.length > 0) {
                dots.append("text")
                    .attr("x", d => x(d.date))
                    .attr("y", d => y(d.value) - 30)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px")
                    .style("fill", "#666")
                    .text(d => d.context || '');
            }

            // Add hover interaction with more details
            dots.on("mouseover", function(event, d) {
                d3.select(this)
                    .select("circle")
                    .transition()
                    .duration(200)
                    .attr("r", 6)
                    .style("fill", d => d3.color(d.context).brighter(0.5));

                d3.select(this)
                    .select("text")
                    .transition()
                    .duration(200)
                    .attr("font-size", "12px")
                    .style("fill", "#000");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .select("circle")
                    .transition()
                    .duration(200)
                    .attr("r", 4)
                    .style("fill", d => d3.color(d.context));

                d3.select(this)
                    .select("text")
                    .transition()
                    .duration(200)
                    .attr("font-size", "11px")
                    .style("fill", "#666");
            });

            // Add legend if multiple contexts
            if (contexts.length > 1) {
                const legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${width - margin.right - 100}, ${margin.top})`);

                contexts.forEach((context, i) => {
                    legend.append("rect")
                        .attr("x", 0)
                        .attr("y", i * 20)
                        .attr("width", 15)
                        .attr("height", 15)
                        .style("fill", colorScale(context));

                    legend.append("text")
                        .attr("x", 20)
                        .attr("y", i * 20 + 12)
                        .text(context)
                        .style("font-size", "12px");
                });
            }

            // Update container styles to fill right side
            containerRef.current.style.width = "100%";
            containerRef.current.style.height = "100vh";
            containerRef.current.style.minHeight = "380px";
            containerRef.current.style.maxHeight = "650px";
            containerRef.current.style.position = "relative";

            // Update chart title position and style
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", width < 600 ? "14px" : "16px")
                .style("font-weight", "bold")
                .text("");

            // Update font sizes for better visibility
            svg.selectAll("text")
                .style("font-size", "14px");

            svg.selectAll(".axis-label")
                .style("font-size", "16px");

            svg.select(".chart-title")
                .style("font-size", "20px");

            // Update font sizes to match BarChart
            svg.selectAll(".axis text")
                .style("font-size", "12px");

            svg.selectAll(".title")
                .style("font-size", "16px");

            // Update tooltips to show appreciation
            dots.append("title")
                .text(d => {
                    let tooltip = `${d.context ? d.context + ': ' : ''}$${d.value.toLocaleString()}`;
                    if (d.type === 'percentage') {
                        tooltip += `\n${d.value}%`;
                    } else if (d.type === 'currency') {
                        tooltip += `\n(${d.type.toUpperCase()})`;
                    }
                    return tooltip;
                });

        } catch (error) {
            console.error("Error creating LineChart:", error);
            setError(error.message);
        }
    }, [queryResponse]);

    return (
        <div ref={containerRef} 
            style={{ 
                width: "100%",          // Take full width
                height: "100vh",        // Take full viewport height
                backgroundColor: "white",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",    // For proper positioning
                margin: 0,              // Remove margin
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
        >
            <div style={{
                width: "100%",
                maxWidth: "800px",      // Increased max width
                height: "500px",        // Increased height
                position: "relative"    // For chart positioning
            }}>
                {!queryResponse && <div style={{ padding: "20px", textAlign: "center" }}>No data provided for Line Chart</div>}
            </div>
            {error && (
                <div style={{ 
                    color: "red", 
                    padding: "20px",
                    textAlign: "center",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default LineChart;
