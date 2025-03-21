import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as d3Cloud from "d3-cloud";

const WordCloud = ({ queryResponse }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!queryResponse) return;
        
        // List of common stop words to remove
        const stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 
            'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
            'have', 'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how',
            'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
            'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
            'too', 'very', 'can', 'just', 'should', 'now'
        ]);
        
        const words = queryResponse
            .toLowerCase()
            .split(/\s+/)
            .map(word => word.replace(/[^a-zA-Z0-9]/g, ""))
            .filter(word => 
                word.length > 2 && 
                !stopWords.has(word.toLowerCase())
            );
        
        const wordCounts = words.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
        
        const wordArray = Object.keys(wordCounts)
            .map(word => ({
                text: word,
                size: 8 + wordCounts[word] * 6 // Reduced base size and multiplier
            }));

        // Adjusted dimensions
        const width = 600;
        const height = 400;

        const layout = d3Cloud()
            .size([width, height])
            .words(wordArray)
            .padding(3) // Reduced padding between words
            .rotate(() => (Math.random() > 0.5 ? 0 : 90))
            .fontSize(d => d.size)
            .on("end", draw);

        layout.start();

        function draw(words) {
            d3.select(svgRef.current).selectAll("*").remove();

            const svg = d3.select(svgRef.current)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);

            svg.selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", d => `${d.size}px`)
                .style("font-family", "Arial, sans-serif")
                .style("font-weight", "bold")
                .style("fill", (d, i) => d3.schemeCategory10[i % 10])
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
                .text(d => d.text);
        }
    }, [queryResponse]);

    return (
        <div style={{ 
            width: "100%", 
            height: "400px", // Reduced height
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
            <svg 
                ref={svgRef} 
                style={{ 
                    width: "100%", 
                    height: "100%",
                    transform: "scale(0.9)" // Added slight scale down
                }} 
            />
        </div>
    );
};

export default WordCloud;
