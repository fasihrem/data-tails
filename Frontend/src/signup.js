import Navbar from "./navbar";
import "./signup.css"
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import axios from "axios";
import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword'
import { signUp } from "supertokens-web-js/recipe/emailpassword";



SuperTokens.init({
    appInfo: {
        apiDomain: "http://localhost:5000",
        apiBasePath: "/auth",
        appName: "...",
    },
    recipeList: [
        Session.init(),
        EmailPassword.init(),
    ],
});

function MySignUp(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');

    const [message, setMessage] = useState('');
    const navigate = useNavigate();

//     async function signUpClicked(email, password) {
//     try {
//         let response = await signUp({
//             formFields: [
//                 { id: "username", value: username },
//                 { id: "password", value: password },
//             ],
//         });
//
//         if (response.status === "FIELD_ERROR") {
//             response.formFields.forEach((formField) => {
//                 if (formField.error) {
//                     window.alert(`${formField.id}: ${formField.error}`);
//                 }
//             });
//         } else if (response.status === "SIGN_UP_NOT_ALLOWED") {
//             window.alert(response.reason);
//         } else if (response.status === "OK") {
//             window.alert("Sign-up successful! Please verify your email if required.");
//             // window.location.href = "/homepage";
//             navigate("/homepage");
//         }
//     } catch (err) {
//         if (err.isSuperTokensGeneralError === true) {
//             window.alert(err.message);
//         } else {
//             window.alert("Oops! Something went wrong.");
//         }
//     }
// }



    const handleSignup = async (e) => {
            e.preventDefault();
            try {
                const response = await axios.post('http://127.0.0.1:5000/api/signup', {
                    fname,
                    lname,
                    username,
                    password,
                });

                setMessage(response.data.message); // Set success message
                if(response.data.success){
                    navigate('/login');
                }
            } catch (error) {
                setMessage(error.response.data.message); // Set error message
            }
        };



    return (
        <div className="signup-page">
            <Navbar/>

            <div className="signup-box">
                <h1 className="signup-head">Sign Up</h1>
                <form onSubmit={handleSignup}>
                    <input
                        className="fname-box"
                        type="text"
                        placeholder="Jane"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                    />

                    <input
                        className="lname-box"
                        type="text"
                        placeholder="Doe"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                    />

                    <input
                        className="username-box-sp"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="password-box-sp"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="enter-btn-sp" type="submit">Sign Up</button>
                    {/*{message && <p>Response: {message}</p>}*/}
                </form>
            </div>
        </div>
    )
}

export default MySignUp