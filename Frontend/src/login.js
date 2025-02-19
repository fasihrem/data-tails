import Navbar from "./navbar";
import './login.css'
import React, {useRef, useState} from "react";
import axios from "axios";
import {json, useNavigate} from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./store/auth_slice";

function MyLogin(){

    const setU = useRef();
    const setP = useRef();

    const dispatch = useDispatch();

    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [checked, setChecked] = useState(false);

    const handleLogin = async (e) => {

        e.preventDefault();
        const username = setU.current.value;
        const password = setP.current.value;

        if (username === '' || password === '') {
            alert("enter email/pass");
            return;
        }



            try {
                const loginData = {
                    username: username,
                    password: password,
                }

                const response = await axios.post("http://127.0.0.1:5000/api/login", loginData, {
                    withCredentials: true, // Important for sending/receiving cookies
                });

                setMessage(response.data.message);

                dispatch(login({ user: username, token: response.data.token }));

                navigate('/homepage');

                console.log(response.data.message);
            }
            catch (error) {
                console.error("Login failed:", error.response?.data?.error);
                setMessage(error.response?.data?.error|| "login failed");
            }
    }
            // const handleChange = async (e) => {
            //     e.preventDefault();
            //     try {
            //         setChecked(e.target.checked);
            //
            //         if (e.target.checked) {
            //             navigate('/signup');
            //         }
            //     } catch (error) {
            //         console.error("Error handling toggle change:", error);
            //     }
            // };

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

                            <form method="post"
                                  onSubmit={handleLogin}
                            >
                                <input
                                    className="username-box"
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    required
                                    ref={setU}
                                />
                                <input
                                    className="password-box"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    defaultValue=""
                                    ref={setP}
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