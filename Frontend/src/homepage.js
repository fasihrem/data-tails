import './home.css';
import Navbar from "./navbar";
import { useState } from "react";
import axios from "axios";
import Filter from './filter.png';
import Settings from './setting.png';
import Graph from './chart.png';
import Visualization from './components/SunburstChart';
import CirclePacking from './components/CirclePacking';
import TreeDiagram from './components/TreeDiagram';
import DonutChart from './components/DonutChart';
import MosaicPlot from './components/MosaicPlot';
import PolarArea from './components/PolarArea';
import BarChart from './components/BarChart';
import LineChart from './components/LineChart';
import WordCloud from './components/WordCloud';
import ChordDiagram from './components/ChordDiagram';
import NetworkGraph from './components/NetworkGraph';
import TreemapChart from './components/TreemapChart';
import HeatmapChart from './components/HeatmapChart';
import ConnectionMap from './components/ConnectionMap';
import SmallMultiples from './components/SmallMultiples';
import VoronoiMap from './components/VoronoiMap';
import AreaChart from './components/AreaChart';
import StackedChart from './components/StackedAreaChart';
import DAGGraph from './components/DAG';



function MyHome() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatStarted, setIsChatStarted] = useState(false); // Track chat start
    const [showVisualization, setShowVisualization] = useState(false);
    const [visualizationType, setVisualizationType] = useState('sunburst'); // Update possible values
    const [selectedViz, setSelectedViz] = useState(null);
    const [availableCharts, setAvailableCharts] = useState([]);

    const filterSubmit = async (e) => {
        e.preventDefault();
        console.log("filter pressed");
    };

    const cronSubmit = async (e) => {
        e.preventDefault();
        console.log("cronjob pressed");
    };

    // Optional: cycle through multiple visualization types on button press
    const graphSubmit = async (e) => {
        e.preventDefault();
        setShowVisualization(!showVisualization);
        setVisualizationType(prev => {
            if (prev === 'sunburst') return 'circlePacking';
            if (prev === 'circlePacking') return 'tree';
            if (prev === 'tree') return 'donut';
            if (prev === 'donut') return 'mosaic';
            if (prev === 'mosaic') return 'polar';
            if (prev === 'polar') return 'bar';
            if (prev === 'bar') return 'line';
            if (prev === 'line') return 'wordcloud';
            if (prev === 'wordcloud') return 'chord';
            if (prev === 'chord') return 'networkGraph';
            if (prev === 'networkGraph') return 'treemap';
            if (prev === 'treemap') return 'heatmap';
            if (prev === 'heatmap') return 'connectionMap';
            if (prev === 'connectionMap') return 'smallMultiples';
            if (prev === 'smallMultiples') return 'voronoi';
            if (prev === 'voronoi') return 'area';
            if (prev === 'area') return 'stacked';
            if (prev === 'stacked') return 'dag';
            return 'sunburst';
        });
        console.log("viz pressed");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return;
        setIsChatStarted(true);

        const userMessage = { text: input, type: "user" };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const res = await axios.post('http://localhost:5000/api/chatInput', {
                message: input,
            });
            const botMessage = { text: res.data.response, type: "bot" };
            setMessages((prev) => [...prev, botMessage]);
            
            // If there are visualization recommendations, automatically show the best one
            if (res.data.visualizations && res.data.visualizations.length > 0) {
                const [bestChart] = res.data.visualizations[0]; // Get the highest scored chart
                setVisualizationType(bestChart);
                setShowVisualization(true); // Automatically show visualization
            }
        } catch (error) {
            console.error("Error sending to Flask,", error);
            const errorMessage = { text: "Error: Could not fetch response.", type: "bot" };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setInput("");
        }
    };

    return (
        <div className="ai-page">
            <Navbar />
            {messages.length > 0 && (
                <button
                    className="show-viz-button"
                    onClick={() => setShowVisualization(!showVisualization)}
                >
                    {showVisualization ? 'Hide Visualization' : 'Show Visualization'}
                </button>
            )}
            <div className={`chat-container ${isChatStarted ? "chat-started" : ""}`}>
                {!isChatStarted && (
                    <div className="start-text">
                        <div className="extra-buttons">
                            <div className="filter-button" onClick={filterSubmit}>
                                <img src={Filter} alt="filter logo"/>
                            </div>
                            <div className="filter-button" onClick={graphSubmit}>
                                <img src={Graph} alt="visualization logo"/>
                            </div>
                            <div className="filter-button" onClick={cronSubmit}>
                                <img src={Settings} alt="settings logo"/>
                            </div>
                        </div>
                        <h1 className="home-start-text">
                            <span className="purp">Hello!</span>
                            <br/>
                            <span className="green">
                                How can I be of
                                <span className="highlight">service today?</span>
                            </span>
                        </h1>
                    </div>
                )}
                <div className="messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.type === "user" ? "user" : "bot"}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                {showVisualization && messages.length > 0 && (
                    <div className="visualization-wrapper">
                        {/* Visualization Switch Cases */}
                        {visualizationType === 'sunburst' ? (
                            <Visualization queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'circlePacking' ? (
                            <CirclePacking queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'tree' ? (
                            <TreeDiagram queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'donut' ? (
                            <DonutChart queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'mosaic' ? (
                            <MosaicPlot queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'polar' ? (
                            <PolarArea queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'bar' ? (
                            <BarChart queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'line' ? (
                            <LineChart queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'wordcloud' ? (
                            <WordCloud queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'chord' ? (
                            <ChordDiagram queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'networkGraph' ? (
                            <NetworkGraph queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'treemap' ? (
                            <TreemapChart queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'heatmap' ? (
                            <HeatmapChart queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'connectionMap' ? ( 
                            <ConnectionMap queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'smallMultiple' ? (
                            <SmallMultiples queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'voronoiMap' ? (
                            <VoronoiMap queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'area' ? (
                            <AreaChart queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'stacked' ? (
                            <StackedChart queryResponse={messages[messages.length - 1].text} />
                        ) : visualizationType === 'dag' ? (
                            <DAGGraph queryResponse={messages[messages.length - 1].text} />
                        ) : null}

                        <div className="viz-control">
                            <button className="viz-button" onClick={() => setVisualizationType('sunburst')}>Switch to Sunburst</button>
                            <button className="viz-button" onClick={() => setVisualizationType('circlePacking')}>Switch to Circle Packing</button>
                             <button className="viz-button" onClick={() => setVisualizationType('tree')}>Switch to Tree Diagram</button>
                            <button className="viz-button" onClick={() => setVisualizationType('donut')}>Switch to Donut Chart</button>
                            <button className="viz-button" onClick={() => setVisualizationType('mosaic')}>Switch to Mosaic Plot</button>
                            <button className="viz-button" onClick={() => setVisualizationType('polar')}>Switch to Polar Area</button>
                            <button className="viz-button" onClick={() => setVisualizationType('bar')}>Switch to Bar Chart</button>
                            <button className="viz-button" onClick={() => setVisualizationType('line')}>Switch to Line Chart</button>
                            <button className="viz-button" onClick={() => setVisualizationType('wordcloud')}>Switch to Word Cloud</button>
                            <button className="viz-button" onClick={() => setVisualizationType('chord')}>Switch to Chord Diagram</button>
                            <button className="viz-button" onClick={() => setVisualizationType('networkGraph')}>Switch to Network Graph</button>
                            <button className="viz-button" onClick={() => setVisualizationType('treemap')}>Switch to Treemap Chart</button>
                            <button className="viz-button" onClick={() => setVisualizationType('heatmap')}>Switch To Heatmap</button>
                            <button className="viz-button" onClick={() => setVisualizationType('connectionMap')}>Switch to Connection Map</button>
                            <button className="viz-button" onClick={() => setVisualizationType('smallMultiple')}>Switch to Small Multiple</button>
                            <button className="viz-button" onClick={() => setVisualizationType('voronoiMap')}>Switch to Voronoi Map</button>
                            <button className="viz-button" onClick={() => setVisualizationType('area')}>Switch to Area Chart</button>
                            <button className="viz-button" onClick={() => setVisualizationType('stacked')}>Switch to Stacked area Chart</button>
                            <button className="viz-button" onClick={() => setVisualizationType('dag')}>Switch to DAG</button> 
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={`chat-input-form ${isChatStarted ? "moved" : ""}`}>
                    <input className="chat-text" type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Query here!" />
                    <button type="submit" className="chat-submit">Send</button>
                </form>
            </div>
        </div>
    );
}

export default MyHome;
