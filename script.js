document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    // Default to dark mode if no preference is saved (fits the dev vibe well)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply the saved or default theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    // Toggle logic
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });

    // Helper function to swap the FontAwesome icon
    function updateIcon(theme) {
        if (theme === 'dark') {
            // If dark mode, show the Sun to indicate 'switch to light'
            icon.className = 'fas fa-sun';
        } else {
            // If light mode, show the Moon to indicate 'switch to dark'
            icon.className = 'fas fa-moon';
        }
    }
});