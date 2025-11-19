// ===========================================
// 语言切换逻辑 (Language Switch Logic)
// ===========================================
function switchLanguage(lang) {
    const cnElements = document.querySelectorAll('.lang-cn');
    const krElements = document.querySelectorAll('.lang-kr');

    // 切换所有元素的显示/隐藏状态
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
    
    // 更新按钮的 active 状态
    updateLanguageButtonStates(lang);
}

function updateLanguageButtonStates(lang) {
    // 检查并更新所有语言切换按钮的状态
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

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// 确保事件监听器已绑定
if (mobileMenuButton) mobileMenuButton.addEventListener('click', openMobileMenu);
if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);
if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', closeMobileMenu);


// ===========================================
// Horizontal Scroll Logic (横向滑动) - 核心修复
// ===========================================
const scrollContainer = document.querySelector('.scrollable-card-wrapper');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');

if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
    const scrollAmount = 400; // 每次滚动的像素数，确保滚动距离足够大

    scrollLeftBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    scrollRightBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
}


// ===========================================
// 初始化 (Initial Setup)
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. 检查本地存储的语言设置并应用
    const userPreferredLang = localStorage.getItem('userLang') || 'cn'; // 默认中文
    switchLanguage(userPreferredLang); 
    
    // 2. 确保将函数暴露给全局，以便 HTML 中的 onclick 能够调用
    window.switchLanguage = switchLanguage;
    window.closeMobileMenu = closeMobileMenu;
});
