document.addEventListener('DOMContentLoaded', () => {
    // 隐藏和显示移动端的“查看更多”按钮（如果需要）
    const clientsScrollContainer = document.querySelector('.clients-scroll-container');
    if (clientsScrollContainer && window.innerWidth <= 1024) {
        const clientLogos = document.querySelectorAll('.clients-list-inner:first-child .client-logo');
        const showMoreBtn = document.createElement('button');
        showMoreBtn.textContent = '查看更多客户案例';
        showMoreBtn.classList.add('show-more-button');
        
        // 假设只显示前 6 个 Logo
        const limit = 6;
        if (clientLogos.length > limit) {
            clientLogos.forEach((logo, index) => {
                if (index >= limit) {
                    logo.style.display = 'none';
                }
            });

            clientsScrollContainer.parentNode.appendChild(showMoreBtn);

            showMoreBtn.addEventListener('click', () => {
                clientLogos.forEach(logo => logo.style.display = 'flex'); // Flex 保证居中
                showMoreBtn.style.display = 'none';
            });
        }
    }
});