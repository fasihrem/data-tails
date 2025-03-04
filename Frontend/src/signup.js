import Navbar from "./navbar";
import "./signup.css"
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import { auth } from "./firebase";
import { updateProfile, createUserWithEmailAndPassword } from "firebase/auth";

function MySignUp(){

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(true);
    const [name, setName] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, {
                    displayName: name, // Assuming you have a `name` state
                });

                alert(`Account created! 🎉 Welcome, ${name}`);
                navigate('/homepage');
            }
            catch (error) {
                alert(error.message);
            }
        };



    return (
        <div className="signup-page">
            <Navbar/>

            <div className="signup-box">
                <h1 className="signup-head">Sign Up</h1>
                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="John Doe"
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="username-box-sp"
                        />

                    <input
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="username-box-sp"

                    />
                    <input type="password"
                           placeholder="Password"
                           onChange={(e) => setPassword(e.target.value)}
                           required
                           className="password-box-sp"

                    />

                    <button onClick={() => setIsSignup(!isSignup)} className="enter-btn-sp" type="submit">Signup</button>
                </form>
            </div>
        </div>
    )
}

export default MySignUp