import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TreemapChart = ({ queryResponse }) => {
    const svgRef = useRef();
    const containerRef = useRef();

    const processData = (text) => {
        if (!text) {
            return {
                name: "No Data",
                children: [{ name: "Empty", value: 100 }]
            };
        }

        try {
            // Parse text to extract hierarchical structure
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            // Create root structure
            const root = {
                name: "Topics",
                children: []
            };
            
            // Track categories and subcategories
            let currentCategory = null;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Check if this is a main category (numbered or with **)
                if (/^\d+\./.test(line) || line.includes("**")) {
                    const categoryName = line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
                    currentCategory = {
                        name: categoryName,
                        fullName: categoryName,
                        children: []
                    };
                    root.children.push(currentCategory);
                }
                // Check if this is a subcategory (starts with * or -)
                else if (currentCategory && (line.startsWith('*') || line.startsWith('-'))) {
                    const subcategoryName = line.replace(/^[\*\-]\s*/, '').trim();
                    
                    // Skip explanatory text
                    if (subcategoryName.startsWith("These") || 
                        subcategoryName.startsWith("This") || 
                        subcategoryName.startsWith("They") ||
                        subcategoryName.includes("focus on") ||
                        subcategoryName.includes("specialize in") ||
                        subcategoryName.includes("known for")) {
                        continue;
                    }
                    
                    // Add as direct child to current category
                    currentCategory.children.push({
                        name: subcategoryName,
                        fullName: subcategoryName,
                        parentName: currentCategory.name,
                        parentFullName: currentCategory.fullName,
                        value: 100 + Math.random() * 200
                    });
                }
                // If we have a category but no subcategories, add as direct child
                else if (currentCategory && line.length > 0 && !line.startsWith(' ')) {
                    // Skip explanatory text
                    if (line.startsWith("These") || 
                        line.startsWith("This") || 
                        line.startsWith("They") ||
                        line.includes("focus on") ||
                        line.includes("specialize in") ||
                        line.includes("known for")) {
                        continue;
                    }
                    
                    currentCategory.children.push({
                        name: line,
                        fullName: line,
                        displayName: line,
                        parentName: currentCategory.name,
                        parentFullName: currentCategory.fullName,
                        value: 100 + Math.random() * 200
                    });
                }
            }
            
            // Ensure all categories have children with values
            root.children.forEach(category => {
                if (category.children.length === 0) {
                    // Instead of adding empty children, just assign a value to make it a leaf node
                    category.value = 300 + Math.random() * 200;
                }
            });
            
            // If no categories were found, create a default one
            if (root.children.length === 0) {
                root.children.push({
                    name: "No Categories Found",
                    value: 500
                });
            }
            
            return root;
        } catch (error) {
            console.error('Error processing data:', error);
            return {
                name: "Error",
                children: [{ 
                    name: "Error", 
                    displayName: "Error Processing Data",
                    value: 100 
                }]
            };
        }
    };

    // Function to handle window resize
    const handleResize = () => {
        if (containerRef.current && svgRef.current) {
            renderChart();
        }
    };

    // Function to render the chart
    const renderChart = () => {
        if (!svgRef.current) return;

        // Clear previous visualization
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Get container dimensions
        const container = d3.select(containerRef.current);
        const width = container.node().getBoundingClientRect().width;
        const height = container.node().getBoundingClientRect().height;

        // Set SVG dimensions
        svg.attr("width", width)
           .attr("height", height);

        // Create tooltip div
        const tooltip = d3.select(containerRef.current)
            .selectAll(".treemap-tooltip")
            .data([0])
            .join("div")
            .attr("class", "treemap-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(255, 255, 255, 0.9)")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "5px")
            .style("pointer-events", "none")
            .style("z-index", "10")
            .style("max-width", "200px")
            .style("text-align", "center");

        // Process data
        const data = processData(queryResponse || "");
        
        // Create hierarchy
        const root = d3.hierarchy(data)
            .sum(d => d.value || 100)
            .sort((a, b) => b.value - a.value);

        // Create treemap layout
        const treemap = d3.treemap()
            .size([width, height])
            .paddingOuter(1)
            .paddingTop(19)
            .paddingRight(1)
            .paddingBottom(1)
            .paddingInner(1)
            .round(true);

        treemap(root);

        // Create dynamic color scales
        // Generate pastel colors using d3's built-in color scales
        const colorScale = d3.scaleOrdinal()
            .domain(root.children ? root.children.map(d => d.data.name) : [])
            .range(d3.quantize(t => {
                // Generate pastel colors by using high lightness values
                return d3.hsl(t * 360, 0.7, 0.85).toString();
            }, root.children ? root.children.length : 10));

        // Function to determine color based on hierarchy position
        const getColor = (d) => {
            if (d.depth === 0) return "#ffffff";
            
            // For main categories (depth 1)
            if (d.depth === 1) {
                return colorScale(d.data.name);
            }
            
            // For subcategories, use a slightly different shade of parent's color
            const parentColor = d3.color(getColor(d.parent));
            return parentColor.brighter(0.2);
        };

        // Create cell groups
        const cell = svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        // Add rectangles
        cell.append("rect")
            .attr("width", d => Math.max(0, d.x1 - d.x0))
            .attr("height", d => Math.max(0, d.y1 - d.y0))
            .attr("fill", d => getColor(d))
            .attr("stroke", "#fff")
            .attr("stroke-width", d => d.depth < 2 ? 2 : 1)
            .style("opacity", d => d.depth === 0 ? 0 : 1)
            .on("mouseover", function(event, d) {
                // Skip root node
                if (d.depth === 0) return;
                
                // Show tooltip on hover with full name
                const fullName = d.data.fullName || d.data.name;
                const parentName = d.data.parentFullName || d.data.parentName || "";
                const tooltipText = parentName ? `${parentName}: ${fullName}` : fullName;
                
                // Position tooltip above the rectangle
                const tooltipX = d.x0 + (d.x1 - d.x0) / 2;
                const tooltipY = d.y0 - 10; // Position above the box
                
                tooltip.html(tooltipText)
                    .style("visibility", "visible")
                    .style("left", (tooltipX) + "px")
                    .style("top", (tooltipY) + "px")
                    .style("transform", "translate(-50%, -100%)"); // Shift up
                
                // Highlight the current cell
                d3.select(this)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 2);
            })
            .on("mouseout", function() {
                // Hide tooltip when mouse leaves
                tooltip.style("visibility", "hidden");
                
                // Remove highlight
                d3.select(this)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", d => d.depth < 2 ? 2 : 1);
            });

        // Add title headers for non-leaf nodes (only depth 1)
        cell.filter(d => d.depth === 1 && d.height > 0)
            .append("rect")
            .attr("y", 0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", 19)
            .attr("fill", d => {
                const baseColor = getColor(d);
                return d3.color(baseColor).darker(0.2);
            })
            .on("mouseover", function(event, d) {
                // Show tooltip on hover with full name
                const tooltipX = d.x0 + (d.x1 - d.x0) / 2;
                const tooltipY = d.y0 - 5; // Position above the header
                
                tooltip.html(d.data.fullName || d.data.name)
                    .style("visibility", "visible")
                    .style("left", (tooltipX) + "px")
                    .style("top", (tooltipY) + "px")
                    .style("transform", "translate(-50%, -100%)"); // Shift up
            })
            .on("mouseout", function() {
                // Hide tooltip when mouse leaves
                tooltip.style("visibility", "hidden");
            });

        // Add labels - only add one text element per cell
        cell.append("text")
            .attr("x", 4)
            .attr("y", d => d.depth === 1 ? 13 : 13) // Position based on whether it's a header
            .attr("font-size", d => d.depth === 1 ? "12px" : "10px")
            .attr("font-weight", d => d.height > 0 ? "bold" : "normal")
            .text(d => {
                if (d.depth === 0) return '';
                
                // For very small cells, don't show text
                if ((d.x1 - d.x0) < 30 || (d.y1 - d.y0) < 20) return '';
                
                // Truncate text based on available width
                const availableWidth = d.x1 - d.x0 - 8;
                const maxLength = Math.floor(availableWidth / 6); // Approximate character width
                
                // Use displayName for leaf nodes, otherwise use name
                const displayText = d.data.displayName || d.data.name;
                return displayText.length > maxLength ? displayText.substring(0, maxLength) + "..." : displayText;
            })
            .attr("fill", d => {
                if (d.depth === 1) return "#000"; // Headers are black text
                
                // For leaf nodes, check background brightness
                if (!d.parent) return "#333";
                const bgColor = getColor(d);
                const rgb = d3.color(bgColor).rgb();
                const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                return brightness > 128 ? "#333" : "#fff";
            })
            .on("mouseover", function(event, d) {
                // Show tooltip on hover with full name
                const fullName = d.data.fullName || d.data.name;
                const parentName = d.data.parentFullName || d.data.parentName || "";
                const tooltipText = parentName ? `${parentName}: ${fullName}` : fullName;
                
                // Position tooltip above the rectangle
                const tooltipX = d.x0 + (d.x1 - d.x0) / 2;
                const tooltipY = d.y0 - 10; // Position above the text
                
                tooltip.html(tooltipText)
                    .style("visibility", "visible")
                    .style("left", (tooltipX) + "px")
                    .style("top", (tooltipY) + "px")
                    .style("transform", "translate(-50%, -100%)"); // Shift up
            })
            .on("mouseout", function() {
                // Hide tooltip when mouse leaves
                tooltip.style("visibility", "hidden");
            });
    };

    useEffect(() => {
        // Add resize event listener
        window.addEventListener('resize', handleResize);
        
        // Initial render
        renderChart();
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            // Remove tooltip when component unmounts
            d3.select(containerRef.current).selectAll(".treemap-tooltip").remove();
        };
    }, [queryResponse]);

    return (
        <div 
            ref={containerRef}
            style={{
                width: '100%',
                height: '400px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <svg 
                ref={svgRef}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
};

export default TreemapChart; 