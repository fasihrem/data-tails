import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PolarArea = ({ queryResponse }) => {
    const svgRef = useRef(null);

    const parseResponseToData = (response) => {
        try {
            if (!response) return [];
            const text = typeof response === "string" ? response : JSON.stringify(response);
            
            // Generic pattern to match any category with percentage
            const regex = /([A-Za-z][A-Za-z\s]+?)(?::|-)?\s*(?:around|about)?\s*(\d+)(?:-\d+)?%/gi;
            const matches = [...text.matchAll(regex)];
            
            return matches
                .map(match => ({
                    name: match[1].trim(),
                    value: parseInt(match[2])
                }))
                .filter(item => !isNaN(item.value) && item.name.length > 0);

        } catch (error) {
            console.error("Error parsing response:", error);
            return [];
        }
    };

    useEffect(() => {
        // Clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        const data = parseResponseToData(queryResponse);
        console.log("Parsed data:", data);

        if (data.length === 0) return;

        // Configuration
        const width = 600;
        const height = 600;
        const margin = 40;
        const radius = Math.min(width - 2 * margin, height - 2 * margin) / 2;

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        // Draw grid circles
        [20, 40, 60, 80].forEach(value => {
            svg.append("circle")
                .attr("r", (value / 100) * radius)
                .attr("fill", "none")
                .attr("stroke", "#e5e5e5")
                .attr("stroke-width", 1);

            svg.append("text")
                .attr("y", -(value / 100) * radius)
                .attr("dy", "-0.3em")
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .style("fill", "#666")
                .text(`${value}%`);
        });

        // Create pie layout
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const pieData = pie(data);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(d => (d.data.value / 100) * radius);

        // Dynamic color scale based on number of segments
        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.name))
            .range(["#6b8abc", "#e9a397", "#edbd8c", "#a8d1a3", "#c5afd4"]);

        // Create tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("padding", "8px 12px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("font-size", "14px")
            .style("font-weight", "500")
            .style("pointer-events", "none")
            .style("z-index", "1000");

        // Draw segments with hover effects
        svg.selectAll("path")
            .data(pieData)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => colorScale(d.data.name))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 0.8)
            .on("mouseover", function(event, d) {
                // Highlight segment
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 1);

                // Show tooltip
                tooltip
                    .style("visibility", "visible")
                    .html(`${d.data.name}: ${d.data.value}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                // Reset highlight
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.8);
                
                // Hide tooltip
                tooltip.style("visibility", "hidden");
            });

        // Cleanup function
        return () => {
            d3.select(svgRef.current).selectAll("*").remove();
            tooltip.remove();
        };

    }, [queryResponse]);

    return (
        <div style={{
            width: '600px',
            height: '600px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'white',
            borderRadius: '8px',
            position: 'relative'
        }}>
            <svg 
                ref={svgRef}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
};

export default PolarArea;
