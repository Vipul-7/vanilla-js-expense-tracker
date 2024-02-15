// Function to show loader
export function showLargeLoader() {
    document.getElementById('expense-list-loader').style.display = 'block';
}

// Function to hide loader
export function hideLargeLoader() {
    document.getElementById('expense-list-loader').style.display = 'none';
}

export function showSmallLoader() {
    document.getElementById('save-button-loader').style.display = 'block';
}

export function hideSmallLoader() {
    document.getElementById('save-button-loader').style.display = 'none';
}