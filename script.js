// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in index.html.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // ===========================================
    // 自定义 SplitText 模拟 (模拟逐行/词动画)
    // -------------------------------------------
    // 依赖 HTML 结构: <span class="line-wrapper"><span class="line-inner">Text...</span></span>
    // ===========================================
    function initSplitTextAnimations() {
        // 选中所有带有 split-text-target 类的元素
        const targets = document.querySelectorAll('.split-text-target');

        targets.forEach(target => {
            // 确保只选择当前语言的元素
            if (target.classList.contains('hidden')) return;

            // 针对每个 line-inner 执行动画
            const lines = target.querySelectorAll('.line-inner');

            gsap.from(lines, {
                yPercent: 100, // 向上移动
                opacity: 0,
                duration: 1.2,
                ease: "power3.out",
                stagger: 0.1,
                scrollTrigger: {
                    trigger: target,
                    start: "top 90%", // 当目标顶部进入视口 90% 时开始
                    // markers: true, // 调试用
                }
            });
        });
    }

    // ===========================================
    // 常规滚动淡入动画 (Fade In & Slide Up)
    // ===========================================
    function initFadeInAnimations() {
        const fadeInElements = document.querySelectorAll('.fade-in');

        fadeInElements.forEach((el, index) => {
            const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
            
            gsap.from(el, {
                y: 50, // 向上滑动
                opacity: 0,
                duration: 0.8,
                delay: delay,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 95%", // 当元素进入视口 95% 时开始
                    // once: true, // 只触发一次
                }
            });
        });
    }

    // ===========================================
    // 导航主题切换 (深色/浅色)
    // ===========================================
    function initNavThemeSwap() {
        const navTriggers = document.querySelectorAll('.nav-theme-trigger');
        const body = document.body;

        navTriggers.forEach(trigger => {
            // 找到触发器所在的 Section
            const section = trigger.closest('.section');
            if (!section) return;

            // 获取下一个 Section 的主题
            const nextSection = section.nextElementSibling;
            if (!nextSection || !nextSection.classList.contains('section')) return;
            
            const nextTheme = nextSection.dataset.theme || 'dark';
            const isLight = nextTheme === 'light';
            
            ScrollTrigger.create({
                trigger: trigger,
                start: "bottom top", // 当触发器的底部到达视口顶部时触发
                // markers: true, // 调试用
                onEnter: () => {
                    if (isLight) {
                        body.classList.add('light-theme-nav');
                    } else {
                        body.classList.remove('light-theme-nav');
                    }
                },
                onLeaveBack: () => {
                    // 当向上滚动离开触发器时，切换回当前 Section 的主题
                    const currentTheme = section.dataset.theme || 'dark';
                    if (currentTheme === 'light') {
                        body.classList.add('light-theme-nav');
                    } else {
                        body.classList.remove('light-theme-nav');
                    }
                }
            });
        });

        // 非首页默认主题处理 (对于非首页页面，我们直接根据body的class设置一次，不依赖滚动)
        if (body.classList.contains('is-other-page')) {
             if (body.classList.contains('is-light')) {
                body.classList.add('light-theme-nav');
             } else {
                body.classList.remove('light-theme-nav');
             }
        }
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

    window.closeMobileMenu = function() { // 暴露给全局的函数
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
    function initAnimations() {
        initSplitTextAnimations();
        initFadeInAnimations();
        initNavThemeSwap();
    }


    // ===========================================
    // 页面加载完成
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 初始动画 (SplitText, FadeIn, Nav Swap)
        initAnimations();
    });
}