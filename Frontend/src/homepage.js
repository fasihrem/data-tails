import './home.css';
import Navbar from "./navbar";
import {useState} from "react";
import axios from "axios";
import Filter from './filter.png';
import Settings from './setting.png';
import Graph from './chart.png';
import {useNavigate} from "react-router-dom";
// import { useAuth } from "./AuthContext";

function MyHome() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isChatStarted, setIsChatStarted] = useState(false);
    // const [isVisible, setIsVisible] = useState(false);
    const [showHint, setShowHint] = useState(true); // State for the hint box
    const [openFilters, setOpenFilters] = useState(false);
    const [openCronjob, setOpenCronjob] = useState(false);
    // const navigate = useNavigate();
    // const { user } = useAuth();

    const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
    const [selectedOption, setSelectedOption] = useState("");

    const [cronTime, setCronTime] = useState('');
    const [cronInterval, setCronInterval] = useState('');

    const handleCloseHint = () => {
        setShowHint(false); // Hide hint box when user clicks close
    };

    const showFilters = () => {
        setOpenFilters(true);
    }

    const showCron = () => {
        setOpenCronjob(true);
    }

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const filterSubmit = async (e) => {
        e.preventDefault();

        if (!selectedOption) {
            alert("Please select an option before submitting.");
            return;
        }
        else {
            alert(`You selected: ${selectedOption}`);
        }

        try {
            const response = await axios.post("http://localhost:5000/api/setFilter", {
                selectedOption: selectedOption,
            });

            console.log("Response from server:", response.data);
            alert(`Server Response: ${response.data.message}`);
        }
        catch (error) {
            console.error("Error sending data to server:", error);
            alert("Failed to submit data. Please try again.");
        }

        setOpenFilters(false);
        console.log("Filter pressed");
    };

    const cronSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/setCronjob", {
                cronInterval: cronInterval,
                cronTime: cronTime,
            });

            console.log("Response from server:", response.data);
            alert(`Server Response: ${response.data.message}`);
        }
        catch (error) {
            console.error("Error sending data to server:", error);
            alert("Failed to submit data. Please try again.");
        }

        setOpenCronjob(false);
        console.log("cron pressed");
    };

    // const graphSubmit = async (e) => {
    //     e.preventDefault();
    //     navigate('/viz');
    //     console.log("Viz pressed");
    // };

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

            {openFilters && (
                <div className="hint-box">
                    <form style={{padding: "20px", maxWidth: "300px"}} onSubmit={filterSubmit}>
                        <label htmlFor="dropdown">Choose an option:</label>
                        <select id="dropdown" value={selectedOption} onChange={handleChange} required>
                            <option value="" disabled>Select an option</option>
                            {options.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                        <br/><br/>
                        <button onClick={filterSubmit}>Submit</button>
                    </form>
                </div>
            )}

            {openCronjob && (
                <div className="hint-box">
                    <form style={{padding: "20px", maxWidth: "300px"}} onSubmit={cronSubmit}>
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
                        <button onClick={cronSubmit}>Submit</button>
                    </form>
                </div>
            )}

            <div className={`chat-container ${isChatStarted ? "chat-started" : ""}`}>
                {!isChatStarted && (
                    <div className="start-text">
                        <div className="extra-buttons">
                            <div className="filter-button" onClick={showFilters}>
                                <img src={Filter} alt="filter logo"/>
                            </div>
                            {/*<div className="viz-button" onClick={graphSubmit}>*/}
                            {/*    <img src={Graph} alt="graph logo"/>*/}
                            {/*</div>*/}
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
