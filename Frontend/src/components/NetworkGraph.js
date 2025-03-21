import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const NetworkGraph = ({ queryResponse }) => {
    const svgRef = useRef();

    const parseResponseToNetwork = (text) => {
        const nodes = [];
        const links = [];
        let nodeId = 0;

        if (!text) return { nodes, links };

        const sections = text.split(/\d+\.\s\*\*(.*?)\*\*/g).filter(Boolean);

        sections.forEach((section, index) => {
            if (index % 2 !== 0) {
                // Truncate category name to first 2-3 significant words
                const category = sections[index - 1]?.trim()
                    .split(/\s+/)
                    .slice(0, 3)
                    .join(' ');
                const categoryId = nodeId++;
                
                nodes.push({
                    id: categoryId,
                    name: category,
                    group: 1,
                    radius: 8
                });

                const subcategoryText = section.trim();
                const subcategories = subcategoryText
                    .split(",")
                    .map(item => {
                        // Take only first 2 words for subcategories
                        return item.replace(/[^a-zA-Z0-9\s]/g, "")
                            .trim()
                            .split(/\s+/)
                            .slice(0, 2)
                            .join(' ');
                    })
                    .filter(item => item.length > 2);

                subcategories.forEach(subItem => {
                    const subId = nodeId++;
                    nodes.push({
                        id: subId,
                        name: subItem,
                        group: 2,
                        radius: 5
                    });
                    links.push({
                        source: categoryId,
                        target: subId,
                        value: 1
                    });
                });
            }
        });

        return { nodes, links };
    };

    useEffect(() => {
        if (!queryResponse) return;

        const width = 1500;
        const height = window.innerHeight * 0.8;

        // Clean up previous chart
        d3.select(svgRef.current).selectAll("*").remove();

        // Create SVG with larger dimensions
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "white");

        // Add defs element for gradients
        const defs = svg.append("defs");

        // Add zoom and pan capabilities
        const zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        // Create a container group for all elements
        const g = svg.append("g");
        
        svg.call(zoom);

        // Add double-click to reset zoom
        svg.on("dblclick.zoom", null);
        svg.on("dblclick", () => {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });

        // Parse data
        const { nodes, links } = parseResponseToNetwork(queryResponse);

        // Create gradients for each link
        links.forEach((link, i) => {
            const gradientId = `link-gradient-${i}`;
            const gradient = defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("gradientUnits", "userSpaceOnUse");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d3.schemeAccent[link.source % 8]);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d3.schemeAccent[link.target % 8]);
        });

        // Adjust force simulation for better spread
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links)
                .id(d => d.id)
                .distance(80)) // Increased distance between nodes
            .force("charge", d3.forceManyBody()
                .strength(-200)) // Stronger repulsion
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide()
                .radius(d => d.radius * 4)); // Increased collision radius

        // Create links
        const link = g.append("g")
            .selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .attr("stroke", (d, i) => `url(#link-gradient-${i})`)
            .attr("stroke-width", 2)
            .attr("opacity", 0.6);

        // Create nodes
        const node = g.append("g")
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d3.schemeAccent[d.group % 8])
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .call(drag(simulation));

        // Add labels
        const label = g.append("g")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .text(d => d.name)
            .attr("font-size", d => d.group === 1 ? "12px" : "10px")
            .attr("dx", d => d.radius + 5)
            .attr("dy", ".35em")
            .style("pointer-events", "none")
            .style("fill", "#333")
            .style("font-weight", d => d.group === 1 ? "bold" : "normal");

        // Create tooltip with simplified content
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(255, 255, 255, 0.98)")
            .style("padding", "6px 10px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("font-size", "11px")
            .style("max-width", "150px")
            .style("text-align", "center");

        // Add hover effects with simplified text
        node.on("mouseover", function(event, d) {
            d3.select(this)
                .attr("stroke", "#000")
                .attr("stroke-width", "2");
            
            // Extract main keyword or first few words
            const briefText = d.name.split(' ').slice(0, 3).join(' ') + 
                (d.name.split(' ').length > 3 ? '...' : '');
            
            tooltip.style("opacity", 1)
                .html(briefText)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("stroke", "#fff")
                .attr("stroke-width", "1.5");
            tooltip.style("opacity", 0);
        });

        // Update tick function to contain nodes within bounds
        simulation.on("tick", () => {
            node
                .attr("cx", d => Math.max(d.radius, Math.min(width - d.radius, d.x)))
                .attr("cy", d => Math.max(d.radius, Math.min(height - d.radius, d.y)));

            link
                .attr("x1", d => Math.max(0, Math.min(width, d.source.x)))
                .attr("y1", d => Math.max(0, Math.min(height, d.source.y)))
                .attr("x2", d => Math.max(0, Math.min(width, d.target.x)))
                .attr("y2", d => Math.max(0, Math.min(height, d.target.y)));

            label
                .attr("x", d => Math.max(d.radius, Math.min(width - d.radius, d.x)))
                .attr("y", d => Math.max(d.radius, Math.min(height - d.radius, d.y)));
        });

        // Drag functionality
        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        return () => {
            simulation.stop();
            tooltip.remove();
        };

    }, [queryResponse]);

    return (
        <div style={{ 
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            margin: '20px',
            width: '100%',
            height: '100%',
            maxWidth: '1200px',
            position: 'relative',
            left: '-5%',
            overflow: 'auto' // Enable scrolling
        }}>
            <div style={{
                width: '100%',
                height: '80vh',
                overflow: 'auto', // Enable container scrolling
                position: 'relative'
            }}>
                <svg ref={svgRef} style={{ 
                    minWidth: "100%", // Ensure minimum width
                    height: "100%",
                    display: "block"
                }} />
            </div>
        </div>
    );
};

export default NetworkGraph; 