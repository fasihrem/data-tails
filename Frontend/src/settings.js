import React from "react";
import {useNavigate} from "react-router-dom";
import { useAuth } from "./AuthContext";
import {useState} from "react";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from "firebase/auth";
import Navbar from "./navbar";

function Settings() {
    const navigate = useNavigate();

    const auth = getAuth();
    const user = auth.currentUser;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const reauthenticateUser = async () => {
        if (!user) {
            setMessage("User not logged in!");
            return false;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            return true; // Re-authentication successful
        } catch (error) {
            setMessage("Re-authentication failed. Please check your password.");
            return false;
        }
    };

    const handlePassword = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("No user is logged in.");
            return;
        }

        if (newPassword.length < 6) {
            setMessage("Password should be at least 6 characters long.");
            return;
        }

        try {
            const reauthenticated = await reauthenticateUser();
            if (!reauthenticated) return;

            await updatePassword(user, newPassword);
            setMessage("✅ Password updated successfully! 🎉");
            setCurrentPassword("");
            setNewPassword("");
            navigate("/homepage");
        } catch (error) {
            setMessage(`❌ Error: ${error.message}`);
        }
    };

    const emailVerify = async (e) => {
        e.preventDefault();

        try {
            sendEmailVerification(user);
        }
        catch (error){
            setMessage(error.message);
        }

    };

    return (
        <div>
            <Navbar/>
            {/*<h1>Welcome, {auth.displayName || auth.email}</h1>*/}
            <div className="ai-page">
                <form onSubmit={handlePassword}>
                    Update Password
                    <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        required
                        placeholder="Enter a new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="submit">Update Password</button>
                </form>

                <form onSubmit={emailVerify}>
                    <button type="submit">Verify Email</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default Settings;