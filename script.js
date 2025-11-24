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
        
        // 使用 RAF 来驱动动画
        window.addEventListener('scroll', handleScroll, { passive: true });
        rafId = requestAnimationFrame(animateParallax);
        
        // 确保在页面卸载时清理
        document.addEventListener('unload', () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', handleScroll);
        });
    }


    // ===========================================
    // 2. 交互：元素渐入动画 (Fade In)
    // -------------------------------------------
    function initFadeInAnimations() {
        gsap.utils.toArray('.fade-in').forEach(element => {
            // 检查是否有延迟类
            const delay = parseFloat(element.classList.contains('delay-2') ? 0.2 : 0) + 
                          parseFloat(element.classList.contains('delay-3') ? 0.3 : 0) +
                          parseFloat(element.classList.contains('delay-4') ? 0.4 : 0) +
                          parseFloat(element.classList.contains('delay-5') ? 0.5 : 0);

            gsap.fromTo(element, 
                { opacity: 0, y: 30 }, 
                {
                    opacity: 1, 
                    y: 0,
                    duration: 0.8,
                    delay: delay,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 90%", // 当元素顶部进入视口 90% 时开始
                        toggleActions: "play none none none"
                    }
                }
            );
        });
    }

    // ===========================================
    // 3. 导航主题颜色切换 (Nav Theme Swap)
    // -------------------------------------------
    function initNavThemeSwap() {
        const sections = gsap.utils.toArray('.section');
        const body = document.body;

        sections.forEach(section => {
            const theme = section.getAttribute('data-theme'); // 'dark' or 'light'
            if (theme && section.classList.contains('is-hero')) {
                 // 首页 Hero Section: 导航默认为深色
                return;
            }
            if (theme) {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top top+=" + (window.innerHeight / 2), // 当 section 顶部进入屏幕中央
                    end: "bottom top+=" + (window.innerHeight / 2),
                    // 当 section 占据屏幕中央时，body 切换到不同的主题类
                    onEnter: () => body.classList.toggle('light-theme-nav', theme === 'light'),
                    onLeave: () => body.classList.toggle('light-theme-nav', theme === 'light'),
                    onEnterBack: () => body.classList.toggle('light-theme-nav', theme === 'light'),
                    onLeaveBack: () => body.classList.toggle('light-theme-nav', theme === 'light')
                });
            }
        });
        
        // 处理非首页且主题为 light 的情况 (如 works.html, contact.html)
        if (body.classList.contains('is-other-page')) {
            body.classList.add('light-theme-nav');
        }
    }


    // ===========================================
    // 4. 滚动到顶部按钮 (Back to Top)
    // -------------------------------------------
    function initBackToTop() {
        const button = document.getElementById('back-to-top');
        if (!button) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ===========================================
    // 5. Works 页面视频详情展开/收起逻辑 (NEW)
    // -------------------------------------------
    function initWorkDetailToggle() {
        const triggers = document.querySelectorAll('.work-cover-trigger');
        let activeDetail = null;

        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 找到当前的 work-item-wrapper
                const wrapper = trigger.closest('.work-item-wrapper');
                const detailSection = wrapper.querySelector('.work-detail-section');
                const videoElement = detailSection.querySelector('.work-video');

                // 如果点击的是当前已展开的详情，则收起
                if (detailSection.classList.contains('active')) {
                    // 收起当前详情
                    toggleDetail(detailSection, false, videoElement);
                    activeDetail = null;
                } else {
                    // 如果存在其他已展开的详情，先收起它
                    if (activeDetail && activeDetail !== detailSection) {
                        const activeVideo = activeDetail.querySelector('.work-video');
                        toggleDetail(activeDetail, false, activeVideo);
                    }
                    
                    // 展开新的详情
                    toggleDetail(detailSection, true, videoElement);
                    activeDetail = detailSection;
                }
            });
        });

        /**
         * 展开/收起详情区域
         * @param {HTMLElement} detailSection - 详情区域元素
         * @param {boolean} shouldExpand - true 为展开，false 为收起
         * @param {HTMLVideoElement} videoElement - 视频元素
         */
        function toggleDetail(detailSection, shouldExpand, videoElement) {
            const detailInner = detailSection.querySelector('.detail-inner');

            if (shouldExpand) {
                // 1. 立即设置可见性，并获取目标高度
                detailSection.style.height = 'auto';
                const targetHeight = detailInner.offsetHeight; // 获取内容实际高度
                
                // 2. 将 height 设为 0 以准备动画
                detailSection.style.height = '0px';

                // 3. 运行展开动画 (使用 gsap 性能更好)
                gsap.to(detailSection, {
                    height: targetHeight,
                    opacity: 1,
                    paddingTop: 30, // 增加动画过程中的 padding
                    paddingBottom: 30,
                    duration: 0.5,
                    ease: "power2.out",
                    onStart: () => {
                        detailSection.classList.add('active');
                        // 确保视频暂停
                        if (videoElement) videoElement.pause();
                    },
                    onComplete: () => {
                        // 动画完成后，将 height 设为 auto，防止内容溢出
                        detailSection.style.height = 'auto';
                        // 自动滚动到视频上方
                        scrollToElement(detailSection);
                        // 自动播放视频 (移动端可能有限制，但尝试播放)
                        if (videoElement) videoElement.play().catch(e => console.log("Video auto-play prevented:", e));
                    }
                });

            } else {
                // 收起动画
                gsap.to(detailSection, {
                    height: 0,
                    opacity: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    duration: 0.4,
                    ease: "power2.in",
                    onStart: () => {
                        // 暂停视频
                        if (videoElement) {
                            videoElement.pause();
                            // 重置到第一帧
                            videoElement.currentTime = 0;
                        }
                    },
                    onComplete: () => {
                        detailSection.classList.remove('active');
                        // 清理 style 属性
                        detailSection.removeAttribute('style');
                    }
                });
            }
        }
        
        // 滚动函数，将目标元素滚动到视口顶部
        function scrollToElement(element) {
            const offset = document.querySelector('.nav-wrap').offsetHeight + 20; // 考虑顶部导航高度
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }

    // ===========================================
    // 6. 额外动画：滑动文字 Marquee
    // -------------------------------------------
    function initSlidingText() {
        const marquee = document.querySelector('.sliding-text-track');
        if (!marquee) return;
        
        gsap.to(marquee, {
            x: '-100%',
            duration: 30, // 滚动时间
            ease: 'none',
            repeat: -1,
            modifiers: {
                x: x => (parseFloat(x) % marquee.offsetWidth) + 'px'
            }
        });
    }

    // ===========================================
    // 7. 按钮水波纹效果 (Ripple Effect)
    // -------------------------------------------
    function initRippleButtons() {
        document.querySelectorAll('.button, .nav-contact-btn').forEach(button => {
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
    // 总初始化函数
    // -------------------------------------------
    function initAnimations() {
        initParallax(); 
        initFadeInAnimations();
        initNavThemeSwap(); 
        initRippleButtons(); 
        initBackToTop(); 
        
        // Works 页面专用功能
        if (document.body.classList.contains('is-other-page') && document.title.includes('案例作品')) {
            initWorkDetailToggle();
        }
    }
    
    // ===========================================
    // 页面加载完成
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        initSlidingText(); 
        
        // 核心动画和性能优化
        initAnimations();
    });
}