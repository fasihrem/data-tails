import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AreaChart = ({ queryResponse }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!queryResponse) return;

        // Clear previous chart
        d3.select(containerRef.current).selectAll("*").remove();

        const processQueryToTable = (response) => {
            try {
                const data = [];
                let dataType = '';
                let unit = '';
                
                // Detect data type and unit from query
                if (response.toLowerCase().includes('revenue')) {
                    dataType = 'Revenue';
                    unit = 'B';
                } else if (response.toLowerCase().includes('subscriber')) {
                    dataType = 'Subscribers';
                    unit = 'M';
                } else if (response.toLowerCase().includes('stock price')) {
                    dataType = 'Stock Price';
                    unit = '$';
                } else if (response.toLowerCase().includes('medal')) {
                    dataType = 'Gold Medals';
                    unit = '';
                } else if (response.toLowerCase().includes('user')) {
                    dataType = 'Users';
                    unit = 'M';
                } else if (response.toLowerCase().includes('mention')) {
                    dataType = 'Mentions';
                    unit = 'K';
                }

                // Extract year-value pairs using multiple patterns
                const patterns = [
                    /(\d{4})(?:[:\s]+)(\d+(?:\.\d+)?)/g,
                    /in\s+(\d{4})[^\d]*?(\d+(?:\.\d+)?)/g,
                    /(\d+(?:\.\d+)?)[^\d]*?(\d{4})/g
                ];

                let matches = [];
                for (const pattern of patterns) {
                    const found = [...response.matchAll(pattern)];
                    if (found.length > 0) {
                        matches = found;
                        break;
                    }
                }

                // Process matches into data points
                matches.forEach(match => {
                    const year = match[1].length === 4 ? match[1] : match[2];
                    const value = match[1].length === 4 ? match[2] : match[1];

                    if (parseInt(year) >= 1900 && parseInt(year) <= 2100) {
                        data.push({
                            date: new Date(year),
                            value: parseFloat(value),
                            name: year
                        });
                    }
                });

                // Sort and remove duplicates
                const uniqueData = Array.from(
                    new Map(data.map(item => [item.date, item])).values()
                ).sort((a, b) => new Date(a.date) - new Date(b.date));

                return {
                    data: uniqueData,
                    dataType,
                    unit
                };

            } catch (error) {
                console.error("Error processing query:", error);
                return { data: [], dataType: 'Value', unit: '' };
            }
        };

        const { data, dataType, unit } = processQueryToTable(queryResponse);
        if (data.length === 0) return;

        // Setup dimensions
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
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
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) * 1.1])
            .range([height, 0]);

        // Create area generator
        const area = d3.area()
            .x(d => xScale(d.date))
            .y0(height)
            .y1(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        // Add gradient
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "area-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", height)
            .attr("x2", 0).attr("y2", 0);

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#e8f3ff")
            .attr("stop-opacity", 0.8);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#3182bd")
            .attr("stop-opacity", 0.2);

        // Add area path with transition
        svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area)
            .style("fill", "url(#area-gradient)");

        // Add line path
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#3182bd")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Format value based on unit
        const formatValue = (value, unit) => {
            switch(unit) {
                case 'B': return `$${value}B`;
                case 'M': return `${value}M`;
                case 'K': return `${value}K`;
                case '$': return `$${value}`;
                default: return value.toLocaleString();
            }
        };

        // Add axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(width > 600 ? 10 : 5)
            .tickFormat(d3.timeFormat("%Y"));

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d => formatValue(d, unit));

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        // Add tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "10px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("pointer-events", "none");

        // Add hover line
        const hoverLine = svg.append("line")
            .attr("class", "hover-line")
            .style("stroke", "#999")
            .style("stroke-width", "1px")
            .style("opacity", 0);

        // Enhanced hover and click interactions
        let activePoint = null;

        // Function to update hover visualization
        const updateHover = (event, clicked = false) => {
            const [xPos] = d3.pointer(event);
            const bisect = d3.bisector(d => d.date).left;
            const x0 = xScale.invert(xPos);
            const i = bisect(data, x0, 1);
            const d0 = data[i - 1];
            const d1 = data[i];
            const d = x0 - new Date(d0.date) > new Date(d1.date) - x0 ? d1 : d0;

            // Update hover line
            hoverLine
                .attr("x1", xScale(new Date(d.date)))
                .attr("x2", xScale(new Date(d.date)))
                .attr("y1", 0)
                .attr("y2", height)
                .style("opacity", 1);

            // Update tooltip
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>Year: ${d.name}</strong><br/>
                    ${dataType}: ${formatValue(d.value, unit)}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");

            // Update active point
            if (activePoint) activePoint.remove();
            
            activePoint = svg.append("circle")
                .attr("class", "active-point")
                .attr("cx", xScale(new Date(d.date)))
                .attr("cy", yScale(d.value))
                .attr("r", 6)
                .style("fill", "#3182bd")
                .style("stroke", "white")
                .style("stroke-width", 2);

            if (clicked) {
                activePoint
                    .style("stroke", "#ff4757")
                    .style("stroke-width", 3)
                    .attr("r", 7);
            }
        };

        // Add overlay for mouse events with improved interaction
        const overlay = svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");

        // Mouse events
        overlay
            .on("mousemove", function(event) {
                updateHover(event);
            })
            .on("click", function(event) {
                updateHover(event, true);
            })
            .on("mouseout", function() {
                if (!activePoint) {
                    hoverLine.style("opacity", 0);
                    tooltip.style("opacity", 0);
                }
            });

        // Add data points for better interaction
        svg.selectAll(".data-point")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", d => xScale(new Date(d.date)))
            .attr("cy", d => yScale(d.value))
            .attr("r", 4)
            .style("fill", "#3182bd")
            .style("opacity", 0.5)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 1);
                const fakeEvent = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                updateHover(fakeEvent);
            })
            .on("click", function(event, d) {
                const fakeEvent = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                updateHover(fakeEvent, true);
            });

        return () => {
            d3.select(".tooltip").remove();
            if (activePoint) activePoint.remove();
        };

    }, [queryResponse]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: '100%',
                height: '400px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '20px'
            }}
        />
    );
};

export default AreaChart; 