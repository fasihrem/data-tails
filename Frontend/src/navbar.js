import React from "react";
import "./navbar.css";
import {useNavigate} from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getAuth, signOut } from "firebase/auth";
import Logout from "./logout.png"
import Settings from "./setting.png"

function Navbar() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleLogout = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            navigate("/login"); // Redirect to login page after logout
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    };

    const handleSettings = () => {
        navigate("/setting");
    }

    return (
        <div>
            <div className="navbar">
                <span className="logo"><a href="/">DataTails</a></span>
                {/*™*/}
                <div className="navbar-logo">
                    <ul className="navbar-menu">
                        {/*<li>*/}
                        {/*    <a href="/">Home</a>*/}
                        {/*</li>*/}
                        <li>
                            <a href="/homepage">Chat</a>
                        </li>
                        <li>
                            <a href="/price">Pricing</a>
                        </li>
                    </ul>
                </div>

                <div className="user-auth-section">
                    {user ? (
                        // Show user email and logout button if logged in
                        <div className="logout-settings-button">
                            <span className="user-name">Welcome, {user.displayName || user.email}</span>
                            <button className="nav-logout" onClick={handleLogout}>
                                <img src={Logout} alt="logout logo"/>
                            </button>
                            <button className="nav-logout" onClick={handleSettings}>
                                <img src={Settings} alt="settings logo"/>
                            </button>
                        </div>
                    ) : (
                        // Show Login/Signup buttons if not logged in
                        <div className="login-signup-button">
                            <button className="nav-login" onClick={() => navigate('/login')}>Login</button>
                            <button className="nav-signup" onClick={() => navigate('/signup')}>Sign Up</button>
                        </div>
                    )
                    }
                </div>

            </div>
        </div>
    );
}

export default Navbar;
