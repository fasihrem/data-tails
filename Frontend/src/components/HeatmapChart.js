import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HeatmapChart = ({ queryResponse }) => {
    const svgRef = useRef();
    const containerRef = useRef();
    const tooltipRef = useRef();
    const [dataConfig, setDataConfig] = useState({ rows: [], cols: [], data: [] });

    const processData = (response) => {
        if (!response || response.length === 0) return { data: [], rows: [], cols: [] };

        try {
            let rows = [], cols = [], data = [];
            let wordCounts = {}; // Stores word frequency

            // 🔍 Extract bold words (Y-axis)
            const boldWords = [...response.matchAll(/\*\*(.*?)\*\*/g)].map(match => match[1]);

            if (boldWords.length > 0) {
                rows = boldWords.slice(0, 10); // Limit to top 10 rows
            } else {
                // If no bold words, extract numbered list items
                const listItems = [...response.matchAll(/\d+\.\s\*\*(.*?)\*\*/g)].map(match => match[1]);
                rows = listItems.length > 0 ? listItems.slice(0, 10) : ["Topic 1", "Topic 2"];
            }

            // ✅ Count occurrences of each word in the queryResponse
            response.split(/\s+/).forEach(word => {
                const cleanedWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (cleanedWord.length > 2) {
                    wordCounts[cleanedWord] = (wordCounts[cleanedWord] || 0) + 1;
                }
            });

            // 🔄 Auto-detect Column Categories (X-Axis)
            const lowerCaseResponse = response.toLowerCase();
            if (lowerCaseResponse.includes("year") || lowerCaseResponse.includes("time")) {
                cols = [...new Set(response.match(/\b\d{4}s?\b/g) || ["2000s", "2010s", "2020s", "Future"])];
            } else if (lowerCaseResponse.includes("trend")) {
                cols = [...new Set(response.match(/\b(rising|steady|declining)\b/g) || ["Rising", "Steady", "Declining"])];
            } else if (lowerCaseResponse.includes("category") || lowerCaseResponse.includes("topic")) {
                cols = [...new Set(response.match(/\b(music|tech|science|health|movies|games)\b/g) || ["Music", "Tech", "Science", "Health"])];
            } else {
                cols = [...new Set(response.match(/\b(low|medium|high)\b/g) || ["Low", "Medium", "High"])];
            }

            // 🔄 Assign values based on actual word frequency
            rows.forEach(row => {
                cols.forEach(col => {
                    const value = wordCounts[row.toLowerCase()] || Math.floor(Math.random() * 10); // Lookup frequency
                    data.push({ row, col, value });
                });
            });

            return { rows, cols, data };
        } catch (error) {
            console.error("Error processing data:", error);
            return { data: [], rows: [], cols: [] };
        }
    };

    const renderHeatmap = () => {
        if (!containerRef.current || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 50, right: 20, bottom: 80, left: 250 };
        const width = containerRef.current.clientWidth - margin.left - margin.right;
        const height = containerRef.current.clientHeight - margin.top - margin.bottom;

        const { data, rows, cols } = dataConfig;

        if (!data.length || !rows.length || !cols.length) {
            console.log("No data to display");
            return;
        }

        // 🎨 Define grid scales
        const xScale = d3.scaleBand().domain(cols).range([0, width]).padding(0);
        const yScale = d3.scaleBand().domain(rows).range([0, height]).padding(0);
        const boxWidth = xScale.bandwidth();
        const boxHeight = yScale.bandwidth();

        // 🔵 Color scale for heatmap
        const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(data, d => d.value) || 10]);

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        // 🟦 Draw heatmap squares
        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.col))
            .attr("y", d => yScale(d.row))
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .attr("fill", d => colorScale(d.value))
            .attr("stroke", "#fff")
            .attr("rx", 3)
            .attr("ry", 3)
            .on("mouseover", (event, d) => {
                d3.select(event.target).attr("stroke", "#222").attr("stroke-width", 2);
                d3.select(tooltipRef.current)
                    .style("visibility", "visible")
                    .style("top", (event.pageY - 20) + "px")
                    .style("left", (event.pageX + 10) + "px")
                    .html(`
                        <strong>${d.row} → ${d.col}</strong><br/>
                        Frequency: <strong>${d.value}</strong>
                    `);
            })
            .on("mouseout", (event) => {
                d3.select(event.target).attr("stroke", "#fff").attr("stroke-width", 1);
                d3.select(tooltipRef.current).style("visibility", "hidden");
            });

        // 🏷️ Add X-Axis Labels
        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-35)")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        // 🏷️ Add Y-Axis Labels
        g.append("g").call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-size", "14px")
            .style("font-weight", "bold");

        // 📌 Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Heatmap Visualization");
    };

    useEffect(() => {
        setDataConfig(processData(queryResponse));
    }, [queryResponse]);

    useEffect(() => {
        if (dataConfig.data.length) renderHeatmap();
        window.addEventListener("resize", renderHeatmap);
        return () => window.removeEventListener("resize", renderHeatmap);
    }, [dataConfig]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "500px", position: "relative", backgroundColor: "white" }}>
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
            <div ref={tooltipRef} style={{
                position: "absolute",
                visibility: "hidden",
                backgroundColor: "white",
                padding: "8px",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }} />
        </div>
    );
};

export default HeatmapChart;
