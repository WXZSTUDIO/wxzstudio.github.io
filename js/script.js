/*
 * WXZ STUDIO Website JavaScript
 * Author: Gemini
 * Functions: Portfolio Filtering, Auto-Scrolling Client Wall
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

    // --- 2. Automatic Client Logo Wall Scrolling ---
    const clientsWall = document.querySelector('.clients-wall');

    if (clientsWall) {
        const scrollSpeed = 0.5; // 滚动速度 (像素/10毫秒)
        const intervalTime = 10; // 滚动间隔 (毫秒)
        let scrollInterval;

        const startScrolling = () => {
            // 清除任何可能存在的旧间隔
            if (scrollInterval) clearInterval(scrollInterval); 
            
            scrollInterval = setInterval(() => {
                // 检查是否到达末尾 (使用 clientsWall.scrollWidth 确保能检测到内部内容宽度)
                // -1 用于解决浏览器渲染的微小误差
                if (clientsWall.scrollLeft + clientsWall.clientWidth >= clientsWall.scrollWidth - 1) {
                    // 到达末尾后，瞬间跳回开头
                    clientsWall.scrollLeft = 0;
                } else {
                    // 否则，继续滚动
                    clientsWall.scrollLeft += scrollSpeed;
                }
            }, intervalTime);
        };

        // 鼠标悬停时停止滚动，提供良好的用户体验
        clientsWall.addEventListener('mouseover', () => {
            clearInterval(scrollInterval);
        });
        
        // 鼠标移出时重新开始滚动
        clientsWall.addEventListener('mouseout', startScrolling);

        // 页面加载时开始自动滚动
        startScrolling();
    }
});