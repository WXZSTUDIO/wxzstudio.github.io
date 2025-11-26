document.addEventListener('DOMContentLoaded', () => {
    
    // 桌面端 Logo 切换逻辑 (针对首页 Hero 区)
    const desktopHeader = document.querySelector('.desktop-header');
    const desktopLogoImg = document.getElementById('site-logo-desktop');
    
    const WHITE_LOGO = 'assets/logos/logo-white.svg';
    const BLUE_LOGO = 'assets/logos/logo-blue.svg';

    const handleScroll = () => {
        // 只在桌面端且首页执行 Logo 切换
        if (desktopHeader && desktopLogoImg && document.body.classList.contains('index-page')) {
            const scrollPosition = window.scrollY;
            // 判断是否离开 Hero 视频区 (100vh)
            if (scrollPosition > window.innerHeight - desktopHeader.offsetHeight) {
                // 离开 Hero 区，背景变浅，Logo 换成蓝色
                desktopHeader.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; 
                desktopLogoImg.src = BLUE_LOGO;
                desktopHeader.style.color = 'var(--color-text-dark)';
            } else {
                // 仍在 Hero 区内，背景透明，Logo 换成白色
                desktopHeader.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; 
                desktopLogoImg.src = WHITE_LOGO;
                desktopHeader.style.color = 'var(--color-text-dark)'; // 菜单链接颜色保持不变，但 Logo 切换
            }
        }
    };
    
    // 监听滚动事件（仅在首页生效）
    if (document.body.classList.contains('index-page')) {
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // 页面加载时执行一次
    }

    // --- 作品集标签筛选功能 (适用于 Video/Design 页面) ---
    const filterWorks = (tag) => {
        const workItems = document.querySelectorAll('.works-grid .work-item');
        if (!workItems.length) return; // 如果不是作品集页面，则退出

        workItems.forEach(item => {
            // 如果是 ALL 或作品包含该标签，则显示，否则隐藏
            if (tag === 'all' || item.getAttribute('data-tags').includes(tag)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // 切换激活标签的样式
        document.querySelectorAll('.filter-tag').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tag') === tag) {
                btn.classList.add('active');
            }
        });
    };

    // 绑定标签点击事件
    document.querySelectorAll('.filter-tag').forEach(tagButton => {
        tagButton.addEventListener('click', (e) => {
            const tag = e.target.getAttribute('data-tag');
            filterWorks(tag);
        });
    });

    // 页面加载时，默认显示所有
    if (document.querySelector('.works-grid')) {
        filterWorks('all');
    }
});