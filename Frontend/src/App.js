import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Three from "./three";
import ScrollToTopButton from "./scroll";

function App() {
    const navigate = useNavigate();

  return (
      <div className="app-body">
          {/*<Three/>*/}
          <ScrollToTopButton/>
    <div className="App">
        <div className="main-header">
            <div className="header-under">
                <h1>DataTails</h1>
                <p>F24-019 <br></br>D-DataTails</p>
            </div>
        </div>

        <div className="login-side">
            <h1><span className="black">Everything,</span><br></br><span className="white"> in <span
                className="highlight">one</span> place.</span></h1>
            {/*<input type="text" placeholder="Login with email"></input>*/}
            <button className="login" onClick={() => navigate('/login')}>Login</button>
            <button className="signup" onClick={() => navigate('/signup')}>Sign Up</button>
            <a className="guest" onClick={() => navigate('/homepage')}>Continue as guest?</a>
        </div>
    </div>
          </div>
  );
}

export default App;
