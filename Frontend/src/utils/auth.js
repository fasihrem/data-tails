import axios from "axios";

export const checkAuth = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/verify", {
            withCredentials: true, // Sends cookies
        });

        return response.data.user; // Return logged-in username
    } catch (error) {
        return null; // User not logged in
    }
};
