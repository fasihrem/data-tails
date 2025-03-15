import React, { useState } from "react";
import Navbar from "./navbar";
import "./dual.css";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isSplitScreen, setIsSplitScreen] = useState(false);

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setResponse(`You asked: "${query}"`); // Mock response
    setIsSplitScreen(true);
    setQuery("");
  };

  return (
    <div>
      <Navbar />
      <div className={`container ${isSplitScreen ? "split-screen" : ""}`}>
        {/* Left Pane - Chat Interface */}
        <div className="chat-pane">
          <h1 className="title">
            <span className="hello">Hello!</span> How can I be of <span className="highlight">service today?</span>
          </h1>

          <div className="chat-box">
            {response ? <p className="bot-msg">{response}</p> : <p className="empty-message">Ask me something!</p>}
          </div>

          <form onSubmit={handleQuerySubmit} className="chat-form">
            <input
              type="text"
              placeholder="Query here!"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="chat-button">🔍</button>
          </form>
        </div>

        {/* Right Pane - Empty for now */}
        {isSplitScreen && (
          <div className="visual-pane">
            <p>It's looking a <span className="highlight">tad dry</span> in here :(</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
