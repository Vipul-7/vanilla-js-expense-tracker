import "./active-link.js" // set active links to current route
import { supabase } from "./supabase.js";
import { removeAllInputErrors, showInputError, showSuccessMessage } from "./utils.js";
import "./getUser.js"
import { hideSmallLoader, showSmallLoader } from "./loader.js";

const formElement = document.forms["signup"];

formElement.addEventListener("submit", formSubmitHandler)

async function formSubmitHandler(event) {
    event.preventDefault();
    const { email, password } = event.target.elements;

    removeAllInputErrors();

    if (email.value.trim() === "" || password.value.trim() === "") {
        if (email.value === '') {
            showInputError('email');
        }
        if (password.value === '') {
            showInputError('password');
        }
        return;
    }

    showSmallLoader();
    let { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: email.value
    })
    hideSmallLoader();

    if(!error){
        showSuccessMessage("We have sent a verification mail on your email. Please verify yourself to login.")
    }

    formElement.reset();
}