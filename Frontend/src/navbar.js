import React from "react";
import "./navbar.css";
import {useNavigate} from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    return (
        <div className="navbar">
            <span className="logo">DataTails™</span>
            <div className="navbar-logo">
                <ul className="navbar-menu">
                    <li>
                        <a href="/">Home</a>
                    </li>
                    <li>
                        <a href="/homepage">Chat</a>
                    </li>
                    <li>
                        <a>About</a>
                    </li>
                </ul>
            </div>
            <div className="login-signup-button">
                <button className="nav-login" onClick={() => navigate('/login')}>Login</button>
                <button className="nav-signup" onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
        </div>
    );
}

export default Navbar;
