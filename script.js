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
            // 尝试播放视频
            const playPromise = heroVideo.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // 视频播放成功
                    console.log("Hero video started successfully.");
                }).catch(error => {
                    // 视频播放失败，执行最终兜底方案：静音后再次尝试播放
                    console.warn("Video auto-play failed. Retrying with explicit mute/play logic.", error);
                    
                    // 确保视频是静音状态 (双重确认)
                    heroVideo.muted = true;
                    heroVideo.play().catch(finalError => {
                        console.error("Final attempt to play video failed:", finalError);
                        // 最终失败时，视频将保持在第一帧，等待用户交互
                    });
                });
            }
        }
    }


    // ===========================================
    // 自定义 SplitText 模拟 (模拟逐行/词动画)
    // -------------------------------------------
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
                        document.body.classList.toggle('light-theme', !isDark);
                    } else {
                        const scrollPos = ScrollTrigger.scroller.scrollTop;
                        const triggerPos = self.start;

                        if (scrollPos < triggerPos) {
                            const prevSection = section.previousElementSibling;
                            const prevTheme = prevSection && prevSection.classList.contains('section') ? prevSection.getAttribute('data-theme') : 'dark';

                            document.body.classList.toggle('light-theme', (prevTheme !== 'dark'));
                        } 
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
        
        marquee.innerHTML += marquee.innerHTML;

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
        // 仅处理按钮和页面语言设置
        if (lang === 'cn') {
            document.documentElement.lang = 'zh-CN';
            localStorage.setItem('userLang', 'cn');
        } else {
            document.documentElement.lang = 'en';
            localStorage.setItem('userLang', 'kr');
        }
        
        updateLanguageButtonStates(lang);
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
                btn.onclick = () => switchLanguage(btnLang);
            }
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
        // 1. 尝试自动播放视频 (移动端修复)
        initVideoAutoplay(); 
        
        // 2. 初始化横向滚动
        initSlidingText(); 

        // 3. 检查本地存储的语言设置并应用
        const userPreferredLang = localStorage.getItem('userLang') || 'cn'; 
        window.switchLanguage = switchLanguage; 
        switchLanguage(userPreferredLang); 
        
        // 4. 初始动画 (SplitText, FadeIn, Nav Swap)
        initAnimations();
    });
}