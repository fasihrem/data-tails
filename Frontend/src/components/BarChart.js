import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const BarChart = ({ queryResponse, title = "" }) => {
    const svgRef = useRef();
    const [chartData, setChartData] = useState([]);
    const [error, setError] = useState(null);

    /** 🛠 Extract structured data from chatbot response */
    const parseResponseToData = (response) => {
        if (!response || (typeof response === "string" && response.trim() === "")) {
            setError("Empty response received");
            return [];
        }

        let data = [];
        try {
            if (typeof response === "object") {
                data = Object.entries(response).map(([key, value]) => ({
                    category: key,
                    value: parseFloat(value),
                }));
            } else {
                const text = typeof response === "string" ? response : JSON.stringify(response);
                const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);

                const patterns = [
                    { regex: /\*\*(.*?)\*\*.*?([\d,]+)\s*(billion|million|thousand|%)?/i }, // **Category**: Value
                    { regex: /([\w\s-]+):\s*([\d,]+)\s*(billion|million|thousand|%)?/i }, // Category: Value
                    { regex: /([\w\s-]+)\s*-\s*([\d,]+)\s*(billion|million|thousand|%)?/i }, // Category - Value
                    { regex: /(\d+)\.\s*\*\*(.*?)\*\*/, rank: true } // "1. **Item Name**"
                ];

                let inferredRank = 5; // Default inferred ranking
                lines.forEach((line, index) => {
                    for (const pattern of patterns) {
                        const match = line.match(pattern.regex);
                        if (match) {
                            let category = match[1].trim();
                            let value = match[2] ? match[2].replace(/,/g, "").trim() : index + 1;

                            if (/billion/i.test(match[3])) value = parseFloat(value) * 1000;
                            else if (/million/i.test(match[3])) value = parseFloat(value);
                            else if (/thousand/i.test(match[3])) value = parseFloat(value) / 1000;
                            else value = parseFloat(value);

                            if (!match[2]) value = inferredRank - index;

                            if (category && !isNaN(value)) {
                                data.push({ category, value });
                                break;
                            }
                        }
                    }
                });
            }
        } catch (error) {
            setError("Failed to parse response data");
            return [];
        }

        if (data.length === 0) {
            setError("No valid chart data could be extracted from the response");
        } else {
            setError(null);
        }

        return data;
    };

    /** 📊 Create Bar Chart using D3.js */
    const createBarChart = (data) => {
        const svgElement = svgRef.current;
        d3.select(svgElement).selectAll("*").remove();

        if (data.length === 0) {
            d3.select(svgElement)
                .append("text")
                .attr("x", "50%")
                .attr("y", "50%")
                .attr("text-anchor", "middle")
                .style("fill", "#666")
                .text("No valid data to display");
            return;
        }

        // Sort data by value
        data.sort((a, b) => b.value - a.value);
        data = data.filter(d => d.value >= 0);

        // SVG dimensions
        const svgWidth = svgElement.clientWidth || 700;
        const svgHeight = svgElement.clientHeight || 400;
        const margin = { top: 50, right: 30, bottom: 100, left: 80 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        const svg = d3.select(svgElement)
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X Scale
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([0, chartWidth])
            .padding(0.4);

        // Y Scale
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value) * 1.2])
            .nice()
            .range([chartHeight, 0]);

        // X Axis
        svg.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Y Axis
        svg.append("g").call(d3.axisLeft(yScale));

        // Bars
        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.category))
            .attr("y", chartHeight)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("fill", "steelblue")
            .transition()
            .duration(800)
            .attr("y", d => yScale(d.value))
            .attr("height", d => Math.max(0, chartHeight - yScale(d.value)));

        // Labels on Bars
        svg.selectAll(".label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => xScale(d.category) + xScale.bandwidth() / 2)
            .attr("y", d => Math.max(yScale(d.value) - 5, 15))
            .attr("text-anchor", "middle")
            .style("fill", "#fff")
            .style("font-size", "12px")
            .text(d => d.value);

        // Chart Title
        svg.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text(title);
    };

    useEffect(() => {
        if (queryResponse) {
            const data = parseResponseToData(queryResponse);
            setChartData(data);
        }
    }, [queryResponse]);

    useEffect(() => {
        if (chartData.length > 0) {
            createBarChart(chartData);
        }
    }, [chartData, title]);

    return (
        <div style={{
            width: "100%",
            height: "100%",
            minHeight: "400px",
            background: "white",
            borderRadius: "12px",
            padding: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
            {error && (
                <div style={{
                    color: "#d32f2f",
                    padding: "10px",
                    backgroundColor: "#ffebee",
                    borderRadius: "4px",
                    textAlign: "center"
                }}>
                    {error}
                </div>
            )}
            <svg ref={svgRef} style={{ width: "100%", height: error ? "calc(100% - 40px)" : "100%" }} />
        </div>
    );
};

export default BarChart;
