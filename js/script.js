document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.main-header');
    const logoImg = document.getElementById('site-logo');
    
    const WHITE_LOGO = 'assets/logos/logo-white.svg';
    const BLUE_LOGO = 'assets/logos/logo-blue.svg';

    // 1. 移动端菜单切换
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        menuToggle.classList.toggle('active');
    });

    // 2. 导航栏样式/Logo 切换（基于滚动位置）
    // 滚动监听：判断是否离开 Hero 视频区 (100vh)
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        
        // 当滚动超过视口高度时，假设背景变为浅色，需切换 Logo 和菜单颜色
        if (scrollPosition > window.innerHeight) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // 浅色背景
            header.style.borderBottom = '1px solid var(--color-border)';
            logoImg.src = BLUE_LOGO; // 使用深色 Logo
        } else {
            // 在 Hero 区内，使用白色 Logo，背景透明/磨砂
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; 
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
            logoImg.src = WHITE_LOGO; // 使用浅色 Logo
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 页面加载时执行一次

    // 3. 标签筛选功能 (适用于 Video/Design 页面)
    // 请在 video-works.html 和 design-works.html 中添加以下代码的对应部分
    const filterWorks = (tag) => {
        const workItems = document.querySelectorAll('.work-item');
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
    if (document.querySelector('.work-item')) {
        filterWorks('all');
    }
});