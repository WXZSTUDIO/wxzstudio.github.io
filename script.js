// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in index.html.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // ===========================================
    // 1. 极致性能：GPU 加速视差动画 (Parallax)
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

        // 使用 requestAnimationFrame
        if ('requestAnimationFrame' in window) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            animateParallax();
        } else {
            console.warn("requestAnimationFrame not supported for smooth parallax.");
        }

        // 窗口大小变化时重新计算
        window.addEventListener('resize', () => {
            scrollY = window.scrollY; // 重置 scrollY
        });
    }

    // ===========================================
    // 2. 页面元素淡入动画 (Fade In)
    // -------------------------------------------
    function initFadeInAnimations() {
        const fadeInElements = document.querySelectorAll('.fade-in');

        fadeInElements.forEach(el => {
            gsap.from(el, {
                opacity: 0,
                y: 30,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top bottom-=100", // 提前 100px 触发
                    toggleActions: "play none none none",
                    once: true
                }
            });
        });
    }

    // ===========================================
    // 3. 导航栏主题切换 (Nav Theme Swap)
    // -------------------------------------------
    function initNavThemeSwap() {
        const navWrap = document.querySelector('.nav-wrap');
        if (!navWrap) return;

        ScrollTrigger.create({
            start: "top top",
            end: "max", // 滚动到底部
            onUpdate: (self) => {
                const heroSection = document.querySelector('.is-hero');
                const scrollPos = self.scroll();

                // 检查是否在首页的 Hero 区 (通常是暗色)
                if (heroSection && heroSection.getBoundingClientRect().bottom > navWrap.offsetHeight) {
                     // 处于 Hero 区内
                     if (scrollPos > 100) { // 滚动超过 100px 后固定导航栏背景
                         navWrap.classList.add('dark-theme-nav');
                     } else {
                         navWrap.classList.remove('dark-theme-nav');
                     }
                } else {
                    // 处于其他区或不在首页，根据 body class 确定初始主题
                    if (document.body.classList.contains('is-dark')) {
                        navWrap.classList.add('dark-theme-nav');
                        navWrap.classList.remove('light-theme-nav');
                    } else {
                        navWrap.classList.add('light-theme-nav');
                        navWrap.classList.remove('dark-theme-nav');
                    }
                }
            }
        });
    }

    // ===========================================
    // 4. 底部滚动 Marquee 效果 (Sliding Text)
    // -------------------------------------------
    function initSlidingText() {
        gsap.utils.toArray(".sliding-text-container").forEach(container => {
            const direction = container.getAttribute('data-direction') === 'right' ? 1 : -1;
            const speed = parseFloat(container.getAttribute('data-speed')) || 20;
            const inner = container.querySelector('.sliding-text-inner');

            if (!inner) return;

            // 克隆内容以创建无缝循环
            inner.innerHTML += inner.innerHTML;

            gsap.to(inner, {
                xPercent: direction * -100,
                ease: "none",
                duration: speed,
                repeat: -1,
                modifiers: {
                    xPercent: gsap.utils.wrap(direction * -100, 0)
                }
            });
        });
    }

    // ===========================================
    // 5. 波纹按钮效果 (Ripple Buttons)
    // -------------------------------------------
    function initRippleButtons() {
        document.querySelectorAll('.button').forEach(button => {
            button.addEventListener('click', function(e) {
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - (size / 2);
                const y = e.clientY - rect.top - (size / 2);

                const ripple = document.createElement('span');
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                // 移除旧的 ripple，确保只有一个
                button.querySelectorAll('.ripple').forEach(r => r.remove());

                button.appendChild(ripple);

                // 移除动画完成后的 span
                ripple.addEventListener('animationend', function() {
                    ripple.remove();
                });
            });
        });
    }

    // ===========================================
    // 6. 返回顶部按钮 (Back To Top)
    // -------------------------------------------
    function initBackToTop() {
        const backHomeBtn = document.querySelector('.floating-back-home');
        if (!backHomeBtn) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > window.innerHeight) {
                backHomeBtn.classList.add('show');
            } else {
                backHomeBtn.classList.remove('show');
            }
        });

        backHomeBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===========================================
    // 7. 视频播放器弹窗逻辑 (Video Modal Logic) - 新增
    // -------------------------------------------
    function initVideoModal() {
        const modal = document.getElementById('video-modal');
        const closeBtn = document.querySelector('.modal-close-btn');
        const playerContainer = document.getElementById('video-player');
        // 统一使用 .work-item-trigger 类来监听作品点击事件
        const triggerButtons = document.querySelectorAll('.work-item-trigger');

        if (!modal || !playerContainer) return;

        /**
         * 打开模态框并加载视频播放器
         * @param {string} videoId 视频 ID (如 YouTube ID, Vimeo ID)
         * @param {string} source 视频平台 (如 'youtube', 'vimeo')
         */
        function openModal(videoId, source) {
            let iframeSrc = '';
            if (source === 'youtube') {
                // YouTube embed URL (开启自动播放、无水印等)
                iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`;
            } else if (source === 'vimeo') {
                // Vimeo embed URL
                iframeSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
            } else {
                console.error('Unsupported video source:', source);
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.setAttribute('src', iframeSrc);
            iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('frameborder', '0');

            playerContainer.appendChild(iframe);
            modal.classList.add('is-active');
            document.body.style.overflow = 'hidden'; // 阻止背景滚动
        }

        function closeAndStopVideo() {
            modal.classList.remove('is-active');
            // 清空播放器内容以停止视频
            playerContainer.innerHTML = '';
            document.body.style.overflow = ''; // 恢复背景滚动
        }

        // 绑定点击事件到作品封面
        triggerButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止 a 标签的默认跳转行为

                const videoId = this.getAttribute('data-video-id');
                const videoSource = this.getAttribute('data-video-source') || 'youtube'; // 默认 YouTube

                if (videoId) {
                    openModal(videoId, videoSource);
                }
            });
        });

        // 绑定关闭事件
        closeBtn.addEventListener('click', closeAndStopVideo);

        // 点击 Modal 黑色背景关闭
        modal.addEventListener('click', function(e) {
            // 只有点击到 modal 自身（背景）时才关闭
            if (e.target === modal) {
                closeAndStopVideo();
            }
        });

        // 按 ESC 键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                closeAndStopVideo();
            }
        });
    }

    // ===========================================
    // 8. 语言切换逻辑 (Language Switch) - 保持原有
    // -------------------------------------------
    function switchLanguage(lang) {
        // ... (保持您原有的语言切换逻辑) ...
        console.log("Switching language to:", lang);
        localStorage.setItem('userLang', lang);
    }
    
    // ===========================================
    // 总初始化函数 (Progressive Enhancement)
    // -------------------------------------------
    function initAnimations() {
        initParallax(); // 60fps 视差
        initFadeInAnimations();
        initNavThemeSwap(); // 高效状态管理
        initRippleButtons(); // 精细交互
        initBackToTop(); // 返回顶部
    }
    
    // ===========================================
    // 页面加载完成
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        // 1. 初始化非关键动画 (如 Marquee)
        initSlidingText(); 
        
        // 2. 检查本地存储的语言设置并应用 (如果您的原始代码中有这部分，请确保它已保留)
        const userPreferredLang = localStorage.getItem('userLang') || 'cn'; 
        // switchLanguage(userPreferredLang); 
        window.switchLanguage = switchLanguage; // 暴露给 HTML 调用
        
        // 3. 核心动画和性能优化
        initAnimations();

        // 4. 作品弹窗播放器 - 新增
        initVideoModal();
    });
}