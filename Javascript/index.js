import { removeAllInputErrors, showErrorMessage, showInputError, showSuccessMessage } from './utils.js';
import { supabase } from './supabase.js';
import { hideLargeLoader, hideSmallLoader, showLargeLoader, showSmallLoader } from './loader.js';
import { logoutHandler } from './logout.js';
import "./active-link.js" // set active links to current route

// during intial load
document.addEventListener("DOMContentLoaded", renderExpenses);
import "./getUser.js"

const formElement = document.forms["expense"];

// on form submit
formElement.addEventListener("submit", formSubmitHandler);

// clear the form field when button clicked
const clearButtonElement = document.getElementById("clear-button");
clearButtonElement.addEventListener("click", () => {
    formElement.reset();
})

async function formSubmitHandler(event) {
    event.preventDefault();
    const { title, amount, date, tag, mode } = event.target.elements;

    // remove the input errors if any
    removeAllInputErrors();

    if (title.value.trim() === '' || amount.value.trim() === '' || date.value.trim() === '' || tag.value.trim() === '' || mode.value.trim() === '') {
        if (title.value === '') {
            showInputError('title');
        }
        if (amount.value === '') {
            showInputError('amount');
        }
        if (date.value === '') {
            showInputError('date');
        }
        if (tag.value === '') {
            showInputError('tag');
        }
        if (mode.value === '') {
            showInputError('mode');
        }
        return;
    }

    const newExpense = {
        title: title.value,
        amount: amount.value,
        date: date.value,
        tag: tag.value,
        mode: mode.value
    };

    await addExpense(newExpense);
    await renderExpenses();

    formElement.reset();
}

// responsible for adding the expense
async function addExpense(newExpense) {
    showSmallLoader();
    const addExpense = await supabase
        .from('expenses')
        .insert([
            newExpense
        ]);

    if (addExpense.error) {
        console.error(addExpense.error);
        showErrorMessage("Error while saving the expense :- " + addExpense.error.message);
        hideSmallLoader();
        return;
    }
    else {
        showSuccessMessage('Expense added successfully');
    }
    hideSmallLoader();
}

// responsible for rendering the expenses
async function renderExpenses() {
    const expenseList = document.getElementById("expenseList");

    function createTableCell(text) {
        const td = document.createElement("td");
        td.textContent = text;
        td.classList.add('border');
        return td;
    }

    const renderExpenseRow = (expense) => {
        const tr = document.createElement("tr");

        ["title", "amount", "tag", "date", , "mode"].forEach(key => {
            const td = createTableCell(expense[key]);
            tr.appendChild(td);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add('delete-button'); // opens a dialog for confirmation

        deleteButton.addEventListener("click", async () => {
            showLargeLoader();
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expense.id);

            if (error) {
                console.error(error);
                hideLargeLoader();
                showErrorMessage("Error while deleting the expense :- " + error.message);
                return;
            }
            showSuccessMessage("Expense deleted successfully")
            await renderExpenses();
        });

        tr.appendChild(deleteButton);
        expenseList.appendChild(tr);
    }

    showLargeLoader();
    await supabase.from('expenses').select('*').order("date", { ascending: false }).limit(16).then(({ data, error }) => {
        if (error) {
            console.error(error);
            showErrorMessage("Error while fetching expenses :- " + error.message);
            hideLargeLoader();
            return;
        }

        expenseList.innerHTML = "";
        data.forEach(expense => {
            renderExpenseRow(expense);
        });
    });
    hideLargeLoader();
}

// logout handler
const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", logoutHandler);