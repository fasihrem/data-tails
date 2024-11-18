import Navbar from "./navbar";
import './login.css'
import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function MyLogin(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/login', {
                username,
                password,
            });
            setMessage(response.data.message); // Set success message
            if(response.data.success){
                navigate('/homepage');
            }
        } catch (error) {
            setMessage(error.response.data.message); // Set error message
        }
    };

    const handleChange = async (e) => {
        e.preventDefault();
        try {
            setChecked(e.target.checked);

            if (e.target.checked) {
                navigate('/signup');
            }
        }
        catch (error) {
            console.error("Error handling toggle change:", error);
        }
    };

    return (
        <div className="complete-page">
            <div className="login-page">
                <Navbar/>

                <div className="login-box">
                    <h1 className="login-head">Login</h1>

                    {/*<div className="toggle-container">*/}
                    {/*    <label className="toggle-label">*/}
                    {/*        <input*/}
                    {/*            type="checkbox"*/}
                    {/*            checked={checked}*/}
                    {/*            onChange={handleChange}*/}
                    {/*            className="toggle-input"/>*/}
                    {/*        <span className="toggle-slider"></span>*/}
                    {/*    </label>*/}
                    {/*</div>*/}

                    <form onSubmit={handleLogin}>
                        <input
                            className="username-box"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            className="password-box"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="enter-btn" type="submit">Login</button>
                        {message && <p>Response: {message}</p>}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default MyLogin