// to print the at the above
export const showErrorMessage = (error) => {
    const errorElement = document.getElementById('error');
    errorElement.textContent = error;
    errorElement.classList.remove('hidden');

    setTimeout(() => {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }, 10000);
}

// print the success message above
export const showSuccessMessage = (message) => {
    const successElement = document.getElementById('success');
    successElement.textContent = message;
    successElement.classList.remove('hidden');

    setTimeout(() => {
        successElement.textContent = '';
        successElement.classList.add('hidden');
    }, 10000);
}

export const removeAllInputErrors = () => {
    const inputError = document.querySelectorAll('form div p');
    inputError.forEach(error => {
        error.remove();
    });
}

export const showInputError = (inputName) => {
    const inputElement = document.getElementById(inputName);
    const divElement = inputElement.parentElement;
    const pElement = document.createElement('p');
    pElement.textContent = 'This field is required';
    pElement.classList.add('input-error');
    divElement.appendChild(pElement);
}