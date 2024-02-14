import "./active-link.js" // set active links to current route
import { supabase } from "./supabase.js";
import { removeAllInputErrors, showInputError, showSuccessMessage } from "./utils.js";

const formElement = document.forms["login"];

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


    let { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })

    console.log(data,error)

    if (!error) {
        showSuccessMessage("Thank you for login")
    }
}