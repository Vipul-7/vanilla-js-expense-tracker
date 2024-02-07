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
    } else if (currentPath === '/reports' || currentPath === '/reports.html') {
        document.getElementById('reports-link').classList.add('active');
    } else {
        console.log('No matching route found:', currentPath);
    }
}

document.addEventListener("DOMContentLoaded", setActiveLink);