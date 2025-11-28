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
    const wechatQrcodePopup = document.getElementById('wechatModal'); 
    const closeBtn = wechatQrcodePopup ? wechatQrcodePopup.querySelector('.close-btn') : null;

    if (wechatIcon && wechatQrcodePopup && closeBtn) {
        // 点击 Icon 时显示弹出框
        wechatIcon.addEventListener('click', (event) => {
            event.stopPropagation(); 
            wechatQrcodePopup.style.display = 'block';
            
            // 检查屏幕方向并设置弹出框位置（可选：如果弹出框位置需要微调）
            // 目前 CSS 已经通过 absolute/transform 相对 wechat-icon-container 居中，无需 JS 调整
            
            setTimeout(() => {
                wechatQrcodePopup.classList.add('show');
            }, 10); 
        });

        // 点击关闭按钮时隐藏弹出框
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation(); 
            wechatQrcodePopup.classList.remove('show');
            setTimeout(() => {
                wechatQrcodePopup.style.display = 'none';
            }, 300); 
        });

        // 点击弹出框外部时隐藏弹出框
        document.addEventListener('click', (event) => {
            // 检查点击目标是否在弹出框内部、或是否是 Icon 本身
            if (wechatQrcodePopup.classList.contains('show') && !wechatQrcodePopup.contains(event.target) && event.target !== wechatIcon) {
                wechatQrcodePopup.classList.remove('show');
                setTimeout(() => {
                    wechatQrcodePopup.style.display = 'none';
                }, 300);
            }
        });
    }
});