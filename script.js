// 确保 GSAP 和 ScrollTrigger 已加载
if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error("GSAP or ScrollTrigger is not loaded. Please ensure the CDN links are correct in index.html.");
} else {
    // 注册 ScrollTrigger 插件
    gsap.registerPlugin(ScrollTrigger);

    // ===========================================
    // 1. 极致性能：GPU 加速视差动画 (Parallax)
    // ===========================================
    function initParallax() {
        const videoWrapper = document.querySelector('.hero-video-wrapper');
        if (!videoWrapper) return;

        const speed = 0.2;
        let scrollY = window.scrollY;
        let currentOffset = 0;
        let rafId = null;

        function handleScroll() {
            scrollY = window.scrollY;
        }

        function animateParallax() {
            const targetOffset = scrollY * speed;
            currentOffset += (targetOffset - currentOffset) * 0.1;
            videoWrapper.style.transform = `translate3d(0, ${-currentOffset}px, 0)`;
            rafId = requestAnimationFrame(animateParallax);
        }
        
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
    // ===========================================
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
                        img.onload = () => {
                            img.style.opacity = 1;
                        };
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(img => {
            img.style.opacity = 0;
            img.style.transition = 'opacity 0.5s ease-in';
            observer.observe(img);
        });
    }

    // ===========================================
    // 3. 精细交互：Apple 涟漪按钮 (Ripple Effect)
    // ===========================================
    function initRippleButtons() {
        const buttons = document.querySelectorAll('.apple-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                if (document.activeElement === button) {
                    button.blur();
                }
                button.focus();
                
                setTimeout(() => {
                    button.blur();
                }, 800);
            });
        });
    }

    // ===========================================
    // 4. 高效状态管理：导航主题切换
    // ===========================================
    function initNavThemeSwap() {
        document.querySelectorAll('.nav-theme-trigger').forEach((trigger) => {
            const targetTheme = trigger.getAttribute('data-theme-target');
            const targetIsLight = (targetTheme === 'light');
            
            ScrollTrigger.create({
                trigger: trigger,
                start: "top 50%",
                onToggle: self => {
                    const currentSection = trigger.closest('.section');
                    const currentSectionTheme = currentSection.getAttribute('data-theme');
                    
                    if (self.isActive) {
                        document.body.classList.toggle('light-theme-nav', targetIsLight);
                        document.body.setAttribute('data-theme', targetTheme);
                    } else {
                        document.body.classList.toggle('light-theme-nav', (currentSectionTheme === 'light'));
                        document.body.setAttribute('data-theme', currentSectionTheme);
                    }
                }
            });
        });
        
        ScrollTrigger.refresh();
        document.body.classList.toggle('light-theme-nav', (document.body.getAttribute('data-theme') === 'light'));
    }

    // ===========================================
    // 5. 常规滚动淡入动画
    // ===========================================
    function initFadeInAnimations() {
        const fadeInTargets = document.querySelectorAll('.fade-in');

        fadeInTargets.forEach(target => {
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
    // 6. 横向滚动文本
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
            force3D: true,
            willChange: 'transform'
        });
    }

    // ===========================================
    // 7. 视频弹窗播放器功能 - 修复版
    // ===========================================
    function initVideoModal() {
        const videoModal = document.getElementById('videoModal');
        const modalVideo = document.getElementById('modalVideo');
        const videoClose = document.getElementById('videoClose');
        const videoTitle = document.getElementById('videoTitle');
        const videoDescription = document.getElementById('videoDescription');
        
        if (!videoModal || !modalVideo) {
            console.error("Video modal elements not found");
            return;
        }
        
        // 获取所有作品项
        const portfolioItems = document.querySelectorAll('.portfolio-item[data-video]');
        
        // 为每个作品项添加点击事件
        portfolioItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                const videoSrc = this.getAttribute('data-video');
                const title = this.getAttribute('data-title');
                const description = this.getAttribute('data-description');
                
                console.log("Opening video modal:", videoSrc, title, description);
                
                // 设置视频源和相关信息
                modalVideo.src = videoSrc;
                videoTitle.textContent = title;
                videoDescription.textContent = description;
                
                // 显示弹窗
                videoModal.classList.add('active');
                document.body.classList.add('no-scroll');
                
                // 播放视频
                modalVideo.load(); // 确保视频加载
                modalVideo.play().catch(e => {
                    console.log('自动播放被阻止，需要用户交互:', e);
                });
            });
        });
        
        // 关闭弹窗
        videoClose.addEventListener('click', closeVideoModal);
        
        // 点击弹窗背景关闭
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal.classList.contains('active')) {
                closeVideoModal();
            }
        });
        
        function closeVideoModal() {
            videoModal.classList.remove('active');
            document.body.classList.remove('no-scroll');
            
            // 暂停视频并重置
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
        
        // 视频播放结束处理
        modalVideo.addEventListener('ended', function() {
            // 可选：视频播放结束后自动关闭或显示重播按钮
        });
    }

    // ===========================================
    // 8. URL参数处理
    // ===========================================
    function handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const playVideo = urlParams.get('play');
        
        if (playVideo) {
            const targetItem = document.querySelector(`[data-video*="${playVideo}"]`);
            if (targetItem) {
                setTimeout(() => {
                    targetItem.click();
                }, 500);
            }
        }
    }

    // ===========================================
    // 9. 移动菜单功能
    // ===========================================
    function initMobileMenu() {
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
    }

    // ===========================================
    // 10. 返回顶部按钮功能
    // ===========================================
    function initBackToTop() {
        const backToTopBtn = document.getElementById('floatingBackHome');
        
        if (!backToTopBtn) return;
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ===========================================
    // 总初始化函数
    // ===========================================
    function initAnimations() {
        initParallax();
        initFadeInAnimations();
        initNavThemeSwap();
        initRippleButtons();
        initVideoModal(); // 确保视频弹窗初始化
        handleURLParameters();
        initBackToTop();
    }
    
    // ===========================================
    // 页面加载完成
    // ===========================================
    document.addEventListener('DOMContentLoaded', () => {
        initSlidingText();
        initAnimations();
        initLazyLoading();
        initMobileMenu();
    });
}