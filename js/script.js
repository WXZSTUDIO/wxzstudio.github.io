document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-tabs button');
    const workItems = document.querySelectorAll('.work-grid-item');
    const logoImage = document.querySelector('.logo img');

    // 1. 作品筛选功能
    if (filterButtons.length > 0 && workItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                
                // Update active button state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter works
                workItems.forEach(item => {
                    item.classList.remove('show');
                    if (filter === 'all' || item.dataset.tags.includes(filter)) {
                        item.classList.add('show');
                    }
                });
            });
        });

        // Initialize by clicking the 'All' button (if present)
        const allButton = document.querySelector('.filter-tabs button[data-filter="all"]');
        if (allButton) {
            allButton.click();
        }
    }

    // 2. Logo切换逻辑 (Simplification: always use white/default logo on light background)
    // The provided index.html uses a light background for most parts. 
    // We'll keep the logic simple to ensure the white logo is used by default.

    // A more complex implementation would involve an IntersectionObserver to check
    // if the header is over a dark section, but for simplicity, we use the white logo
    // since the navbar itself is a light-colored frosted glass.
    
    // For the dark footer section, the logo in the mobile nav should ideally be white.
    // However, the mobile nav is fixed at the bottom and uses frosted glass.
    
    // Let's assume the 'logo-blue.svg' is for general use on light backgrounds
    // and 'logo-white.svg' is for dark backgrounds (like the hero section if it were dark).
    // Given the frosted glass, logo-blue.svg (or any dark logo) is better for contrast.
    
    // Default logo for all pages (using the blue/dark logo for contrast on light glass):
    if (logoImage) {
        // You can use a single dark logo (logo-blue.svg) for all navbars (frosted glass/light background)
        // or keep the default (logo-blue.svg) and change only for dark sections.
        // For simplicity with frosted glass: use logo-blue.svg
        // The HTML is set to use 'logo-blue.svg' by default on the desktop nav for better contrast.
        // We ensure all links, including the logo, point to index.html
        document.querySelectorAll('a[href="#home"], .logo a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') === '#home' || link.closest('.logo')) {
                    e.preventDefault();
                    window.location.href = 'index.html';
                }
            });
        });
    }

});