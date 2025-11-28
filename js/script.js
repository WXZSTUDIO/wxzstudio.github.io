/*
 * WXZ STUDIO Website JavaScript (Clean Version)
 * Functions: Portfolio Filtering, Mobile Client Show More, Logo Shuffle, Wechat Popup, Scroll Top
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Logo Shuffle (随机排列客户 Logo)
    // 作用于 .clients-list-inner 内部元素
    const listInners = document.querySelectorAll('.clients-list-inner');
    listInners.forEach(list => {
        for (let i = list.children.length; i >= 0; i--) {
            list.appendChild(list.children[Math.random() * i | 0]);
        }
    });

    // 2. Mobile Client Show More (移动端展示更多)
    const showMoreBtn = document.getElementById('showMoreClients');
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            // 选择第一个列表中的所有隐藏 Logo
            const hiddenLogos = document.querySelectorAll('.clients-list-inner:first-child .client-logo:nth-child(n+10)');
            hiddenLogos.forEach(logo => {
                logo.classList.add('is-visible');
            });
            this.style.display = 'none'; // 隐藏按钮
        });
    }

    // 3. Portfolio Filtering (作品筛选)
    const filterButtons = document.querySelectorAll('.tag-filter button');
    const workItems = document.querySelectorAll('.work-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-tag');

            workItems.forEach(item => {
                const tags = item.getAttribute('data-tags');
                if (filterValue === 'all' || tags.includes(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 4. WeChat Popup Logic (微信二维码)
    const wechatLink = document.getElementById('wechatIcon');
    const wechatPopup = document.getElementById('wechatModal');
    
    if (wechatLink && wechatPopup) {
        wechatLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Toggle show class
            if (wechatPopup.classList.contains('show')) {
                wechatPopup.classList.remove('show');
            } else {
                wechatPopup.classList.add('show');
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!wechatLink.contains(e.target) && !wechatPopup.contains(e.target)) {
                wechatPopup.classList.remove('show');
            }
        });
    }

    // 5. Scroll To Top
    const scrollTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.style.display = 'block';
            } else {
                scrollTopBtn.style.display = 'none';
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});