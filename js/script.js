/*
 * WXZ STUDIO Website JavaScript
 * Author: Gemini
 * Functions: Portfolio Filtering, Auto-Scrolling Client Wall (REMOVED), Client Show More (NEW)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Portfolio Filtering Logic (作品筛选) ---
    const filterButtons = document.querySelectorAll('.tag-filter button');
    const workItems = document.querySelectorAll('.work-item');

    if (filterButtons.length > 0 && workItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filterTag = e.target.dataset.tag;

                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                workItems.forEach(item => {
                    const itemTags = item.dataset.tags ? item.dataset.tags.split(' ') : [];

                    if (filterTag === 'all' || itemTags.includes(filterTag)) {
                        item.style.display = 'block'; 
                    } else {
                        item.style.display = 'none'; 
                    }
                });
            });
        });
        
        const allButton = document.querySelector('.tag-filter button[data-tag="all"]');
        if(allButton) {
            allButton.click();
        }
    }

    // --- 2. Client Logo Show More Logic (Mobile Only) ---
    const showMoreButton = document.getElementById('showMoreClients');
    const clientLogos = document.querySelectorAll('.clients-list-inner .client-logo');
    const maxInitialClients = 9;

    if (showMoreButton && clientLogos.length > maxInitialClients) {
        
        // Function to check if we are in mobile view (match CSS setting)
        const isMobileView = () => window.matchMedia('(max-width: 767px)').matches;

        // Initially hide the button if not in mobile view (CSS should handle desktop/mobile show/hide, but this is a fallback)
        if (!isMobileView()) {
             showMoreButton.style.display = 'none';
             // Ensure all logos are visible on desktop (desktop grid layout does not hide them)
             for (let i = maxInitialClients; i < clientLogos.length; i++) {
                clientLogos[i].style.display = 'block'; 
            }
        }
        
        showMoreButton.addEventListener('click', () => {
            // 显示剩余的 Logo (从第10个开始)
            for (let i = maxInitialClients; i < clientLogos.length; i++) {
                clientLogos[i].style.display = 'block'; 
            }
            // 隐藏“显示更多”按钮
            showMoreButton.style.display = 'none';
        });
    }
    
    // 自动滚动逻辑已移除
});