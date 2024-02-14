import { supabase } from "./supabase"
import { showErrorMessage } from "./utils"

async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!error) {
        const logoutButton = document.getElementById("logout-button");
        const loginLink = document.getElementById("login-link");
        const signupLink = document.getElementById("signup-link");

        logoutButton.style.display = "block";
        loginLink.style.display = "none";
        signupLink.style.display = "none";

        const userEmailSpan = document.getElementById("user-email");
        userEmailSpan.style.display = "block";
        userEmailSpan.textContent = `(Logged in as ${user.email})`;
    }
    //  else {
    //     showErrorMessage(error.message);
    //     setTimeout(() => {
    //         window.location.href = "/login.html";
    //     }, 10000);
    // }
}

getUser()