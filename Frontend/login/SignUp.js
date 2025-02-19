import {useRef} from 'react';
import { useNavigate } from "react-router-dom";
import {useDispatch} from "react-redux";
import {RegisterNav} from "./components/nav/register-nav";
import {authActions} from "../../service/auth_slice";
import image from '../../images/background/12.jpg';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import axios from 'axios';

function SignUp() {
    const dispatch = useDispatch();
    const email = useRef();
    const password = useRef();
    const Cpassword = useRef();

    const navigate = useNavigate();
    var role = "";
    var isEmptyLogin = false;
    const HandyMan = () => {
        role = 'HandyMan' ;
    }
    const Professional = () => {
        role = 'Professional';
    }

    const RegisterHandler = (e) => {
        e.preventDefault();

        const Email = email.current.value;
        const Password = password.current.value;
        const ConPass = Cpassword.current.value;

        if(Email === '' || Password === '') {
            console.log('Entered');
            alert('Enter Email or Password');
            isEmptyLogin = true;
            return(
                <header>
                    <Stack sx={{ width: '100%' }} spacing={2}>
                        <Alert severity="error">
                            <AlertTitle>Error</AlertTitle>
                            Please Enter Email or Password.
                        </Alert>
                    </Stack>
                </header>
            );
        }
        else {
            const RegisterData = {
                username: 'shitba',
                email: Email,
                password1: Password,
                password2: ConPass,
                role: 'HandyMan',
            }

            const obj = JSON.stringify(RegisterData);

            axios.post(`http://kiosk.local.aim-less.com/auth/registration/`, RegisterData).then(res=> {
                console.log(res);
                console.log(res.data);
            })
            
            dispatch(authActions.signUp(RegisterData));

            console.log(RegisterData);
            navigate('/createProfile');
        }
    }


    return (
        <>
            <div className="page-wrapper">
                {/* Preloader */}
                {/* Main Header*/}

                <RegisterNav/>

                {/*End Main Header */}
                {/* Info Section */}

                <div className="login-section">
                    <div
                        className="image-layer"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                    <div className="outer-box">
                        {/* Login Form */}
                        <div className="login-form default-form">
                            <div className="form-inner">
                                {isEmptyLogin && <Stack sx={{width: '100%'}} spacing={2}>
                                    <Alert severity="error">
                                        <AlertTitle>Error</AlertTitle>
                                        Please Enter Email or Password.
                                    </Alert>
                                </Stack>}
                                <h3>Create a Free Kiosk Account</h3>
                                {/*Login Form*/}
                                <form
                                    onSubmit={RegisterHandler}
                                >
                                    <div className="form-group">
                                        <div className="btn-box row">
                                            <div className="col-lg-6 col-md-12" onClick={HandyMan}>
                                                <p className="theme-btn btn-style-four">
                                                    {role === "HandyMan"? <i className='la la-briefcase'/> :<i className="la la-user" />}
                                                    HandyMan{" "}
                                                </p>
                                            </div>
                                            <div className="col-lg-6 col-md-12" onClick={Professional}>
                                                <p className="theme-btn btn-style-four">
                                                    {role === "Professional"? <i className='la la-briefcase'/> :<i className="la la-user" />}
                                                    Professional{" "}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            required=""
                                            ref={email}
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
                                            ref={password}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            id="password-field"
                                            type="password"
                                            name="password"
                                            defaultValue=""
                                            placeholder="Password"
                                            ref={Cpassword}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <button
                                            className="theme-btn btn-style-one "
                                            type="submit"
                                            name="Register"
                                        >
                                            Register
                                        </button>
                                    </div>
                                </form>
                                <div className="bottom-box">
                                    <div className="divider">
                                        <span>or</span>
                                    </div>
                                    <div className="btn-box row">
                                        <div className="col-lg-6 col-md-12">
                                            <a href="/" className="theme-btn social-btn-two facebook-btn">
                                                <i className="fab fa-facebook-f" /> Log In via Facebook
                                            </a>
                                        </div>
                                        <div className="col-lg-6 col-md-12">
                                            <a href='/' className="theme-btn social-btn-two google-btn">
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
                {/* End Info Section */}
            </div>
            {/* End Page Wrapper */}
        </>

    );
}

export default SignUp;

