import './home.css';
import Navbar from "./navbar";
import {useState} from "react";
import axios from "axios";

function MyHome() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/chatInput', {
        message: input,
      });
      setResponse(res.data.response);
    }
    catch (error) {
      console.error("error sending to flask,", error);
    }
  };


  return (
    <div className="ai-page">
        <Navbar/>
        <div className="start-text">
            <h1 className="home-start-text">
                <span className="purp">
                    Hello!
                </span>
                <br></br>
                <span className="green">
                    How can I be of
                    <span className="highlight">
                        service today?
                    </span>
                </span>
            </h1>
        </div>

        <form onSubmit={handleSubmit}>
            <input
                className="chat-text"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query Here!"/>
        </form>
        {response && <p>Response: {response}</p>}
    </div>
  );
}

export default MyHome