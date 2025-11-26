/*
 * WXZ STUDIO Website JavaScript
 * Author: Gemini
 * Functions: Portfolio Filtering, Header Scroll Effect
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Header Scroll Effect (菜单深浅颜色切换) ---
    // 在Hero视频或深色区域时切换导航栏样式
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            // 当滚动超过50px时添加 'scrolled' 类，模拟颜色切换
            if (window.scrollY > 50) {
                header.classList.add('dark');
            } else {
                header.classList.remove('dark');
            }
        });
        // 初始检查
        if (window.scrollY > 50) {
            header.classList.add('dark');
        }
    }

    // --- 2. Portfolio Filtering Logic (作品筛选) ---
    const filterButtons = document.querySelectorAll('.tag-filter button');
    const workItems = document.querySelectorAll('.work-item');

    if (filterButtons.length > 0 && workItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 获取点击的标签 (data-tag)
                const filterTag = e.target.dataset.tag;

                // 切换按钮的 active 状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                // 筛选作品
                workItems.forEach(item => {
                    // 获取作品的标签列表 (从 data-tags)
                    const itemTags = item.dataset.tags ? item.dataset.tags.split(' ') : [];

                    // 判断是否显示
                    if (filterTag === 'all' || itemTags.includes(filterTag)) {
                        item.style.display = 'block'; // 显示
                    } else {
                        item.style.display = 'none'; // 隐藏
                    }
                });
            });
        });
        
        // 页面加载时自动点击 '全部' 按钮进行初始化
        const allButton = document.querySelector('.tag-filter button[data-tag="all"]');
        if(allButton) {
            allButton.click();
        }
    }
});