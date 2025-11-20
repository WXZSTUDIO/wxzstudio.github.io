// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in index.html.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    document.addEventListener("DOMContentLoaded", () => {
        initParallax(); // 60fps 视差
        initFadeInAnimations(); // 丝滑淡入
        initNavThemeSwap(); // 导航栏变色
        initFloatingButton(); // 悬浮按钮
        initVideoAutoplay(); // 视频自动播放
    });

    // 1. 极致性能视差滚动 (RequestAnimationFrame + Translate3D)
    function initParallax() {
        const heroVideo = document.querySelector('.hero-video-wrapper');
        if (!heroVideo) return;

        let scrollY = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            scrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // 速度系数 0.3，轻微视差
                    heroVideo.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // 2. 元素进入视口动画 (Fade In Up - Silky Smooth)
    function initFadeInAnimations() {
        const fadeInElements = document.querySelectorAll('.fade-in');

        fadeInElements.forEach((el) => {
            const delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
            
            gsap.fromTo(el, 
                { opacity: 0, y: 40 },
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 1.0, // 稍长的持续时间，更优雅
                    delay: delay,
                    ease: "power3.out", // Apple 风格缓动
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%", // 元素顶部进入视口 90% 时触发
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });
    }

    // 3. 导航栏主题切换 (Glassmorphism Adaption)
    function initNavThemeSwap() {
        const body = document.body;
        
        // 仅在首页且有深色/浅色区块时生效
        if (body.classList.contains('is-homepage')) {
            const triggers = document.querySelectorAll('.nav-theme-trigger');
            
            triggers.forEach(trigger => {
                const section = trigger.closest('.section');
                const nextSection = section.nextElementSibling;
                
                if(nextSection && nextSection.classList.contains('section')) {
                    const nextTheme = nextSection.dataset.theme;
                    
                    ScrollTrigger.create({
                        trigger: trigger,
                        start: "bottom top+=60", // 修正触发位置
                        onEnter: () => {
                            if (nextTheme === 'light') body.classList.add('light-theme-nav');
                            else body.classList.remove('light-theme-nav');
                        },
                        onLeaveBack: () => {
                            const currentTheme = section.dataset.theme;
                            if (currentTheme === 'light') body.classList.add('light-theme-nav');
                            else body.classList.remove('light-theme-nav');
                        }
                    });
                }
            });
        } else {
            // 非首页：根据 body class 初始化
            if (body.classList.contains('is-light')) {
                body.classList.add('light-theme-nav');
            }
        }
    }

    // 4. 悬浮返回首页按钮逻辑
    function initFloatingButton() {
        const floatingButton = document.getElementById('floatingBackHome');
        if (!floatingButton) return;

        // 在向下滚动超过 300 像素时显示按钮
        ScrollTrigger.create({
            trigger: document.body,
            start: "top -300px",
            onEnter: () => floatingButton.classList.add('show'),
            onLeaveBack: () => floatingButton.classList.remove('show'),
        });
    }
    
    // 5. 视频自动播放修复
    function initVideoAutoplay() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    video.muted = true;
                    video.play();
                });
            }
        });
    }
}