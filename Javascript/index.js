import { printError, printSuccess } from './utils.js';
import { supabase } from './supabase.js';
import { hideExpensesDataLoader, hideSendingExpenseDataLoader, showExpensesDataLoader, showSendingExpenseDataLoader } from './loader.js';

// during intial load
document.addEventListener("DOMContentLoaded", renderExpenses);

const formElement = document.forms["expense"];
// on form submit
formElement.addEventListener("submit", formSubmitHandler);

async function formSubmitHandler(event) {
    event.preventDefault();
    const { title, amount, date, tag, mode } = event.target.elements;

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
        printError("Error while saving the expense :- " + addExpense.error.message);
        hideSendingExpenseDataLoader();
        return;
    }
    else {
        printSuccess('Expense added successfully');
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
            printError("Error while fetching expenses :- " + error.message);
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