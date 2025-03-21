import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const TreeDiagram = ({ queryResponse }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!queryResponse) return;

        // Clear previous visualization
        d3.select(svgRef.current).selectAll("*").remove();

        // Set dimensions with more horizontal space
        const width = 2400;
        const height = 800;
        const margin = { top: 20, right: 300, bottom: 20, left: 100 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Color scale matching your image
        const colorScale = d3.scaleOrdinal()
            .domain(['expandable', 'leaf'])
            .range(['#4169E1', '#FFFFFF']);  // Blue for expandable, White for leaves

        // Create the SVG container
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create tree layout with specific spacing
        const treeLayout = d3.tree()
            .size([innerHeight, innerWidth])
            .separation((a, b) => {
                return a.parent === b.parent ? 1.5 : 2.5;  // Adjusted separation
            });

        // Generate hierarchy
        const root = d3.hierarchy(parseResponseToHierarchy(queryResponse));
        root.x0 = innerHeight / 2;
        root.y0 = 0;

        const update = (source) => {
            const tree = treeLayout(root);
            const nodes = root.descendants();
            const links = root.links();

            // Normalize for fixed-depth with specific spacing
            nodes.forEach(d => {
                d.y = d.depth * 250;  // Adjusted horizontal spacing
            });

            // Update nodes
            const node = svg.selectAll("g.node")
                .data(nodes, d => d.id || (d.id = Math.random()));

            // Enter new nodes
            const nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", d => `translate(${d.y},${d.x})`);

            // Add Circle for nodes with specific styling
            nodeEnter.append("circle")
                .attr("r", 4)  // Smaller radius to match image
                .style("fill", d => {
                    if (d.children || d._children) {
                        return colorScale('expandable');
                    }
                    return colorScale('leaf');
                })
                .style("stroke", "#666")  // Light gray stroke
                .style("stroke-width", 1)
                .style("cursor", d => (d.children || d._children) ? "pointer" : "default");

            // Add click handler
            nodeEnter.on("click", (event, d) => {
                if (d.children || d._children) {
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                    update(d);
                }
            });

            // Add labels with specific styling
            nodeEnter.append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d.children || d._children ? -8 : 8)
                .attr("text-anchor", d => d.children || d._children ? "end" : "start")
                .text(d => {
                    if (d.children || d._children) {
                        return `${d.children ? '−' : '+'} ${d.data.name}`;
                    }
                    return d.data.name;
                })
                .style("fill", "#333")  // Dark gray text
                .style("font-size", "12px")
                .style("font-family", "Arial")
                .style("font-weight", "normal");  // Normal weight for all text

            // Update links with thinner, lighter lines
            const link = svg.selectAll("path.link")
                .data(links, d => d.target.id);

            // Enter new links
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x))
                .attr("fill", "none")
                .attr("stroke", "#ccc")  // Light gray links
                .attr("stroke-width", 0.5);  // Thinner lines

            // Remove old nodes and links
            node.exit().remove();
            link.exit().remove();

            // Update positions
            svg.selectAll("g.node")
                .attr("transform", d => `translate(${d.y},${d.x})`);

            svg.selectAll("path.link")
                .attr("d", d3.linkHorizontal()
                    .x(d => d.y)
                    .y(d => d.x));
        };

        // Collapse nodes initially (except root)
        root.descendants().forEach(d => {
            if (d.depth !== 0) {
                d._children = d.children;
                d.children = null;
            }
        });

        // Initial update
        update(root);

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .on("zoom", (event) => {
                svg.attr("transform", event.transform);
            });

        d3.select(svgRef.current)
            .call(zoom)
            .call(zoom.transform, d3.zoomIdentity.translate(margin.left, margin.top));

    }, [queryResponse]);

    return (
        <div style={{
            width: '100%',
            height: '800px',
            overflow: 'auto',  // Enable scrolling
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            paddingLeft: '50px'  // Added padding to the container
        }}>
            <div style={{
                width: '2400px',  // Match SVG width
                height: '100%',
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
        </div>
    );
};

const parseResponseToHierarchy = (response) => {
    try {
        if (!response) return null;

        const text = typeof response === 'string' ? response : JSON.stringify(response);
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.toLowerCase().includes('here are'));

        // Find the first category (which should be the main topic)
        let rootName = '';
        for (const line of lines) {
            // Skip common introductory phrases
            if (line.toLowerCase().includes('great') || 
                line.toLowerCase().includes('here') ||
                line.toLowerCase().includes('let me') ||
                line.toLowerCase().includes('i can')) {
                continue;
            }
            
            // Extract the first real category name
            const cleanedLine = line.replace(/^[0-9.]+\s*/, '')  // Remove numbering
                                  .replace(/^[-*•]\s*/, '')       // Remove bullet points
                                  .replace(/\*\*/g, '')           // Remove asterisks
                                  .split(':')[0]                  // Get text before colon
                                  .trim();
            
            if (cleanedLine) {
                rootName = cleanedLine;
                break;
            }
        }

        const root = {
            name: rootName,
            children: []
        };

        let currentCategory = null;

        lines.forEach(line => {
            line = line.replace(/^[0-9.]+\s*/, '')
                      .replace(/^[-*•]\s*/, '')
                      .trim();

            if (line.includes('**')) {
                const name = line.replace(/\*\*/g, '').split(':')[0].trim();
                currentCategory = {
                    name: name,
                    children: []
                };
                root.children.push(currentCategory);
            }
            else if (line.includes(':') && currentCategory) {
                const name = line.split(':')[0].trim();
                currentCategory.children.push({
                    name: name
                });
            }
        });

        // Filter and sort
        root.children = root.children
            .filter(category => category.children.length > 0)
            .map(category => ({
                ...category,
                children: category.children.sort((a, b) => 
                    a.name.localeCompare(b.name)
                )
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return root;
    } catch (error) {
        console.error("Error parsing response:", error);
        return {
            name: "Error",
            children: []
        };
    }
};

export default TreeDiagram;