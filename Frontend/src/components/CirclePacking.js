import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CirclePacking = ({ queryResponse }) => {
    const svgRef = useRef(null);

    const parseResponseToHierarchy = (response) => {
        console.log("Starting to parse response:", response);

        try {
            if (!response) {
                console.warn("Empty response received");
                return null;
            }

            // Convert response to string if it's not already
            const text = typeof response === 'string' ? response : JSON.stringify(response);

            // Look at the actual categories/children in the data to determine the domain
            const mainCategories = [];
            const categoryMatches = text.match(/\*\*(.*?)\*\*|^\d+\.\s*([^:]+):|"([^"]+)"/g);
            
            if (categoryMatches) {
                categoryMatches.forEach(match => {
                    const category = match.replace(/\*\*|\d+\.|"|:/g, '').trim();
                    if (category) mainCategories.push(category);
                });
            }

            // Determine root name based on the common theme of categories
            let rootName = "";
            if (mainCategories.length > 0) {
                if (mainCategories.some(cat => /football|cricket|hockey|tennis|sport/i.test(cat))) {
                    rootName = "";
                } else if (mainCategories.some(cat => /data|machine learning|AI/i.test(cat))) {
                    rootName = "";
                } else {
                    // Use the domain that best describes the categories
                    rootName = "";
                }
            }

            const root = {
                name: rootName,
                children: []
            };

            // Split into main sections (looking for patterns like ** Title ** or numbered sections)
            const mainSections = text.split(/(?=\*\*[^*]+\*\*|\d+\.)/g)
                .map(section => section.trim())
                .filter(Boolean);

            // Process remaining sections as children
            mainSections.forEach(section => {
                // Try to extract category name and content
                let categoryName, content;

                // Check for **Title** pattern
                const titleMatch = section.match(/\*\*([^*]+)\*\*/);
                if (titleMatch) {
                    categoryName = titleMatch[1].trim();
                    content = section.replace(/\*\*[^*]+\*\*/, '').trim();
                } else {
                    // Check for numbered pattern (e.g., "1. Title:")
                    const numberedMatch = section.match(/^\d+\.\s*([^:]+):/);
                    if (numberedMatch) {
                        categoryName = numberedMatch[1].trim();
                        content = section.replace(/^\d+\.\s*[^:]+:/, '').trim();
                    } else {
                        // Use the whole section as content if no clear title
                        content = section.trim();
                    }
                }

                if (categoryName) {
                    const category = {
                        name: categoryName,
                        children: []
                    };

                    // Look for items in parentheses or after "such as" or "including"
                    const itemMatches = content.match(/\((.*?)\)|\b(?:such as|including|like)\s+([^.]+)/g);
                    
                    if (itemMatches) {
                        itemMatches.forEach(match => {
                            const items = match
                                .replace(/^\(|\)$|\b(?:such as|including|like)\s+/g, '')
                                .split(/,\s*|\sand\s/)
                                .map(item => item.trim())
                                .filter(Boolean);

                            items.forEach(item => {
                                category.children.push({
                                    name: item,
                                    value: 1
                                });
                            });
                        });
                    }

                    // If no items found but we have content, add it as a single item
                    if (category.children.length === 0 && content) {
                        category.value = 1;
                    }

                    // Only add categories that have content
                    if (category.children.length > 0 || category.value) {
                        root.children.push(category);
                    }
                }
            });

            // If no categories were created, try to parse the whole text as one category
            if (root.children.length === 0) {
                root.children.push({
                    name: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
                    value: 1
                });
            }

            console.log("Parsed data with root:", root);
            return root;

        } catch (error) {
            console.error("Error parsing response:", error);
            return {
                name: "Overview",
                children: [{
                    name: String(response).substring(0, 100),
                    value: 1
                }]
            };
        }
    };

    useEffect(() => {
        // Debug log to check incoming data
        console.log("Raw query response:", queryResponse);

        // Remove any existing tooltips
        d3.select('body').selectAll('.tooltip').remove();
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('padding', '8px')
            .style('background', 'white')
            .style('border', '1px solid #ddd')
            .style('border-radius', '4px')
            .style('pointer-events', 'none')
            .style('font-size', '12px')
            .style('opacity', 0)
            .style('z-index', 1000);

        const createCirclePacking = (data) => {
            const width = 800;
            const height = 800;

            // Clear previous visualization
            d3.select(svgRef.current).selectAll("*").remove();

            // Create SVG
            const svg = d3.select(svgRef.current)
                .attr("viewBox", [0, 0, width, height])
                .attr("font-family", "Arial, sans-serif")
                .style("background", "#fff")
                .style("margin", "auto")
                .style("display", "block");

            // Create hierarchical layout with increased padding for parent circles
            const hierarchy = d3.hierarchy(data)
                .sum(d => d.value || 0)
                .sort((a, b) => b.value - a.value);

            const pack = d3.pack()
                .size([width - 40, height - 40])
                .padding(d => d.depth === 1 ? 20 : 3); // More padding for main categories

            const root = pack(hierarchy);

            // Create color scale for different categories
            const colorScale = d3.scaleOrdinal()
                .domain(root.children.map(d => d.data.name))
                .range([
                    '#FF6B6B',  // Coral Red
                    '#4ECDC4',  // Turquoise
                    '#45B7D1',  // Sky Blue
                    '#96CEB4',  // Sage Green
                    '#FFEEAD',  // Soft Yellow
                    '#D4A5A5',  // Dusty Rose
                    '#9B5DE5',  // Purple
                    '#00BBF9',  // Bright Blue
                    '#00F5D4',  // Mint
                    '#FEE440',  // Yellow
                    '#F15BB5',  // Pink
                    '#FB5607',  // Orange
                ]);

            // Create container with padding
            const container = svg.append("g")
                .attr("transform", `translate(20, 20)`);

            // Add circles
            const node = container.selectAll("g")
                .data(root.descendants())
                .join("g")
                .attr("transform", d => `translate(${d.x},${d.y})`);

            // Define a more colorful gradient for the root circle
            const gradient = svg.append("defs")
                .append("radialGradient")
                .attr("id", "rootGradient");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#E8F3FF") // Light blue tint
                .attr("stop-opacity", 0.9);

            gradient.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "#F0F7FF") // Slightly different blue tint
                .attr("stop-opacity", 0.7);

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#F8FBFF") // Very light blue
                .attr("stop-opacity", 0.5);

            // Update the circle elements
            node.append("circle")
                .attr("r", d => d.r)
                .attr("fill", d => {
                    if (d.depth === 0) return "url(#rootGradient)"; // Use new gradient for root
                    if (d.depth === 1) return colorScale(d.data.name);
                    return d3.color(colorScale(d.parent.data.name)).brighter(0.2);
                })
                .attr("stroke", d => d.depth === 0 ? "#B8D8FF" : "#fff") // Light blue stroke for root
                .attr("stroke-width", d => d.depth === 0 ? 2 : d.depth === 1 ? 2 : 1)
                .style("opacity", d => {
                    if (d.depth === 0) return 1;
                    if (d.depth === 1) return 0.85;
                    return 0.75;
                })
                .style("filter", d => d.depth === 0 ? "drop-shadow(0 0 15px rgba(184, 216, 255, 0.3))" : "none") // Blue-tinted shadow
                .style("transition", "all 0.3s ease");

            // Update root category label style
            node.filter(d => d.depth === 0)
                .append("text")
                .attr("class", "root-category-label")
                .attr("text-anchor", "middle")
                .attr("y", d => -d.r + 30)
                .style("font-family", "Arial, sans-serif")
                .style("font-size", "24px")
                .style("fill", "#2B4C7E")
                .style("font-weight", "bold")
                .style("text-shadow", "1px 1px 2px rgba(43, 76, 126, 0.1)")
                .text(d => d.data.name);

            // Add labels for main categories (top-level hierarchy)
            node.filter(d => d.depth === 1)
                .append("text")
                .attr("class", "main-category-label")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("dy", d => -d.r + 20) // Position at top of circle
                .style("font-family", "Arial, sans-serif")
                .style("font-size", d => `${Math.min(d.r / 4, 18)}px`)
                .style("fill", d => d3.color(colorScale(d.data.name)).darker(0.5))
                .style("font-weight", "bold")
                .style("pointer-events", "none")
                .text(d => d.data.name);

            // Add smaller labels for subcategories
            node.filter(d => d.depth > 1 && d.r > 15)
                .append("text")
                .attr("class", "subcategory-label")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-family", "Arial, sans-serif")
                .style("font-size", d => `${Math.min(d.r / 3, 12)}px`)
                .style("fill", "#333")
                .style("pointer-events", "none")
                .text(d => d.data.name);

            // Enhanced hover effects
            node.on("mouseover", function(event, d) {
                if (d.depth === 0) return;

                // Highlight current circle
                d3.select(this).select("circle")
                    .style("stroke", "#000")
                    .style("stroke-width", 2);

                // Show tooltip with full hierarchy path
                const hierarchyPath = getHierarchyPath(d);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                
                tooltip.html(hierarchyPath)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .style("background", "rgba(255, 255, 255, 0.95)")
                    .style("box-shadow", "0 2px 8px rgba(0, 0, 0, 0.15)")
                    .style("border", "none")
                    .style("padding", "10px 15px")
                    .style("border-radius", "6px")
                    .style("font-family", "Arial, sans-serif")
                    .style("font-size", "14px")
                    .style("font-weight", "500")
                    .style("color", "#495057");
            })
            .on("mouseout", function(event, d) {
                if (d.depth === 0) return;

                // Reset circle style
                d3.select(this).select("circle")
                    .style("stroke", "#fff")
                    .style("stroke-width", d.depth === 1 ? 2 : 1);

                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        };

        // Process and create visualization
        if (queryResponse) {
            const hierarchicalData = parseResponseToHierarchy(queryResponse);
            console.log("Processed hierarchical data:", hierarchicalData);
            if (hierarchicalData && hierarchicalData.children && hierarchicalData.children.length > 0) {
                createCirclePacking(hierarchicalData);
            } else {
                console.warn("No valid hierarchical data to visualize");
            }
        }

        return () => {
            d3.select('body').selectAll('.tooltip').remove();
        };
    }, [queryResponse]);

    // Helper function to get the full hierarchy path
    const getHierarchyPath = (node) => {
        const path = [];
        let current = node;
        while (current.parent && current.depth > 0) {
            path.unshift(current.data.name);
            current = current.parent;
        }
        return path.join(" > ");
    };

    return (
        <div style={{
            width: '100%',
            height: '800px', // Increased height
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            <svg
                ref={svgRef}
                style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '800px',
                    maxHeight: '800px'
                }}
            />
        </div>
    );
};

export default CirclePacking;