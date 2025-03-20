import React, { useState } from "react";
import axios from "axios";
import Navbar from "./navbar";
import Filter from './filter.png';
import Settings from './setting.png';
import "./home.css";
import {useCallback} from "react";

// Import all chart components
import AreaChart from './components/AreaChart';
import BarChart from './components/BarChart';
import ChordDiagram from './components/ChordDiagram';
import CirclePacking from './components/CirclePacking';
import ConnectionMap from './components/ConnectionMap';
import DAG from './components/DAG';
import DonutChart from './components/DonutChart';
import HeatmapChart from './components/HeatmapChart';
import LineChart from './components/LineChart';
import MosaicPlot from './components/MosaicPlot';
import NetworkGraph from './components/NetworkGraph';
import PolarArea from './components/PolarArea';
import SmallMultiples from './components/SmallMultiples';
import StackedAreaChart from './components/StackedAreaChart';
import SunburstChart from './components/SunburstChart';
import TreeDiagram from './components/TreeDiagram';
import TreemapChart from './components/TreemapChart';
import VoronoiMap from './components/VoronoiMap';
import WordCloud from './components/WordCloud';
import barChart from "./components/BarChart";


function MyHome() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    let [isChatStarted, setIsChatStarted] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [openFilters, setOpenFilters] = useState(false);
    const [openCronjob, setOpenCronjob] = useState(false);
    let [isSplitScreen, setIsSplitScreen] = useState(false);


    const [cron, filters] = useState(false);

    const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
    const [selectedOption, setSelectedOption] = useState("");

    const [cronTime, setCronTime] = useState('');
    const [cronInterval, setCronInterval] = useState('');

    const [recommendedCharts, setRecommendedCharts] = useState([]);
    const [showChartDropdown, setShowChartDropdown] = useState(false);

    const [selectedChart, setSelectedChart] = useState(null);
    const [lastBotResponse, setLastBotResponse] = useState(null);

    // Chart component mapping to match backend chart_types
    // const chartComponents = {
    //     'area_chart': AreaChart,
    //     'bar_chart': BarChart,
    //     'chord_diagram': ChordDiagram,
    //     'circle_packing': CirclePacking,
    //     'connection_map': ConnectionMap,
    //     'DAG': DAG,
    //     'donut_chart': DonutChart,
    //     'heatmap_chart': HeatmapChart,
    //     'line_chart': LineChart,
    //     'mosaic_plot': MosaicPlot,
    //     'network_graph': NetworkGraph,
    //     'polar_area': PolarArea,
    //     'small_multiples': SmallMultiples,
    //     'stacked_area_chart': StackedAreaChart,
    //     'sunburst_chart': SunburstChart,
    //     'tree_diagram': TreeDiagram,
    //     'treemap_chart': TreemapChart,
    //     'voronoi_map': VoronoiMap,
    //     'word_cloud': WordCloud
    // };

    // // Chart descriptions for tooltips
    // const chartDescriptions = {
    //     'area_chart': "Shows cumulative data trends with a filled area.",
    //     'bar_chart': "Used for comparing categories or ranking values.",
    //     'chord_diagram': "Best for visualizing relationships and interactions.",
    //     'circle_packing': "Represents hierarchical relationships in a compact form.",
    //     'connection_map': "Visualizes spatial relationships and geographic data.",
    //     'DAG': "Shows directed relationships, commonly used for processes or networks.",
    //     'donut_chart': "A variation of the pie chart, highlighting proportions.",
    //     'heatmap_chart': "Displays intensity values in a matrix format.",
    //     'line_chart': "Best for showing trends over time or sequential data.",
    //     'mosaic_plot': "Used to show the relationship between categorical variables.",
    //     'network_graph': "Illustrates complex relationships in networks.",
    //     'polar_area': "Represents cyclic data with proportionally scaled segments.",
    //     'small_multiples': "Facilitates comparisons across multiple categories.",
    //     'stacked_area_chart': "Shows part-to-whole relationships over time.",
    //     'sunburst_chart': "Depicts hierarchical data as concentric layers.",
    //     'tree_diagram': "Illustrates hierarchical relationships in tree structure.",
    //     'treemap_chart': "Depicts hierarchical structures using nested rectangles.",
    //     'voronoi_map': "Divides spatial regions based on distance.",
    //     'word_cloud': "Highlights the most frequent words in text data."
    // };

    const handleCloseHint = () => setShowHint(false);
    const showFilters = () => setOpenFilters(true);
    const showCron = () => setOpenCronjob(true);
    const handleChange = (event) => setSelectedOption(event.target.value);

    const filterSubmit = async (e) => {
    e.preventDefault(); // Ensures page doesn't refresh
    if (!selectedOption) {
        alert("Please select an option before submitting.");
        return;
    }

    try {
        const response = await axios.post("http://localhost:5000/api/setFilter", {
            selectedOption: selectedOption,
        });

        alert("Server Response:", response.data.message);
        filters(true);
    } catch (error) {
        alert("Failed to submit data. Please try again.");
    }

    setOpenFilters(false);
};

const cronSubmit = async (e) => {
    e.preventDefault(); // Ensures page doesn't refresh
    try {
        const response = await axios.post("http://localhost:5000/api/setCronjob", {
            cronInterval: cronInterval,
            cronTime: cronTime,
        });
        alert("Server Response:", response.data.message);
        cron(true);
    } catch (error) {
        alert("Failed to submit data. Please try again.");
    }

    setOpenCronjob(false);
};


    let vizs = "";
    let barCharts = "";


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return;
        setIsChatStarted(true);
        setIsSplitScreen(true);

        setMessages(prev => [...prev, { text: input, type: "user" }]);

        try {
            const res = await axios.post('http://localhost:5000/api/chatInput', { message: input });
            console.log("Full response:", res.data);

            // Store the bot's response
            setLastBotResponse(res.data.response);
            setMessages(prev => [...prev, { text: res.data.response, type: "bot" }]);

            setTimeout(function() {
                }, 1000);

            if (res.data.vizs && Array.isArray(res.data.vizs)) {
                console.log("Available charts:", res.data.vizs);
                setRecommendedCharts(res.data.vizs.map(viz => viz[0]));
            }

            vizs = res.data.viz_data;
            console.log("data for visualisations:")
            console.log(vizs);

            console.log("type: ", typeof vizs);

            barCharts = vizs.bar_chart.data || [];
            console.log("data for bar charts");
            console.log(barCharts);

        }
        catch (error) {
            console.error("Error in handleSubmit:", error);
            setMessages(prev => [...prev, { text: "Error: Could not fetch response.", type: "bot" }]);
        }
        finally {
            setInput("");
        }
    };

    // Also add a useEffect to monitor recommendedCharts changes
    // useEffect(() => {
    //     console.log("Updated recommended charts:", recommendedCharts);
    // }, [recommendedCharts]);

    const handleChartSelection = useCallback((chartType) => {
    if (chartType !== selectedChart) {
        console.log(`Selected chart: ${chartType}`);
        setSelectedChart(chartType);
        }
    }, [selectedChart]);

    return (
        <div className="ai-page">
            <Navbar />

            <div className={`container ${isSplitScreen ? "split-screen" : ""}`}>
                {/* Left Pane - Chat Interface */}
                <div className="chat-pane">
                    {/* Hint Box */}
                    {showHint && (
                        <div className="hint-box">
                            <p> 💡<b>How to use the chatbot</b></p>
                            <ul>
                                <li>Click on the Filter option <img src={Filter} className="hint-button" alt="filter logo" /></li>
                                <li>Choose your desired SubReddit and containing topic.</li>
                                <li>Now you can continue with your Query!</li>
                            </ul>
                            <button className="close-hint" onClick={handleCloseHint}>Got it!</button>
                        </div>
                    )}

                    {/* Filter Popup */}
                    {openFilters && (
                        <div className="hint-box">
                            <form onSubmit={filterSubmit}>
                                <label htmlFor="dropdown">Choose an option:</label>
                                <select id="dropdown" value={selectedOption} onChange={handleChange} required>
                                    <option value="" disabled>Select an option</option>
                                    {options.map((option, index) => (
                                        <option key={index} value={option}>{option}</option>
                                    ))}
                                </select>
                                <br/><br/>
                                <button type="submit">Submit</button>
                            </form>
                        </div>
                    )}

                    {/* Cronjob Popup */}
                    {openCronjob && (
                        <div className="hint-box">
                            <form onSubmit={cronSubmit}>
                                <input
                                    type="number"
                                    placeholder="Start Time"
                                    value={cronTime}
                                    onChange={(e) => setCronTime(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Interval duration"
                                    value={cronInterval}
                                    onChange={(e) => setCronInterval(e.target.value)}
                                />
                                <button type="submit">Submit</button>
                            </form>
                        </div>
                    )}

                    {/* Start Text */}
                    {!isChatStarted && (
                        <div className="start-text">
                            <div className="extra-buttons">
                                <div className="filter-button" onClick={showFilters}>
                                    <img src={Filter} alt="filter logo"/>
                                </div>
                                <div className="cron-button" onClick={showCron}>
                                    <img src={Settings} alt="settings logo"/>
                                </div>
                            </div>
                            <h1 className="home-start-text">
                                <span className="purp">Hello!</span>
                                <br/>
                                <span className="green">
                                    How can I be of
                                    <span className="highlight"> service today?</span>
                                </span>
                            </h1>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type === "user" ? "user" : "bot"}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSubmit} className="chat-form">
                        <input
                            className="chat-text"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Query here!"
                        />
                        <button type="submit" className="chat-button">Send</button>
                    </form>
                </div>

                {/* Right Pane - Empty for Now */}
                {isSplitScreen && (
                    <div className="visual-pane">
                        <div className="chart-selector">
                            <button
                                className="chart-dropdown-button"
                                onClick={() => {
                                    console.log("Current bot response:", lastBotResponse); // Debug log
                                    setShowChartDropdown(!showChartDropdown);
                                }}
                            >
                                + Add Chart
                            </button>

                            {showChartDropdown && recommendedCharts.length > 0 && (
                                <div className="chart-dropdown-menu">
                                    {recommendedCharts.map((chart, index) => (
                                        <button
                                            key={index}
                                            className="chart-option"
                                            onClick={() => handleChartSelection(chart)}
                                        >
                                            {chart.split('_')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chart display area */}
                        <div className="chart-container">
                            {selectedChart && (
                                <div className="chart-wrapper">
                                    {selectedChart === 'bar_chart' && (
                                        <BarChart
                                        data={barCharts}/>
                                    )}
                                    {/*{selectedChart === 'line_chart' && (*/}
                                    {/*    <LineChart*/}
                                    {/*        queryResponse={lastBotResponse}*/}
                                    {/*        title="Data Visualization"*/}
                                    {/*    />*/}
                                    {/*)}*/}
                                    {/*{selectedChart === 'DAG' && (*/}
                                    {/*    <DAG*/}
                                    {/*        queryResponse={lastBotResponse}*/}
                                    {/*        title="Data Visualisation"*/}
                                    {/*    />*/}
                                    {/*)}*/}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyHome;
