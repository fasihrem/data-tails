import Navbar from "./navbar";
import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useAuth} from "./AuthContext";

function Pricing() {
    const navigate = useNavigate();
    const { user } = useAuth()

    return (
        <div>
            <Navbar />

            {/*<h1>This shit expensive</h1>*/}
            {/*<h2>dont buy</h2>*/}

        </div>
    );
}

export default Pricing;