import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DonutChart = ({ queryResponse }) => {
    const svgRef = useRef(null);

    const parseResponseToData = (response) => {
        try {
            if (!response) return [];

            const text = typeof response === 'string' ? response : JSON.stringify(response);
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.toLowerCase().includes('here are'));

            const data = [];
            let currentValue = 100; // Start with 100 to distribute proportionally

            lines.forEach(line => {
                // Skip introductory lines
                if (line.toLowerCase().includes('great') || 
                    line.toLowerCase().includes('here') ||
                    line.toLowerCase().includes('let me')) {
                    return;
                }

                // Extract category and value if they exist
                const match = line.match(/([^:]+):\s*(\d+%?)?/);
                if (match) {
                    const name = match[1].replace(/^[0-9.]+\s*/, '').replace(/\*\*/g, '').trim();
                    let value = match[2] ? parseInt(match[2]) : currentValue;
                    currentValue = Math.max(currentValue - 20, 10); // Decrease for next item
                    
                    if (name) {
                        data.push({ name, value });
                    }
                }
            });

            return data;
        } catch (error) {
            console.error("Error parsing response for donut chart:", error);
            return [];
        }
    };

    useEffect(() => {
        if (!queryResponse) return;

        const data = parseResponseToData(queryResponse);
        if (data.length === 0) return;

        // Clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        // Set dimensions
        const width = 500;
        const height = 500;
        const margin = 40;
        const radius = Math.min(width, height) / 2 - margin;

        // Create color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.name))
            .range(d3.schemeCategory10);

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Create pie generator
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.6)
            .outerRadius(radius);

        // Create the donut segments without labels
        const segments = svg.selectAll("path")
            .data(pie(data))
            .join("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.name))
            .attr("stroke", "white")
            .style("stroke-width", "2px");

        // Create tooltip
        const tooltip = d3.select(svgRef.current.parentNode)
            .append("div")
            .attr("class", "donut-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(255, 255, 255, 0.95)")
            .style("padding", "6px 12px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .style("line-height", "1.4")
            .style("pointer-events", "none")
            .style("color", "#333");

        // Enhanced hover effects with name and percentage
        segments
            .on("mouseover", function(event, d) {
                // Segment pop-out effect
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("transform", function(d) {
                        const centroid = arc.centroid(d);
                        const x = centroid[0] * 0.1;
                        const y = centroid[1] * 0.1;
                        return `translate(${x},${y})`;
                    });

                // Show name and percentage on hover
                const percentage = (d.data.value * 100 / d3.sum(data, d => d.value)).toFixed(1);
                tooltip
                    .style("visibility", "visible")
                    .html(`${d.data.name}<br/>${percentage}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                // Reset segment position
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("transform", "translate(0,0)");

                // Hide tooltip
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
            height: '500px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative'  // Added for tooltip positioning
        }}>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default DonutChart;