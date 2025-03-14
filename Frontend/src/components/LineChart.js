import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const LineChart = ({ queryResponse }) => {
    const svgRef = useRef();
    const [tableData, setTableData] = useState([]);

    // Convert text to tabular data
    const convertToTable = (text) => {
        if (!text) return [];
        
        console.log("Raw text to convert:", text);
        
        try {
            const data = [];
            
            // Try to extract year-value pairs using different patterns
            const lines = text.split('\n');
            console.log("Split into lines:", lines.length, "lines");
            
            lines.forEach((line, index) => {
                console.log(`Line ${index}: "${line}"`);
                
                // Pattern 1: **YYYY:** NNN gold medals
                let match = line.match(/\*\*(\d{4})\*\*:\s*(\d+)\s*gold medals/);
                if (match) {
                    console.log(`Pattern 1 match on line ${index}:`, match);
                    const year = parseInt(match[1]);
                    const value = parseInt(match[2]);
                    if (!isNaN(year) && !isNaN(value)) {
                        data.push({ year, value });
                        console.log(`Added data point: ${year} = ${value}`);
                    }
                    return;
                }
                
                // Pattern 2: Year: YYYY, Value: NNN
                match = line.match(/Year:\s*(\d{4}).*Value:\s*(\d+)/i);
                if (match) {
                    console.log(`Pattern 2 match on line ${index}:`, match);
                    const year = parseInt(match[1]);
                    const value = parseInt(match[2]);
                    if (!isNaN(year) && !isNaN(value)) {
                        data.push({ year, value });
                        console.log(`Added data point: ${year} = ${value}`);
                    }
                    return;
                }
                
                // Pattern 3: YYYY: NNN
                match = line.match(/(\d{4}):\s*(\d+)/);
                if (match) {
                    console.log(`Pattern 3 match on line ${index}:`, match);
                    const year = parseInt(match[1]);
                    const value = parseInt(match[2]);
                    if (!isNaN(year) && !isNaN(value)) {
                        data.push({ year, value });
                        console.log(`Added data point: ${year} = ${value}`);
                    }
                    return;
                }
                
                // Pattern 4: Just try to find a year and a number in the same line
                const yearMatch = line.match(/\b(\d{4})\b/);
                const valueMatch = line.match(/\b(\d+)\b/g);
                if (yearMatch && valueMatch && valueMatch.length > 1) {
                    console.log(`Pattern 4 match on line ${index}:`, yearMatch, valueMatch);
                    const year = parseInt(yearMatch[1]);
                    const value = parseInt(valueMatch[1]); // Take the second number as value
                    if (!isNaN(year) && !isNaN(value)) {
                        data.push({ year, value });
                        console.log(`Added data point: ${year} = ${value}`);
                    }
                }
            });
            
            // Sort by year
            data.sort((a, b) => a.year - b.year);
            console.log("Final data array:", data);
            
            // Create a console table for better visualization
            console.table(data);
            
            return data;
        } catch (error) {
            console.error("Error converting to table:", error);
            return [];
        }
    };

    useEffect(() => {
        // Convert to tabular data
        const data = convertToTable(queryResponse);
        setTableData(data);
        
        if (data.length === 0) {
            console.log("No data to visualize");
            return;
        }

        // Create visualization
        const width = 800;
        const height = 400;
        const margin = { top: 40, right: 40, bottom: 60, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Clear previous content
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Set up SVG
        svg
            .attr("width", width)
            .attr("height", height);

        // Create chart area
        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) * 1.1])
            .range([innerHeight, 0]);

        // Create line
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        // Add line path
        chart.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#2196F3")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add points
        chart.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.value))
            .attr("r", 4)
            .attr("fill", "#2196F3")
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        // Add value labels
        chart.selectAll("text.value")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "value")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.value) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(d => d.value);

        // Add axes
        chart.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))
                .ticks(10));

        chart.append("g")
            .call(d3.axisLeft(yScale));

        // Add labels
        chart.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 40)
            .attr("text-anchor", "middle")
            .attr("fill", "#666")
            .text("Year");

        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .attr("fill", "#666")
            .text("Value");

        // Add title
        chart.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text("Data Visualization");

    }, [queryResponse]);

    return (
        <div style={{ 
            padding: '20px',
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <svg 
                ref={svgRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '400px'
                }}
            />
            
            {/* Display table for debugging */}
            {tableData.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Data Table</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Year</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.year}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LineChart;