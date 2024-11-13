import './home.css';
import Navbar from "./navbar";

function MyHome() {


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

        <input type="text" placeholder="Query Here!"></input>
    </div>
  );
}

export default MyHome