document.addEventListener('DOMContentLoaded', () => {
    
    const clientList = document.getElementById('client-list');
    const showAllBtn = document.getElementById('show-all-clients-btn');
    const clientLogos = clientList ? clientList.querySelectorAll('.client-logo') : [];

    // 移动端客户展示逻辑 (3x3 网格)
    if (clientList && showAllBtn && window.innerWidth <= 1024) {
        
        const limit = 9; // 默认展示前 9 个 (3x3)
        let isAllVisible = false;

        // 默认隐藏第 10 个及之后的客户 (CSS 媒体查询中也做了处理，这里确保JS逻辑同步)
        clientLogos.forEach((logo, index) => {
            if (index >= limit) {
                logo.style.display = 'none';
            } else {
                 // 确保前 9 个是 grid item 默认的 display
                logo.style.display = ''; 
            }
        });

        // 如果总数超过限制，则显示按钮
        if (clientLogos.length > limit) {
            showAllBtn.style.display = 'block';
        } else {
            showAllBtn.style.display = 'none';
        }

        showAllBtn.addEventListener('click', () => {
            if (!isAllVisible) {
                // 显示所有客户
                clientLogos.forEach(logo => logo.style.display = ''); // 清除内联样式，恢复 CSS 默认的 grid item 显示
                showAllBtn.textContent = '收起'; 
                isAllVisible = true;
            } else {
                // 隐藏第 10 个及之后的客户
                clientLogos.forEach((logo, index) => {
                    if (index >= limit) {
                        logo.style.display = 'none';
                    }
                });
                showAllBtn.textContent = '展示全部'; 
                isAllVisible = false;
                
                // 滚动回网格顶部
                clientList.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    } else {
        // 桌面端或非移动端，移除原来的 JS 逻辑，并确保 “展示全部” 按钮隐藏
        if (showAllBtn) {
            showAllBtn.style.display = 'none';
        }
    }
    // 桌面端的滚动动画是通过 CSS 实现的，不需要额外的 JS。
});