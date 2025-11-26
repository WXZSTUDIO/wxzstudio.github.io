/* src/js/app.js */

document.addEventListener('DOMContentLoaded', () => {
    
    const body = document.body;
    // 获取当前页面的标识符
    const currentPageIdentifier = body.classList.contains('page-index') ? 'index' :
                                body.classList.contains('page-video') ? 'video' :
                                body.classList.contains('page-design') ? 'design' :
                                body.classList.contains('page-contact') ? 'contact' : '';

    // --- 1. 导航栏 active 状态设置 (确保页面切换无 bug) ---
    // 遍历桌面和移动端导航链接，设置当前页面链接为 active 状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === currentPageIdentifier) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });


    // --- 2. Logo 切换和顶部导航样式控制 (仅首页, 桌面端) ---
    const header = document.querySelector('.navbar');
    const heroVideoSection = document.querySelector('.hero-section');
    const headerLogo = document.getElementById('header-logo');
    
    if (body.classList.contains('page-index') && header && headerLogo) {
        
        const updateHeaderStyle = () => {
            // 仅对桌面端进行 Logo 切换和导航栏背景控制
            if (window.innerWidth >= 900 && heroVideoSection) { 
                // 滚动超过 Hero 区域的 80% 时
                const heroThreshold = heroVideoSection.offsetHeight * 0.8;
                
                if (window.scrollY > heroThreshold) {
                    // 切换到深色背景下的样式（蓝色 Logo，不透明磨砂玻璃）
                    // 路径更新: src/img/logo/
                    headerLogo.src = 'src/img/logo/logo-blue.svg'; 
                    header.style.backgroundColor = 'var(--color-frosted-bg)'; 
                    header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
                } else {
                    // 位于 Hero 视频上方的样式（白色 Logo，更透明的背景）
                    // 路径更新: src/img/logo/
                    headerLogo.src = 'src/img/logo/logo-white.svg';
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    header.style.borderBottom = 'none';
                }
            }
        };

        window.addEventListener('scroll', updateHeaderStyle);
        // 页面加载和窗口大小变化时也需要检查
        window.addEventListener('resize', updateHeaderStyle);
        updateHeaderStyle();
    }


    // --- 3. 作品集筛选功能 ---
    if (body.classList.contains('page-video') || body.classList.contains('page-design')) {
        const tagButtons = document.querySelectorAll('.tag-filter-container .tag-button');
        const portfolioGrid = document.getElementById('portfolio-grid');

        if (tagButtons.length > 0 && portfolioGrid) {
            
            tagButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filterTag = button.getAttribute('data-filter');

                    // 切换按钮的 active 状态
                    tagButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    // 筛选作品
                    const workItems = portfolioGrid.querySelectorAll('.work-item');
                    workItems.forEach(item => {
                        const itemTag = item.getAttribute('data-tag');
                        
                        // 筛选逻辑
                        if (filterTag === 'all' || itemTag === filterTag) {
                            item.classList.remove('hidden');
                        } else {
                            item.classList.add('hidden');
                        }
                    });
                });
            });
        }
    }
});