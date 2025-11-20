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
    // 依赖 HTML 结构: <span class="line-wrapper"><span class="line-inner">Text...</span></span>
    // ===========================================
    function initSplitTextAnimations() {
        // 选中所有带有 split-text-target 类的元素
        const targets = document.querySelectorAll('.split-text-target');

        targets.forEach(target => {
            // 针对每个可见的 line-inner 执行动画
            const lines = target.querySelectorAll('.line-inner:not(.hidden)');

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
        const fadeInTargets = document.querySelectorAll('.fade-in');

        fadeInTargets.forEach(target => {
            // 确保只选择当前语言的元素
            if (target.classList.contains('hidden')) return;
            
            // 使用 data-delay 实现错开效果
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
                    // markers: true, // 调试用
                }
            });
        });
    }

    // ===========================================
    // 导航主题切换 (Sticky Nav Swap)
    // ===========================================
    function initNavThemeSwap() {
        // 获取所有主题触发点
        document.querySelectorAll('.nav-theme-trigger').forEach((trigger) => {
            
            const section = trigger.closest('.section');
            const theme = section ? section.getAttribute('data-theme') : 'dark';
            const isDark = (theme === 'dark');

            ScrollTrigger.create({
                trigger: trigger,
                start: "top 50%", // 当触发点进入视口中间时
                end: "bottom 50%",
                // markers: true, // 调试用
                
                onToggle: (self) => {
                    // 仅在当前触发点处于活动状态时更新主题
                    if (self.isActive) {
                        document.body.classList.toggle('light-theme', !isDark);
                    } else {
                        // 当离开或回到顶部时，获取上一个 section 的主题
                        const previousTrigger = self.trigger.previousElementSibling && self.trigger.previousElementSibling.classList.contains('nav-theme-trigger') ? self.trigger.previousElementSibling : null;
                        
                        // 检查触发点的垂直位置
                        const scrollPos = ScrollTrigger.scroller.scrollTop;
                        const triggerPos = self.start;

                        if (scrollPos < triggerPos) {
                             // 向上滚动，恢复到上一个 section 的主题
                            const prevSection = section.previousElementSibling;
                            const prevTheme = prevSection && prevSection.classList.contains('section') ? prevSection.getAttribute('data-theme') : 'dark';

                            document.body.classList.toggle('light-theme', (prevTheme !== 'dark'));
                        } else {
                            // 向下滚动，当前 section 主题已在 onToggle(isActive=true) 中处理
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
        
        // 复制内容，确保内容足够长以实现无缝滚动效果
        marquee.innerHTML += marquee.innerHTML;

        gsap.to(marquee, {
            xPercent: -50,
            duration: 15, // 速度
            repeat: -1, // 无限循环
            ease: "linear",
        });
    }


    // ===========================================
    // 语言切换逻辑 (Language Switch Logic)
    // ===========================================
    function switchLanguage(lang) {
        // 假设中文为 'cn', 英文/韩语为 'kr'
        const cnElements = document.querySelectorAll('.lang-cn');
        const krElements = document.querySelectorAll('.lang-kr');
        
        // 仅处理按钮和页面语言设置
        // 实际多语言内容应在 HTML 中使用 lang-cn/lang-kr 类控制 display:none

        if (lang === 'cn') {
            document.documentElement.lang = 'zh-CN';
            localStorage.setItem('userLang', 'cn');
        } else {
            document.documentElement.lang = 'en'; // 默认为英文
            localStorage.setItem('userLang', 'kr');
        }
        
        updateLanguageButtonStates(lang);
        
        // 重新初始化动画 (因为元素隐藏/显示状态改变)
        // ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        // initAnimations(); 
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
                // 使用 toggle() 来添加或移除 active 类
                btn.classList.toggle('active', btnLang === lang);
                // 绑定点击事件，确保按钮功能正常
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

    // 暴露给全局的函数，以便在 HTML 中的 a 标签中使用 onclick="closeMobileMenu()"
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
        // 暴露 switchLanguage 函数到全局 window 对象，以便 HTML 按钮调用
        window.switchLanguage = switchLanguage; 
        switchLanguage(userPreferredLang); 
        
        // 4. 初始动画 (SplitText, FadeIn, Nav Swap)
        initAnimations();
    });
}