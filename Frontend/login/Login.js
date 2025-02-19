import {useRef, useState} from 'react';
import { useNavigate } from "react-router-dom";
import {RegisterNav} from "./components/nav/register-nav";
import {useDispatch} from "react-redux";
import {authActions} from "../../service/auth_slice";
import image from '../../images/background/12.jpg';
import axios from 'axios';


export const Login =() => {
    const setE=useRef();
    const setP=useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    
    const LoginHandler =(e) =>
    {
        e.preventDefault();
        const Email = setE.current.value;
        const Password = setP.current.value;

        if (Email === '' || Password === '') {
            alert('Please enter Email and Password');
        }
        else {

            const LoginData =
                {
                    email: Email,
                    password: Password,
                }
                const data = JSON.stringify(LoginData);
            dispatch(authActions.login(LoginData));
            axios.post('http://kiosk.local.aim-less.com/auth/login/', LoginData).then(res=> {
                console.log(res);
                console.log(res.data);
            })

            console.log(LoginData);
            navigate('/login');
        }
    }
    return(
        <>
            <div className="page-wrapper">
                {/* Preloader */}
                {
                    loading ? <div className="preloader" /> :
                (
                    <>
                <RegisterNav/>
                <div className="login-section">
                    <div
                        className="image-layer"
                        style ={{ backgroundImage: `url(${image})` }}
                    />
                    <div className="outer-box">
                        {/* Login Form */}
                        <div className="login-form default-form">
                            <div className="form-inner">
                                <h3>Login to Kiosk</h3>
                                {/*Login Form*/}
                                <form
                                    method="post"
                                    action="https://creativelayers.net/themes/superio/add-parcel.html"
                                    onSubmit={LoginHandler}
                                >
                                    <div className="form-group">
                                        <label>Username or Email</label>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Username"
                                            required=""
                                            ref={setE}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            id="password-field"
                                            type="password"
                                            name="password"
                                            defaultValue=""
                                            placeholder="Password"
                                            ref={setP}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <div className="field-outer">
                                            <div className="input-group checkboxes square">
                                                <input
                                                    type="checkbox"
                                                    name="remember-me"
                                                    defaultValue=""
                                                    id="remember"
                                                />
                                                <label htmlFor="remember" className="remember">
                                                    <span className="custom-checkbox" /> Remember me
                                                </label>
                                            </div>
                                            <a href="components#" className="pwd">
                                                Forgot password?
                                            </a>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <button
                                            className="theme-btn btn-style-one"
                                            type="submit"
                                            name="log-in"
                                        >
                                            Log In
                                        </button>
                                    </div>
                                </form>
                                <div className="bottom-box">
                                    <div className="text">
                                        Don't have an account? <a href="register.html">Signup</a>
                                    </div>
                                    <div className="divider">
                                        <span>or</span>
                                    </div>
                                    <div className="btn-box row">
                                        <div className="col-lg-6 col-md-12">
                                            <a href="components#" className="theme-btn social-btn-two facebook-btn">
                                                <i className="fab fa-facebook-f" /> Log In via Facebook
                                            </a>
                                        </div>
                                        <div className="col-lg-6 col-md-12">
                                            <a href="components#" className="theme-btn social-btn-two google-btn">
                                                <i className="fab fa-google" /> Log In via Gmail
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*End Login Form */}
                    </div>
                </div>
                </>
                )
                }
                {/* End Info Section */}
            </div>
        </>
    )
}
