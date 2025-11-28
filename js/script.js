/*
 * WXZ STUDIO Website JavaScript (Updated with Scroll-to-Top)
 * Author: Gemini
 * Functions: Portfolio Filtering, Client Show More, Scroll-to-Top
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
        
        showMoreButton.addEventListener('click', () => {
            for (let i = maxInitialClients; i < clientLogos.length; i++) {
                clientLogos[i].style.display = 'block'; 
            }
            showMoreButton.style.display = 'none';
        });
    }

    // --- 3. Scroll To Top Button Logic (返回顶部) - 新增功能 ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    // 显示/隐藏按钮的阈值 (例如滚动 300px 后显示)
    const scrollThreshold = 300;

    // 监听滚动事件
    window.addEventListener('scroll', () => {
        // 检查页面卷曲高度
        if (document.body.scrollTop > scrollThreshold || document.documentElement.scrollTop > scrollThreshold) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    // 监听点击事件，实现平滑滚动
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // 实现平滑滚动效果
        });
    });
});