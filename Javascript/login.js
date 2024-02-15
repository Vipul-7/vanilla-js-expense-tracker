import "./active-link.js" // set active links to current route
import { supabase } from "./supabase.js";
import { removeAllInputErrors, showInputError, showSuccessMessage } from "./utils.js";
import "./getUser.js"
import { hideSmallLoader, showSmallLoader } from "./loader.js";

const formElement = document.forms["login"];

formElement.addEventListener("submit", formSubmitHandler)

async function formSubmitHandler(event) {
    event.preventDefault();
    const { email } = event.target.elements;

    removeAllInputErrors();

    if (email.value === "") {
        showInputError(email, "Email is required");
        return;
    }

    showSmallLoader();
    const { data, error } = await supabase.auth.signInWithOtp({
        email: email.value
    })
    hideSmallLoader();

    if (error) {
        showInputError(email, error.message)
        return;
    }

    if (!error) {
        showSuccessMessage("Link sent to your email")
    }

    formElement.reset();
}