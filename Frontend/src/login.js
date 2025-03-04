import Navbar from "./navbar";
import './login.css'
import React, {useRef, useState} from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {useNavigate} from "react-router-dom";

function MyLogin(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Logged in successfully! 🎉");
            navigate('/homepage')
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="complete-page">
            <div className="login-page">
                <Navbar/>
                <div className="login-box">
                    <h1 className="login-head">Login</h1>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="username-box"

                        />
                        <input type="password"
                               placeholder="Password"
                               onChange={(e) => setPassword(e.target.value)}
                               required
                               className="password-box"

                        />
                        <button onClick={() => setIsLogin(!isLogin)} className="enter-btn" type="submit">
                            Login
                        </button>
                    </form>


                </div>
            </div>
        </div>
    )
}

export default MyLogin