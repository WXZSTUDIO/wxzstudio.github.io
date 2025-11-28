/*
 * WXZ STUDIO Website JavaScript (Final Update: Universal Fixes)
 * Author: Gemini
 * Functions: Portfolio Filtering, Client Show More, Scroll-to-Top, Logo Shuffle
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Utility: Fisher-Yates Shuffle Algorithm (实现 Logo 随机排序) ---
    const shuffleElements = (parentSelector, itemSelector) => {
        const parents = document.querySelectorAll(parentSelector);
        
        parents.forEach(parent => {
            const items = Array.from(parent.querySelectorAll(itemSelector));

            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                
                if (i !== j) {
                    const itemA = items[i];
                    const itemB = items[j];

                    // 重新插入 DOM
                    parent.insertBefore(itemA, itemB.nextSibling); 
                    parent.insertBefore(itemB, itemA.nextSibling); 
                }
            }
        });
    };
    // 仅在 Home 页面执行 Logo 随机排列
    if (document.querySelector('.clients-wall')) {
        shuffleElements('.clients-list-inner', '.client-logo');
    }
    
    // --- 2. Portfolio Filtering Logic (作品筛选) ---
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

                    // 根据标签显示/隐藏作品
                    if (filterTag === 'all' || itemTags.includes(filterTag)) {
                        item.style.display = 'block'; 
                    } else {
                        item.style.display = 'none'; 
                    }
                });
            });
        });
        
        // 默认点击 '全部' 按钮
        const allButton = document.querySelector('.tag-filter button[data-tag="all"]');
        if(allButton) {
            allButton.click();
        }
    }

    // --- 3. Client Logo Show More Logic (Home Page Mobile Only) ---
    const showMoreButton = document.getElementById('showMoreClients');
    const clientLogos = document.querySelectorAll('.clients-list-inner:first-child .client-logo');
    const maxInitialClients = 9;

    if (showMoreButton && clientLogos.length > maxInitialClients) {
        showMoreButton.addEventListener('click', () => {
            for (let i = maxInitialClients; i < clientLogos.length; i++) {
                clientLogos[i].classList.add('is-visible'); 
            }
            showMoreButton.style.display = 'none';
        });
    } else if (showMoreButton) {
        showMoreButton.style.display = 'none';
    }


    // --- 4. Scroll To Top Button Logic (返回顶部) ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollThreshold = 300;
    
    // 如果没有返回顶部按钮，则忽略后续逻辑
    if (!scrollToTopBtn) return; 

    window.addEventListener('scroll', () => {
        const currentScroll = document.body.scrollTop || document.documentElement.scrollTop;
        if (currentScroll > scrollThreshold) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });
    });
});