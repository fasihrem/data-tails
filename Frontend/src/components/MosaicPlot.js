import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MosaicPlot = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/output.json"); // ✅ Correct path
        const jsonData = await response.json();

        if (!jsonData.mosaic_plot || !jsonData.mosaic_plot.data) {
          console.error("No mosaic plot data available.");
          setData([]);
          return;
        }

        // ✅ Convert "billion" values to numbers
        const formattedData = jsonData.mosaic_plot.data.map((d) => ({
          title: d.title,
          gross: parseFloat(d.gross.replace(" billion", "")), // "2.79 billion" → 2.79
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error loading mosaic plot data:", error);
      }
    };

    fetchData();

  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 100, left: 80 };

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const totalGross = d3.sum(data, (d) => d.gross);
    let xOffset = 0;

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);


    data.forEach((d, i) => {
      const widthPercentage = (d.gross / totalGross) * (width - margin.left - margin.right);
      const heightPercentage = height - margin.top - margin.bottom;

      svg
        .append("rect")
        .attr("x", xOffset)
        .attr("y", 0)
        .attr("width", widthPercentage)
        .attr("height", heightPercentage)
        .attr("fill", colorScale(i))
        .attr("stroke", "white")
        .on("mouseover", function () {
          d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function () {
          d3.select(this).attr("fill", colorScale(i));
        });


      svg
        .append("text")
        .attr("x", xOffset + widthPercentage / 2)
        .attr("y", heightPercentage / 2)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text(d.title);

      xOffset += widthPercentage;
    });

  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default MosaicPlot;
