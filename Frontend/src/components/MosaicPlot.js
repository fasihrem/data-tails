import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MosaicPlot = ({ queryResponse }) => {
    const svgRef = useRef(null);

    const parseResponseToData = (response) => {
        try {
            if (!response) return [];

            const text = typeof response === 'string' ? response : JSON.stringify(response);
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.toLowerCase().includes('here are'));

            // Group data into categories and subcategories
            const categories = {};
            let currentCategory = null;

            lines.forEach(line => {
                if (line.includes('**')) {
                    // Main category
                    currentCategory = line.replace(/\*\*/g, '').split(':')[0].trim();
                    categories[currentCategory] = [];
                } else if (currentCategory && line.includes(':')) {
                    // Subcategory
                    const name = line.split(':')[0].trim();
                    const value = Math.random() * 30 + 10; // Random value between 10-40 for demonstration
                    categories[currentCategory].push({ name, value });
                }
            });

            return Object.entries(categories).map(([category, subcategories]) => ({
                category,
                subcategories,
                total: d3.sum(subcategories, d => d.value)
            }));
        } catch (error) {
            console.error("Error parsing response for mosaic plot:", error);
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
        const width = 1000;
        const height = 600;
        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Calculate totals
        const totalSum = d3.sum(data, d => d.total);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([innerHeight, 0]);

        // Create color scales
        const categoryColor = d3.scaleOrdinal(d3.schemeAccent);

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create axes
        const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d => d + "%");
        const yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(d => d + "%");

        svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        // Create tooltip
        const tooltip = d3.select(svgRef.current.parentNode)
            .append("div")
            .attr("class", "mosaic-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("font-size", "12px")
            .style("pointer-events", "none");

        // Draw rectangles
        let xPosition = 0;
        data.forEach((category, i) => {
            const categoryWidth = (category.total / totalSum) * 100;
            let yPosition = 100;

            category.subcategories.forEach((subcat, j) => {
                const subcatHeight = (subcat.value / category.total) * 100;
                yPosition -= subcatHeight;

                svg.append("rect")
                    .attr("x", xScale(xPosition))
                    .attr("y", yScale(yPosition + subcatHeight))
                    .attr("width", xScale(categoryWidth) - xScale(0))
                    .attr("height", yScale(yPosition) - yScale(yPosition + subcatHeight))
                    .attr("fill", categoryColor(j))
                    .attr("stroke", "white")
                    .attr("stroke-width", 1)
                    .on("mouseover", function(event) {
                        tooltip
                            .style("visibility", "visible")
                            .html(`
                                ${category.category} - ${subcat.name}<br/>
                                ${subcatHeight.toFixed(1)}% of category<br/>
                                ${((categoryWidth * subcatHeight) / 100).toFixed(1)}% of total
                            `)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    })
                    .on("mousemove", function(event) {
                        tooltip
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.style("visibility", "hidden");
                    });
            });

            xPosition += categoryWidth;
        });

        // Cleanup
        return () => {
            tooltip.remove();
        };

    }, [queryResponse]);

    return (
        <div style={{
            width: '100%',
            height: '600px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '10px'
        }}>
            <div style={{
                minWidth: 'fit-content',
                height: '100%'
            }}>
                <svg ref={svgRef}></svg>
            </div>
        </div>
    );
};

export default MosaicPlot;