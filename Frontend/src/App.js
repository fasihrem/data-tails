import './App.css';
import { useNavigate } from 'react-router-dom';
import React, {useState} from "react";
import ScrollToTopButton from "./scroll";
import axios from "axios";
import NavPill from "./navpill";
// import D3 from "./d3";
// import MyThree from "./three";


function App() {
  const navigate = useNavigate();

  return (
    <div>
      <NavPill /> {/* Navbar as u scroll down */}
      <ScrollToTopButton />
      <div className="app-body">
        <div className="App">
          <div className="main-header">
            <div className="header-under">
              <h1>DataTails</h1>
              <p>F24-019 <br /> D-DataTails</p>
            </div>
          </div>
          <div className="login-side">
            <h1>
              <span className="black">Everything,</span>
              <br />
              <span className="white">
                in <span className="highlight">one</span> place.
              </span>
            </h1>
            <button className="login" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="signup" onClick={() => navigate('/signup')}>
              Sign Up
            </button>
            <a className="guest" onClick={() => navigate('/homepage')}>
              Continue as guest?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
