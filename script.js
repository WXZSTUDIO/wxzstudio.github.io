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
        const fadeInTargets = document.querySelectorAll('.fade-in');

        fadeInTargets.forEach(target => {
            // 确保只选择当前语言的元素
            if (target.classList.contains('hidden')) return;
            
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
        const navWrap = document.querySelector('.nav-wrap');
        
        document.querySelectorAll('.nav-theme-trigger').forEach((trigger, index) => {
            
            // 获取当前 section 的主题
            const section = trigger.closest('.section');
            const theme = section ? section.getAttribute('data-theme') : 'dark';
            const isDark = (theme === 'dark');

            // 创建 ScrollTrigger 实例
            ScrollTrigger.create({
                trigger: trigger,
                start: "top 50%", // 当触发点进入视口中间时
                // markers: true, // 调试用
                onEnter: () => {
                    // 当进入主题对应的 section 时，设置 body 的主题类
                    document.body.classList.toggle('light-theme', !isDark);
                    document.body.setAttribute('data-theme', theme);
                },
                onLeaveBack: () => {
                    // 当离开主题对应的 section 时，恢复到上一个 section 的主题
                    // 由于是遍历，我们可以简单地切换到相反的主题
                    if (index === 0) {
                        // 初始 Hero section 是 dark
                        document.body.classList.remove('light-theme');
                        document.body.setAttribute('data-theme', 'dark');
                    } else {
                        // 切换到上一个 section 的主题
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
        // 1. 初始化横向滚动
        initSlidingText(); 

        // 2. 检查本地存储的语言设置并应用
        const userPreferredLang = localStorage.getItem('userLang') || 'cn'; 
        switchLanguage(userPreferredLang); 
        window.switchLanguage = switchLanguage;
        
        // 3. 初始动画 (SplitText, FadeIn, Nav Swap)
        initAnimations();
    });
}
