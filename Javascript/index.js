import { removeAllInputErrors, showErrorMessage, showInputError, showSuccessMessage } from './utils.js';
import { supabase } from './supabase.js';
import { hideExpensesDataLoader, hideSendingExpenseDataLoader, showExpensesDataLoader, showSendingExpenseDataLoader } from './loader.js';

// during intial load
document.addEventListener("DOMContentLoaded", renderExpenses);

const formElement = document.forms["expense"];
// on form submit
formElement.addEventListener("submit", formSubmitHandler);

// Function to set active link based on current route
function setActiveLink() {
    const currentPath = window.location.pathname;

    // Remove "active" class from all links
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.classList.remove('active');
    });

    // Add "active" class to the link corresponding to the current route
    if (currentPath === '/' || currentPath === '/add-expense' || currentPath === '/index.html') {
        document.getElementById('add-expense-link').classList.add('active');
    } else if (currentPath === '/reports.html') {
        document.getElementById('reports-link').classList.add('active');
    }
}

// Call setActiveLink when DOM content is loaded
document.addEventListener("DOMContentLoaded", setActiveLink);

async function formSubmitHandler(event) {
    event.preventDefault();
    const { title, amount, date, tag, mode } = event.target.elements;

    // remove the input errors if any
    removeAllInputErrors();

    if (title.value === '' || amount.value === '' || date.value === '' || tag.value === '' || mode.value === '') {
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
    showSendingExpenseDataLoader();
    const addExpense = await supabase
        .from('expenses')
        .insert([
            newExpense
        ]);

    if (addExpense.error) {
        console.error(addExpense.error);
        showErrorMessage("Error while saving the expense :- " + addExpense.error.message);
        hideSendingExpenseDataLoader();
        return;
    }
    else {
        showSuccessMessage('Expense added successfully');
    }
    hideSendingExpenseDataLoader();
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

        expenseList.appendChild(tr);
    }

    showExpensesDataLoader();
    await supabase.from('expenses').select('*').then(({ data, error }) => {
        if (error) {
            console.error(error);
            showErrorMessage("Error while fetching expenses :- " + error.message);
            hideExpensesDataLoader();
            return;
        }

        expenseList.innerHTML = "";
        data.forEach(expense => {
            renderExpenseRow(expense);
        });
    });
    hideExpensesDataLoader();
}