import './home.css';
import Navbar from "./navbar";
import { useState } from "react";
import axios from "axios";
import Filter from './filter.png';
import Settings from './setting.png';
import Graph from './chart.png';

function MyHome() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatStarted, setIsChatStarted] = useState(false); // Track chat start

    const filterSubmit = async (e) => {
        e.preventDefault();

        console.log("filter pressed")
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim() === "") return; // Prevent empty submissions
        setIsChatStarted(true); // Trigger input box to move down

        const userMessage = { text: input, type: "user" };
        setMessages((prev) => [...prev, userMessage]); // Add user message

        try {
            const res = await axios.post('http://localhost:5000/api/chatInput', {
                message: input,
            });
            const botMessage = { text: res.data.response, type: "bot" };
            setMessages((prev) => [...prev, botMessage]); // Add bot response
        } catch (error) {
            console.error("Error sending to Flask,", error);
            const errorMessage = { text: "Error: Could not fetch response.", type: "bot" };
            setMessages((prev) => [...prev, errorMessage]); // Add error response
        } finally {
            setInput(""); // Clear input
        }
    };

    return (
        <div className="ai-page">
            <Navbar />
            <div className={`chat-container ${isChatStarted ? "chat-started" : ""}`}>
                {!isChatStarted && (
                    <div className="start-text">
                        <div className="extra-buttons">
                            <div className="filter-button" onClick={filterSubmit}>
                                <img src={Filter} alt="filter logo"/>
                            </div>
                            <div className="filter-button" onClick={filterSubmit}>
                                <img src={Graph} alt="filter logo"/>
                            </div>
                            <div className="filter-button" onClick={filterSubmit}>
                                <img src={Settings} alt="filter logo"/>
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
