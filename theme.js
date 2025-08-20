document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    function applyTheme(theme) {
        body.classList.remove('light-mode', 'dark-mode');
        body.classList.add(theme);
        localStorage.setItem('nyumbacareTheme', theme);
        
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'dark-mode') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    const savedTheme = localStorage.getItem('nyumbacareTheme') || 'light-mode';
    applyTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
        applyTheme(currentTheme);
    });
});