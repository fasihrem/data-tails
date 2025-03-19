import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const BarChart = ({ response, title = "" }) => {
    const svgRef = useRef();
    const [chartData, setChartData] = useState([]);
    const [error, setError] = useState(null);

    const parseResponseToData = (response) => {
        if (!response || (typeof response === "string" && response.trim() === "")) {
            setError("Empty response received");
            return [];
        }

        let data = [];
        try {
            if (typeof response === "string") {
                // Pattern 1: Fiscal Year with dollar amounts
                const fiscalYearPattern = /Fiscal Year (\d{4}):\s*\$?([\d,\.]+)\s*(billion|million|thousand)?/gi;
                let match;
                
                while ((match = fiscalYearPattern.exec(response)) !== null) {
                    let value = parseFloat(match[2].replace(/,/g, ''));
                    if (match[3]) {
                        switch (match[3].toLowerCase()) {
                            case 'billion': value *= 1000; break;
                            case 'million': break;
                            case 'thousand': value /= 1000; break;
                        }
                    }
                    data.push({
                        category: `FY ${match[1]}`,
                        value: value
                    });
                }

                // Pattern 2: Numbered items with values (e.g., game sales)
                if (data.length === 0) {
                    const numberedValuePattern = /\d+\.\s*\*\*([^*]+)\*\*[^$]*?(\d+(?:\.\d+)?)\s*(billion|million|thousand)?/gi;
                    while ((match = numberedValuePattern.exec(response)) !== null) {
                        let value = parseFloat(match[2]);
                        if (match[3]) {
                            switch (match[3].toLowerCase()) {
                                case 'billion': value *= 1000; break;
                                case 'million': break;
                                case 'thousand': value /= 1000; break;
                            }
                        }
                        data.push({
                            category: match[1].trim(),
                            value: value
                        });
                    }
                }

                // Pattern 3: Simple numbered genres/items (e.g., music genres)
                if (data.length === 0) {
                    const numberedItemPattern = /\d+\.\s*\*\*([\w\s/-]+)\*\*/g;
                    let rankValue = 10; // Start with high value for ranking
                    while ((match = numberedItemPattern.exec(response)) !== null) {
                        data.push({
                            category: match[1].trim(),
                            value: rankValue
                        });
                        rankValue--; // Decrease rank value for next item
                    }
                }

                // Pattern 4: Decades with genres
                if (data.length === 0) {
                    const decadePattern = /(\d{4})s:\s*\*([^*]+)\*/g;
                    while ((match = decadePattern.exec(response)) !== null) {
                        const decade = match[1];
                        const genres = match[2].split('*').filter(g => g.trim());
                        data.push({
                            category: `${decade}s`,
                            value: genres.length
                        });
                    }
                }

                // Pattern 5: Fallback for any asterisk-marked items
                if (data.length === 0) {
                    const fallbackPattern = /\*\*([\w\s/-]+)\*\*/g;
                    let fallbackValue = 5;
                    while ((match = fallbackPattern.exec(response)) !== null) {
                        data.push({
                            category: match[1].trim(),
                            value: fallbackValue
                        });
                        fallbackValue--;
                    }
                }

                // Sort data appropriately
                if (data.length > 0) {
                    if (data[0].category.includes('FY') || data[0].category.includes('s')) {
                        // Chronological order for years/decades
                        data.sort((a, b) => {
                            const yearA = parseInt(a.category.match(/\d+/)[0]);
                            const yearB = parseInt(b.category.match(/\d+/)[0]);
                            return yearA - yearB;
                        });
                    } else {
                        // Value order for rankings
                        data.sort((a, b) => b.value - a.value);
                    }
                }
            }
        } catch (error) {
            console.error("Parsing error:", error);
            setError("Failed to parse response data");
            return [];
        }

        if (data.length === 0) {
            setError("No valid chart data could be extracted from the response");
        } else {
            setError(null);
        }

        console.log("Parsed data:", data);
        return data;
    };

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
        if (response) {
            const data = parseResponseToData(response);
            setChartData(data);
        }
    }, [response]);

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
