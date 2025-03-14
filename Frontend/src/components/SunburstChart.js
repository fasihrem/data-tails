import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SunburstChart = ({ queryResponse }) => {
    const svgRef = useRef();

    // Function to process query response into hierarchical data
    const processData = (text) => {
        if (!text) return null;

        const root = { name: "Topics Analysis", children: [] };

        try {
            // Remove text before first **category**
            let validText = text.match(/\*\*(.+)/s);
            if (!validText) return root; // No categories found
            validText = validText[0]; 

            // Split sections by categories (** marks new category)
            const sections = validText.split(/\*\*(.*?)\*\*/).filter(Boolean);

            sections.forEach((section, index) => {
                if (index % 2 === 0) return; // Skip unmatched text

                const categoryName = sections[index - 1]?.trim();
                if (!categoryName) return;

                const categoryNode = { name: categoryName, children: [] };

                // Extract subcategories from bullet points (* markers)
                const subcategories = section.split('*').filter(Boolean);
                subcategories.forEach(sub => {
                    const trimmedSub = sub.trim();
                    if (trimmedSub) {
                        categoryNode.children.push({ name: trimmedSub, value: 1 });
                    }
                });

                if (categoryNode.children.length === 0) {
                    categoryNode.value = 1;
                }

                root.children.push(categoryNode);
            });

            return root;
        } catch (error) {
            console.error('Error processing data:', error);
            return null;
        }
    };

    useEffect(() => {
        if (!queryResponse) return;
        d3.select(svgRef.current).selectAll("*").remove();

        const width = 800;
        const height = 800;
        const radius = Math.min(width, height) / 2.5;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height]);

        // **Pastel Color Palette**
        const pastelColors = [
            "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
            "#D7BDE2", "#F5B7B1", "#A3E4D7", "#F9E79F", "#AED6F1"
        ];

        const baseColors = d3.scaleOrdinal(pastelColors); // Assigns a unique pastel color to each category

        const getColor = (d) => {
            if (d.depth === 1) {
                return baseColors(d.data.name); // Unique pastel color for each main category
            } else if (d.depth > 1 && d.parent) {
                return d3.interpolateLab(baseColors(d.parent.data.name))(0.6 + d.depth * 0.1); // Lighter pastel for subcategories
            }
            return "#ffffff"; // Root remains white
        };

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(0.02)
            .padRadius(radius / 2)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => d.y1 * radius);

        const partition = data => d3.partition()
            .size([2 * Math.PI, 1])
            (d3.hierarchy(data)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value));

        const root = partition(processData(queryResponse));

        // **Assign Colors Based on Hierarchical Levels**
        const path = svg.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => getColor(d)) // Applies pastel colors dynamically
            .attr("fill-opacity", 0.9)
            .attr("d", arc);

        // Labels for better readability
        const label = svg.append("g")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("transform", d => {
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 2 * radius;
                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .style("font-weight", "500")
            .style("fill", "#333")
            .style("pointer-events", "none")
            .text(d => d.data.name.length > 12 ? d.data.name.slice(0, 10) + '...' : d.data.name);

        // Tooltip
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "sunburst-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "white")
            .style("color", "#333")
            .style("padding", "12px")
            .style("border-radius", "6px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("font-size", "14px")
            .style("max-width", "280px")
            .style("pointer-events", "none")
            .style("z-index", "1000");

        // Hover effect
        path.on("mouseover", function(event, d) {
            d3.select(this)
                .attr("fill-opacity", 1)
                .style("stroke", "#fff")
                .style("stroke-width", "2px");

            const fullPath = d.ancestors()
                .map(d => d.data.name)
                .reverse()
                .slice(1)
                .join(" → ");

            tooltip
                .style("visibility", "visible")
                .html(`
                    <div style="font-weight: bold; margin-bottom: 8px;">
                        ${d.data.name}
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        ${fullPath}
                    </div>
                    ${d.children ? 
                        `<div style="font-size: 12px; margin-top: 8px;">
                            Contains ${d.children.length} subtopics
                        </div>` : ''}
                `);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("fill-opacity", 0.9)
                .style("stroke", "none");
            tooltip.style("visibility", "hidden");
        });

        return () => tooltip.remove();
    }, [queryResponse]);

    return (
        <div style={{
            width: '100%',
            minHeight: '800px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: 'white'
        }}>
            <svg 
                ref={svgRef}
                style={{
                    maxWidth: '800px',
                    width: '100%',
                    height: 'auto'
                }}
            />
        </div>
    );
};

export default SunburstChart;
