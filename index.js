import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient('https://yhhwaulcxdikovqbvkdq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloaHdhdWxjeGRpa292cWJ2a2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcxOTU5MTYsImV4cCI6MjAyMjc3MTkxNn0.rnDmpDN7vqVHVYD0Bi9Q5ibkkq7aWkhPw26dwXaXENo');

// const currentExpenses = [];
const formElement = document.forms["expense"];
const expenseList = document.getElementById("expenseList");

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

    // currentExpenses.push(newExpense);
    const addExpense = await supabase
        .from('expenses')
        .insert([
            newExpense
        ]);

    if (addExpense.error) {
        console.error(addExpense.error);
        printError(addExpense.error.message);
        return;
    }
    else {
        // console.log('Expense added successfully');
        printSuccess('Expense added successfully');
    }

    renderExpense();

    formElement.reset();
}

async function renderExpense() {
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

    await supabase.from('expenses').select('*').then(({ data, error }) => {
        if (error) {
            console.error(error);
            return;
        }

        expenseList.innerHTML = "";
        data.forEach(expense => {
            renderExpenseRow(expense);
        });
    });
}


// to print the at the above
const printError = (error) => {
    const errorElement = document.getElementById('error');
    errorElement.textContent = error;
    errorElement.classList.remove('hidden');

    setTimeout(() => {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }, 10000);
}

// print the success message above
const printSuccess = (message) => {
    const successElement = document.getElementById('success');
    successElement.textContent = message;
    successElement.classList.remove('hidden');

    setTimeout(() => {
        successElement.textContent = '';
        successElement.classList.add('hidden');
    }, 10000);
}