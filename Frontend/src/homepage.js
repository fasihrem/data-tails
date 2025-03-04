import './home.css';
import Navbar from "./navbar";
import {useEffect, useState} from "react";
import axios from "axios";
import Filter from './filter.png';
import Settings from './setting.png';
import Graph from './chart.png';
import {useNavigate} from "react-router-dom";
import { useAuth } from "./AuthContext";

function MyHome() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatStarted, setIsChatStarted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showHint, setShowHint] = useState(true); // State for the hint box
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCloseHint = () => {
        setShowHint(false); // Hide hint box when user clicks close
    };

    const filterSubmit = async (e) => {
        e.preventDefault();
        setIsVisible(true);
        console.log("Filter pressed");
    };

    const cronSubmit = async (e) => {
        e.preventDefault();
        console.log("Cronjob pressed");
    };

    const graphSubmit = async (e) => {
        e.preventDefault();
        navigate('/viz');
        console.log("Viz pressed");
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

            {/* Hint Box (Appears when page loads, disappears on click) */}
            {showHint && (
                <div className="hint-box">
                    <p> 💡<b>How to use the chatbot</b></p>
                    <ul>
                        <li>
                            Click on the Filter option.
                            <img src={Filter} className="hint-button" alt="filter logo"/>
                        </li>

                        <li>Choose your desired SubReddit and containing topic.</li>
                        <li>Now you can continue with your Query!</li>
                    </ul>
                    <button className="close-hint" onClick={handleCloseHint}>Got it!</button>
                </div>
            )}

            <div className={`chat-container ${isChatStarted ? "chat-started" : ""}`}>
                {!isChatStarted && (
                    <div className="start-text">
                        <div className="extra-buttons">
                            <div className="filter-button" onClick={filterSubmit}>
                                <img src={Filter} alt="filter logo"/>
                            </div>
                            <div className="viz-button" onClick={graphSubmit}>
                                <img src={Graph} alt="graph logo"/>
                            </div>
                            <div className="cron-button" onClick={cronSubmit}>
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
                <form
                    onSubmit={handleSubmit}
                    className={`chat-input-form ${isChatStarted ? "moved" : ""}`}
                >
                    <input
                        className="chat-text"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Query here!"
                    />
                    <button type="submit" className="chat-submit">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default MyHome;
