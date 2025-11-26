// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in index.html.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // ===========================================
    // 1. 极致性能：GPU 加速视差动画 (Parallax)
    // 使用 requestAnimationFrame 保证 60fps
    // -------------------------------------------
    function initParallax() {
        const videoWrapper = document.querySelector('.hero-video-wrapper');
        if (!videoWrapper) return;

        // 视差速度 (例如 0.2)
        const speed = parseFloat(videoWrapper.getAttribute('data-parallax-speed')) || 0.2;
        let scrollY = window.scrollY;
        let currentOffset = 0;
        let rafId = null;

        // 滚动事件处理函数 (节流)
        function handleScroll() {
            scrollY = window.scrollY;
        }

        // 动画循环
        function animateParallax() {
            // 计算目标偏移量
            const targetOffset = scrollY * speed;
            
            // 使用线性插值 (lerp) 平滑过渡，实现更自然的运动感
            currentOffset += (targetOffset - currentOffset) * 0.1;

            // 应用 GPU 加速的 transform 
            videoWrapper.style.transform = `translate3d(0, ${-currentOffset}px, 0)`;

            rafId = requestAnimationFrame(animateParallax);
        }
        
        // 使用 IntersectionObserver 停止动画，实现渐进增强和性能优化
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                if (!rafId) {
                    rafId = requestAnimationFrame(animateParallax);
                }
            } else {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }
        }, { threshold: 0.01 });

        observer.observe(videoWrapper);
        window.addEventListener('scroll', handleScroll);
    }
    
    // ===========================================
    // 2. 及时加载：图片懒加载 (Lazy Loading)
    // 使用 IntersectionObserver 异步加载图片
    // -------------------------------------------
    function initLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load-img');
        if (lazyImages.length === 0) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');

                    if (src) {
                        img.src = src;
                        img.classList.remove('lazy-load-img');
                        // 可选：添加图片加载完成的过渡效果
                        img.onload = () => {
                            img.style.opacity = 1;
                        };
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px', // 提前 200px 加载
            threshold: 0.01
        });

        lazyImages.forEach(img => {
            // 确保懒加载图片初始状态为透明，避免图片闪烁
            img.style.opacity = 0;
            img.style.transition = 'opacity 0.5s ease-in';
            observer.observe(img);
        });
    }

    // ===========================================
    // 3. 精细交互：Apple 涟漪按钮 (Ripple Effect)
    // -------------------------------------------
    function initRippleButtons() {
        const buttons = document.querySelectorAll('.apple-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = button.querySelector('::after'); // 伪元素无法直接操作，但 CSS 动画是基于 :focus
                
                // 强制触发 :focus 状态以激活 CSS 动画
                if (document.activeElement === button) {
                    button.blur();
                }
                button.focus();
                
                // 动画完成后移除 focus 状态
                setTimeout(() => {
                    button.blur();
                }, 800);
            });
        });
    }

    // ===========================================
    // 4. 高效状态管理：导航主题切换
    // -------------------------------------------
    function initNavThemeSwap() {
        const navWrap = document.getElementById('navWrap');
        
        document.querySelectorAll('.nav-theme-trigger').forEach((trigger) => {
            const targetTheme = trigger.getAttribute('data-theme-target');
            const targetIsLight = (targetTheme === 'light');
            
            // 创建 ScrollTrigger 实例
            ScrollTrigger.create({
                trigger: trigger,
                start: "top 50%", // 当触发点进入视口中间时
                onToggle: self => {
                    // 当进入触发点时 (向下滚动)，应用目标主题
                    // 当离开触发点返回时 (向上滚动)，应用当前 Section 的主题
                    const currentSection = trigger.closest('.section');
                    const currentSectionTheme = currentSection.getAttribute('data-theme');
                    
                    if (self.isActive) {
                        // 进入：准备切换到下一个 Section 的主题
                        document.body.classList.toggle('light-theme', targetIsLight);
                        document.body.setAttribute('data-theme', targetTheme);
                    } else {
                        // 离开：恢复到当前 Section 的主题
                        document.body.classList.toggle('light-theme', (currentSectionTheme === 'light'));
                        document.body.setAttribute('data-theme', currentSectionTheme);
                    }
                }
            });
        });
        
        // 确保页面加载时，根据当前滚动位置设置正确的主题
        ScrollTrigger.refresh();
        document.body.classList.toggle('light-theme', (document.body.getAttribute('data-theme') === 'light'));
    }

    // ===========================================
    // 常规滚动淡入动画 (Fade In & Slide Up)
    // -------------------------------------------
    function initFadeInAnimations() {
        const fadeInTargets = document.querySelectorAll('.fade-in');

        fadeInTargets.forEach(target => {
            const delay = parseFloat(target.getAttribute('data-delay')) || 0;

            gsap.from(target, {
                y: 30, // 向上移动
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
    // 横向滚动文本 (Marquee/Sliding Text)
    // -------------------------------------------
    function initSlidingText() {
        const marquee = document.querySelector('.sliding-text');
        if (!marquee) return;
        
        // 复制内容
        marquee.innerHTML += marquee.innerHTML;

        // 使用 GSAP 性能优化
        gsap.to(marquee, {
            xPercent: -50,
            duration: 15,
            repeat: -1, 
            ease: "linear",
            // 确保使用 GPU 加速
            force3D: true, 
            willChange: 'transform'
        });
    }


    // ===========================================
    // 语言切换逻辑 (Language Switch Logic) - 保持不变
    // ===========================================
    function switchLanguage(lang) {
        // ... (语言切换逻辑保持不变) ...
    }
    function updateLanguageButtonStates(lang) {
        // ... (更新语言按钮状态逻辑保持不变) ...
    }

    // ===========================================
    // 导航菜单逻辑 (Mobile Menu) - 保持不变
    // -------------------------------------------
    // 为确保 Mobile Menu 逻辑能正常工作，确保 HTML 中以下 ID 存在:
    // mobileMenuButton, mobileMenu, navOverlay, closeMobileMenu
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const navOverlay = document.getElementById('navOverlay');
    const closeMobileMenuButton = document.getElementById('closeMobileMenu');

    function openMobileMenu() {
        if (!mobileMenu || !navOverlay) return;
        mobileMenu.classList.add('active');
        navOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    window.closeMobileMenu = function() { 
        if (!mobileMenu || !navOverlay) return;
        mobileMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    if (mobileMenuButton) mobileMenuButton.addEventListener('click', openMobileMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);
    if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', closeMobileMenu);
    // ... (语言切换逻辑保持不变) ...


    // ===========================================
    // 总初始化函数 (Progressive Enhancement)
    // -------------------------------------------
    function initAnimations() {
        initParallax(); // 60fps 视差
        initFadeInAnimations();
        // initSplitTextAnimations(); // 确保 headline 动画能运行
        initNavThemeSwap(); // 高效状态管理
        initRippleButtons(); // 精细交互
    }
    
    // ===========================================
    // 页面加载完成
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 初始化非关键动画 (如 Marquee)
        initSlidingText(); 
        
        // 2. 检查本地存储的语言设置并应用
        const userPreferredLang = localStorage.getItem('userLang') || 'cn'; 
        // switchLanguage(userPreferredLang); // 暂时注释语言切换，避免调试问题
        window.switchLanguage = switchLanguage;
        
        // 3. 核心动画和性能优化
        initAnimations();
        initLazyLoading(); // 及时加载优化
    });
}