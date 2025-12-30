document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.className = 'btn btn-outline';
    themeToggleBtn.style.marginLeft = '1rem';
    themeToggleBtn.innerHTML = '<ion-icon name="moon-outline"></ion-icon>';
    themeToggleBtn.title = 'Toggle Dark Mode';

    // Locate header to insert button
    const headerNav = document.querySelector('header .nav-flex');
    if (headerNav) {
        headerNav.appendChild(themeToggleBtn);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<ion-icon name="sunny-outline"></ion-icon>';
    }

    // Toggle logic
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<ion-icon name="moon-outline"></ion-icon>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<ion-icon name="sunny-outline"></ion-icon>';
        }
    });
});
