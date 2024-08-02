import React from "react";
import "./navbar.css";

function Navbar() {
    return (
        <div className = "navbar">
            <div className="navbar-logo"></div>
            <ul className = "navbar-menu">
                <li>
                    <a href="/">Home</a>
                    <a href="/d3">D3 Bar Chart</a>
                </li>
            </ul>
        </div>
    )
}

export default Navbar