// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in index.html.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // ===========================================
    // 移动端视频自动播放修复 (Play Attempt)
    // ===========================================
    function initVideoAutoplay() {
        const heroVideo = document.querySelector('.hero-video');

        if (heroVideo) {
            const playPromise = heroVideo.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log("Hero video started successfully.");
                }).catch(error => {
                    console.warn("Video auto-play failed. Retrying with explicit mute/play logic.", error);
                    heroVideo.muted = true;
                    heroVideo.play().catch(finalError => {
                        console.error("Final attempt to play video failed:", finalError);
                    });
                });
            }
        }
    }

    // ===========================================
    // 自定义 SplitText 模拟 (模拟逐行/词动画)
    // ===========================================
    function initSplitTextAnimations() {
        const targets = document.querySelectorAll('.split-text-target');

        targets.forEach(target => {
            const lines = target.querySelectorAll('.line-inner:not(.hidden)');

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
        const fadeInTargets = document.querySelectorAll('.fade-in');

        fadeInTargets.forEach(target => {
            if (target.classList.contains('hidden')) return;
            
            const delay = parseFloat(target.getAttribute('data-delay')) || 0;

            gsap.from(target, {
                y: 30, 
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: delay,
                scrollTrigger: {
                    trigger: target,
                    start: "top 95%", 
                }
            });
        });
    }

    // ===========================================
    // 导航主题切换 (Sticky Nav Swap)
    // ===========================================
    function initNavThemeSwap() {
        document.querySelectorAll('.nav-theme-trigger').forEach((trigger) => {
            
            const section = trigger.closest('.section');
            const theme = section ? section.getAttribute('data-theme') : 'dark';
            const isDark = (theme === 'dark');

            ScrollTrigger.create({
                trigger: trigger,
                start: "top 50%", 
                end: "bottom 50%",
                
                onToggle: (self) => {
                    if (self.isActive) {
                        document.body.classList.toggle('light-theme-nav', !isDark);
                    } else {
                        const scrollPos = ScrollTrigger.scroller.scrollTop;
                        const triggerPos = self.start;

                        if (scrollPos < triggerPos) {
                            const prevSection = section.previousElementSibling;
                            const prevTheme = prevSection && prevSection.classList.contains('section') ? prevSection.getAttribute('data-theme') : 'dark';

                            document.body.classList.toggle('light-theme-nav', (prevTheme !== 'dark'));
                        } 
                    }
                }
            });
        });
    }
    
    // ===========================================
    // 作品筛选逻辑 (Works Filter) - NEW FUNCTION
    // ===========================================
    function initWorksFilter() {
        const filterButtons = document.querySelectorAll('.works-filter .filter-btn');
        const worksGrid = document.querySelector('.works-grid');
        if (!worksGrid) return;
        const workItems = worksGrid.querySelectorAll('.work-item');

        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');

                // 1. 切换按钮的 active 状态
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                // 2. 筛选作品
                workItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    const shouldShow = filter === 'all' || category === filter;
                    
                    if (shouldShow) {
                        // 显示元素
                        item.style.display = 'block';
                        gsap.to(item, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.5,
                            delay: Math.random() * 0.1, 
                            clearProps: "all" // 确保清除所有 GSAP 设置的样式，恢复 CSS 控制
                        });
                    } else {
                        // 隐藏元素
                        gsap.to(item, {
                            opacity: 0,
                            scale: 0.95,
                            duration: 0.3,
                            onComplete: () => {
                                item.style.display = 'none';
                            }
                        });
                    }
                });
            });
        });
    }

    // ===========================================
    // 导航菜单逻辑 (Mobile Menu)
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
    function initAnimations() {
        initSplitTextAnimations();
        initFadeInAnimations();
        initNavThemeSwap();
    }


    // ===========================================
    // 页面加载完成
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 仅在首页尝试自动播放视频
        if (document.querySelector('.hero-video')) {
             initVideoAutoplay(); 
        }
       
        // 2. 初始化作品筛选功能 (works.html 专用)
        initWorksFilter();
        
        // 3. 初始动画 (SplitText, FadeIn, Nav Swap)
        initAnimations();
    });
}