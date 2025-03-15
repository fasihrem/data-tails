import React, { useState } from "react";
import axios from "axios";
import Navbar from "./navbar";
import Filter from './filter.png';
import Settings from './setting.png';
import "./home.css";

function MyHome() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatStarted, setIsChatStarted] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [openFilters, setOpenFilters] = useState(false);
    const [openCronjob, setOpenCronjob] = useState(false);
    const [isSplitScreen, setIsSplitScreen] = useState(false);

    const [cron, filters] = useState(false);

    const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
    const [selectedOption, setSelectedOption] = useState("");

    const [cronTime, setCronTime] = useState('');
    const [cronInterval, setCronInterval] = useState('');

    const handleCloseHint = () => setShowHint(false);
    const showFilters = () => setOpenFilters(true);
    const showCron = () => setOpenCronjob(true);
    const handleChange = (event) => setSelectedOption(event.target.value);

    const filterSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOption) {
            alert("Please select an option before submitting.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/setFilter", {
                selectedOption: selectedOption,
            });

            alert(`Server Response: ${response.data.message}`);
            filters(true);
        } catch (error) {
            alert("Failed to submit data. Please try again.");
        }

        setOpenFilters(false);
    };

    const cronSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/setCronjob", {
                cronInterval: cronInterval,
                cronTime: cronTime,
            });
            alert(`Server Response: ${response.data.message}`);
            cron(true);
        } catch (error) {
            alert("Failed to submit data. Please try again.");
        }

        setOpenCronjob(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return;
        setIsChatStarted(true);
        setIsSplitScreen(true);

        setMessages(prev => [...prev, { text: input, type: "user" }]);

        // if(!filters()){
        //     alert("select subreddit before submitting a query")
        //     return;
        // }

        try {
            const res = await axios.post('http://localhost:5000/api/chatInput', { message: input });
            setMessages(prev => [...prev, { text: res.data.response, type: "bot" }]);
        }
        catch (error) {
            setMessages(prev => [...prev, { text: "Error: Could not fetch response.", type: "bot" }]);
        }
        finally {
            setInput("");
        }
    };

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
                        <p>It's looking a <span className="highlight">tad dry</span> in here :(</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyHome;
