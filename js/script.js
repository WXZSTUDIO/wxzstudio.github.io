/*
 * WXZ STUDIO Website JavaScript (Final Update: Enhanced Contact Page)
 * Author: Gemini
 * Functions: Portfolio Filtering, Client Show More, Scroll-to-Top, Wechat Qrcode Popup
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

    // --- 3. Scroll To Top Button Logic (返回顶部) ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollThreshold = 300;

    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > scrollThreshold || document.documentElement.scrollTop > scrollThreshold) {
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

    // --- 4. Wechat Qrcode Pop-up Logic (微信二维码弹出) ---
    const wechatIcon = document.getElementById('wechatIcon');
    const wechatQrcodePopup = document.getElementById('wechatModal'); // 注意这里 id 保持一致
    const closeBtn = wechatQrcodePopup ? wechatQrcodePopup.querySelector('.close-btn') : null;

    if (wechatIcon && wechatQrcodePopup && closeBtn) {
        // 点击 Icon 时显示弹出框
        wechatIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // 阻止事件冒泡到 window，防止立即关闭
            wechatQrcodePopup.style.display = 'block';
            // 添加 show 类触发 CSS 过渡
            setTimeout(() => {
                wechatQrcodePopup.classList.add('show');
            }, 10); // 短暂延迟，确保 display: block 生效后再添加类
        });

        // 点击关闭按钮时隐藏弹出框
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // 阻止事件冒泡
            wechatQrcodePopup.classList.remove('show');
            setTimeout(() => {
                wechatQrcodePopup.style.display = 'none';
            }, 300); // 等待过渡完成再隐藏
        });

        // 点击弹出框外部时隐藏弹出框 (在 document 而不是 window 上监听)
        document.addEventListener('click', (event) => {
            if (wechatQrcodePopup.classList.contains('show') && !wechatQrcodePopup.contains(event.target) && event.target !== wechatIcon) {
                wechatQrcodePopup.classList.remove('show');
                setTimeout(() => {
                    wechatQrcodePopup.style.display = 'none';
                }, 300);
            }
        });
    }
});