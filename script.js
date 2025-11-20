// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in HTML files.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // ===========================================
    // 自定义 SplitText 模拟 (不再使用，但保留结构以防未来需要)
    // ===========================================
    function initSplitTextAnimations() {
        const targets = document.querySelectorAll('.split-text-target');
        targets.forEach(target => {
            const lines = target.querySelectorAll('.line-inner');
            gsap.from(lines, {
                yPercent: 100, 
                opacity: 0,
                duration: 1.2,
                ease: "power3.out",
                stagger: 0.1,
                scrollTrigger: {
                    trigger: target,
                    start: "top 90%",
                }
            });
        });
    }

    // ===========================================
    // 常规滚动淡入动画 (Fade In & Slide Up)
    // ===========================================
    function initFadeInAnimations() {
        const fadeInElements = document.querySelectorAll('.fade-in');

        fadeInElements.forEach((el) => {
            const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
            
            gsap.from(el, {
                y: 50, 
                opacity: 0,
                duration: 0.8,
                delay: delay,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 95%", 
                }
            });
        });
    }

    // ===========================================
    // 导航主题切换 (深色/浅色)
    // ===========================================
    function initNavThemeSwap() {
        const body = document.body;
        
        // 1. 首页滚动主题切换逻辑
        if (body.classList.contains('is-homepage')) {
            const navTriggers = document.querySelectorAll('.nav-theme-trigger');

            navTriggers.forEach(trigger => {
                const section = trigger.closest('.section');
                if (!section) return;

                const nextSection = section.nextElementSibling;
                if (!nextSection || !nextSection.classList.contains('section')) return;
                
                const nextTheme = nextSection.dataset.theme || 'dark';
                const isLight = nextTheme === 'light';
                
                ScrollTrigger.create({
                    trigger: trigger,
                    start: "bottom top", 
                    onEnter: () => {
                        if (isLight) {
                            body.classList.add('light-theme-nav');
                        } else {
                            body.classList.remove('light-theme-nav');
                        }
                    },
                    onLeaveBack: () => {
                        const currentTheme = section.dataset.theme || 'dark';
                        if (currentTheme === 'light') {
                            body.classList.add('light-theme-nav');
                        } else {
                            body.classList.remove('light-theme-nav');
                        }
                    }
                });
            });
        }
        
        // 2. 非首页默认主题处理 (非首页通常不滚动切换，保持一个主题)
        if (body.classList.contains('is-other-page') && body.classList.contains('is-light')) {
            body.classList.add('light-theme-nav');
        } else if (body.classList.contains('is-other-page') && body.classList.contains('is-dark')) {
            body.classList.remove('light-theme-nav');
        }
    }
    
    // ===========================================
    // 悬浮返回首页按钮逻辑
    // ===========================================
    function initFloatingButton() {
        const floatingButton = document.getElementById('floatingBackHome');
        if (!floatingButton) return;

        // 在向下滚动超过 100 像素时显示按钮
        ScrollTrigger.create({
            trigger: document.body,
            start: "top -100px", // 当页面滚动 100px 时
            onEnter: () => floatingButton.classList.add('show'),
            onLeaveBack: () => floatingButton.classList.remove('show'),
            // markers: true // 调试用
        });
    }

    // ===========================================
    // 移动端菜单逻辑
    // ===========================================
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const navOverlay = document.getElementById('navOverlay');
    const closeMobileMenuButton = document.getElementById('closeMobileMenu');

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        navOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    window.closeMobileMenu = function() { 
        mobileMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    if (mobileMenuButton) mobileMenuButton.addEventListener('click', openMobileMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);
    if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', closeMobileMenu);


    // ===========================================
    // 总初始化函数
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        initFloatingButton(); // 初始化悬浮按钮
        initSplitTextAnimations();
        initFadeInAnimations();
        initNavThemeSwap();
    });
}