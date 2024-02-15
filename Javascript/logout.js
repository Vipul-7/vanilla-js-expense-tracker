import { hideSmallLoader, showSmallLoader } from "./loader";
import { supabase } from "./supabase";
import { showSuccessMessage } from "./utils";

export const logoutHandler = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error);
        return;
    } else {
        showSuccessMessage("Logged out successfully");
        const logoutButton = document.getElementById("logout-button");
        const loginLink = document.getElementById("login-link");
        const signupLink = document.getElementById("signup-link");
        const userEmailSpan = document.getElementById("user-email");

        userEmailSpan.style.display = "none";
        logoutButton.style.display = "none";
        loginLink.style.display = "block";
        signupLink.style.display = "block";
        location.reload();
    }
}