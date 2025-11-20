// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in index.html.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // ===========================================
    // 渐进增强：图片延迟加载 (Lazy Loading with IntersectionObserver)
    // -------------------------------------------
    // 提升页面初始加载速度，只加载视口内的图片，采用高性能 API 避免阻塞主线程。
    // ===========================================
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load-img');
        
        // 采用 Progressive Enhancement 策略：优先使用 IntersectionObserver
        if ('IntersectionObserver' in window) {
            let observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        // 1. 加载图片：将 data-src 赋给 src
                        lazyImage.src = lazyImage.dataset.src;
                        // 2. 移除懒加载标记和 data-src
                        lazyImage.classList.remove('lazy-load-img');
                        lazyImage.removeAttribute('data-src');
                        // 3. 停止观察，释放性能
                        observer.unobserve(lazyImage);
                    }
                });
            }, {
                rootMargin: '0px 0px 300px 0px', // 提前 300px 加载，确保 60fps 体验
                threshold: 0.01 // 极小阈值即可触发
            });

            lazyImages.forEach(image => {
                observer.observe(image);
            });
        } else {
            // 渐进增强降级方案：如果不支持，直接加载所有图片
            lazyImages.forEach(image => {
                image.src = image.dataset.src;
                image.classList.remove('lazy-load-img');
                image.removeAttribute('data-src');
            });
        }
    }


    // ===========================================
    // 自定义 SplitText 模拟 (模拟逐行/词动画)
    // ===========================================
    function initSplitTextAnimations() {
        const targets = document.querySelectorAll('.split-text-target');

        targets.forEach(target => {
            if (target.classList.contains('hidden')) return;
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
    // 导航主题切换 (Sticky Nav Swap) - 高效的状态管理
    // ===========================================
    function initNavThemeSwap() {
        const navWrap = document.querySelector('.nav-wrap');
        
        document.querySelectorAll('.nav-theme-trigger').forEach((trigger, index) => {
            
            const section = trigger.closest('.section');
            const theme = section ? section.getAttribute('data-theme') : 'dark';
            const isDark = (theme === 'dark');

            ScrollTrigger.create({
                trigger: trigger,
                start: "top 50%", 
                onEnter: () => {
                    document.body.classList.toggle('light-theme', !isDark);
                    document.body.setAttribute('data-theme', theme);
                },
                onLeaveBack: () => {
                    if (index === 0) {
                        document.body.classList.remove('light-theme');
                        document.body.setAttribute('data-theme', 'dark');
                    } else {
                        const prevSection = document.querySelectorAll('.section')[index];
                        const prevTheme = prevSection ? prevSection.getAttribute('data-theme') : 'dark';
                        document.body.classList.toggle('light-theme', (prevTheme !== 'dark'));
                        document.body.setAttribute('data-theme', prevTheme);
                    }
                }
            });
        });
    }
    
    // ===========================================
    // 横向滚动文本 (Marquee/Sliding Text)
    // ===========================================
    function initSlidingText() {
        const marquee = document.querySelector('.sliding-text');
        if (!marquee) return;
        
        // 复制内容，确保内容足够长以实现无缝滚动效果
        marquee.innerHTML += marquee.innerHTML;

        // 使用线性速度和 xPercent 转换，由 GSAP 优化以确保 60fps
        gsap.to(marquee, {
            xPercent: -50,
            duration: 15,
            repeat: -1,
            ease: "linear",
        });
    }


    // ===========================================
    // 语言切换逻辑 (Language Switch Logic)
    // ===========================================
    function switchLanguage(lang) {
        const cnElements = document.querySelectorAll('.lang-cn');
        const krElements = document.querySelectorAll('.lang-kr');

        if (lang === 'cn') {
            cnElements.forEach(el => el.classList.remove('hidden'));
            krElements.forEach(el => el.classList.add('hidden'));
            document.documentElement.lang = 'zh-CN';
            localStorage.setItem('userLang', 'cn');
        } else {
            cnElements.forEach(el => el.classList.add('hidden'));
            krElements.forEach(el => el.classList.remove('hidden'));
            document.documentElement.lang = 'ko-KR';
            localStorage.setItem('userLang', 'kr');
        }
        
        updateLanguageButtonStates(lang);
        
        // ** 重新初始化动画 ** (因为元素隐藏/显示状态改变)
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        initAnimations(); 
    }

    function updateLanguageButtonStates(lang) {
        const buttons = [
            document.getElementById('btn-cn-footer'),
            document.getElementById('btn-kr-footer'),
            document.getElementById('btn-cn-mobile'),
            document.getElementById('btn-kr-mobile')
        ];

        buttons.forEach(btn => {
            if (btn) {
                const btnLang = btn.id.includes('-cn-') ? 'cn' : 'kr';
                btn.classList.toggle('active', btnLang === lang);
            }
        });
    }

    // ===========================================
    // 导航菜单逻辑 (Mobile Menu) - 已删除过时的侧边栏逻辑
    // ===========================================
    // 原始的 openMobileMenu/closeMobileMenu 函数和事件监听器已删除，以适应新的底部固定横向导航栏设计。


    // ===========================================
    // 总初始化函数
    // ===========================================
    function initAnimations() {
        initSplitTextAnimations();
        initFadeInAnimations();
        initNavThemeSwap();
    }


    // ===========================================
    // 页面加载完成 (Init Sequence)
    // -------------------------------------------
    // 确保按顺序执行：加载优化 -> 状态恢复 -> 动画初始化
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 及时加载优化：图片延迟加载 (性能优化)
        initLazyLoading(); 

        // 2. 初始化横向滚动
        initSlidingText(); 

        // 3. 检查本地存储的语言设置并应用
        const userPreferredLang = localStorage.getItem('userLang') || 'cn'; 
        switchLanguage(userPreferredLang); 
        window.switchLanguage = switchLanguage;
        
        // 4. 初始动画 (SplitText, FadeIn, Nav Swap)
        initAnimations();
    });
}