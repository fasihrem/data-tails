import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const LineChart = ({ data }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || !data.length) return;

        const container = d3.select(containerRef.current);
        container.selectAll("svg").remove();

        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = 800, height = 500;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const xScale = d3.scalePoint()
            .domain(data.map(d => d.x))
            .range([margin.left, width - margin.right])
            .padding(0.5);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 4)
            .attr("fill", "steelblue");

    }, [data]);

    return <div ref={containerRef}></div>;
};

export default LineChart;
