// to print the at the above
export const printError = (error) => {
    const errorElement = document.getElementById('error');
    errorElement.textContent = error;
    errorElement.classList.remove('hidden');

    setTimeout(() => {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }, 10000);
}

// print the success message above
export const printSuccess = (message) => {
    const successElement = document.getElementById('success');
    successElement.textContent = message;
    successElement.classList.remove('hidden');

    setTimeout(() => {
        successElement.textContent = '';
        successElement.classList.add('hidden');
    }, 10000);
}