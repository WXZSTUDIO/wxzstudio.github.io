// ===========================================
// 语言切换逻辑 (Language Switch Logic)
// ===========================================
function switchLanguage(lang) {
    const cnElements = document.querySelectorAll('.lang-cn');
    const krElements = document.querySelectorAll('.lang-kr');

    if (lang === 'cn') {
        cnElements.forEach(el => el.classList.remove('hidden'));
        krElements.forEach(el => el.classList.add('hidden'));
        localStorage.setItem('userLang', 'cn');
    } else {
        cnElements.forEach(el => el.classList.add('hidden'));
        krElements.forEach(el => el.classList.remove('hidden'));
        localStorage.setItem('userLang', 'kr');
    }
    updateLanguageButtonStates(lang);
    renderMobileNavigationMenu(lang); // 确保移动端菜单语言同步
}

function updateLanguageButtonStates(lang) {
    // Desktop/Footer Buttons
    const btnCnFooter = document.getElementById('btn-cn-footer');
    const btnKrFooter = document.getElementById('btn-kr-footer');
    // Mobile Buttons
    const btnCnMobile = document.getElementById('btn-cn-mobile');
    const btnKrMobile = document.getElementById('btn-kr-mobile');

    if (btnCnFooter) btnCnFooter.classList.toggle('active', lang === 'cn');
    if (btnKrFooter) btnKrFooter.classList.toggle('active', lang === 'kr');
    if (btnCnMobile) btnCnMobile.classList.toggle('active', lang === 'cn');
    if (btnKrMobile) btnKrMobile.classList.toggle('active', lang === 'kr');
}


// ===========================================
// 导航菜单逻辑 (Mobile Menu)
// ===========================================
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
const navOverlay = document.getElementById('navOverlay');
const closeMobileMenuButton = document.getElementById('closeMobileMenu');

function renderMobileNavigationMenu(lang) {
    // 假设 menu data 存在于全局变量 navMenuItems 中 (来自 data/nav_menu.js)
    // 检查 navMenuItems 是否存在，以防 data/nav_menu.js 未加载
    const menuData = (typeof navMenuItems !== 'undefined' && navMenuItems[lang]) ? navMenuItems[lang] : [];  

    const mobileListContainer = mobileMenu.querySelector('.mobile-menu-list');
    if (!mobileListContainer) return;

    mobileListContainer.innerHTML = ''; 

    // 添加核心服务到移动端菜单
    menuData.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        a.onclick = closeMobileMenu;
        li.appendChild(a);
        mobileListContainer.appendChild(li);
    });
}

function openMobileMenu() {
    mobileMenu.classList.add('active');
    navOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
    const currentLang = localStorage.getItem('userLang') || 'cn';
    renderMobileNavigationMenu(currentLang);
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// 事件监听器
if (mobileMenuButton) mobileMenuButton.addEventListener('click', openMobileMenu);
if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);
if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', closeMobileMenu);


// ===========================================
// Dropdown (悬浮下拉菜单) 逻辑
// ===========================================
const dropdownToggler = document.getElementById('propertiesDropdownToggler');
const dropdownMenu = document.getElementById('propertiesDropdown');
let hoverTimeout;

if (dropdownToggler && dropdownMenu) {
    const showDropdown = () => {
        clearTimeout(hoverTimeout);
        // 仅在 PC 端 (宽度 > 1024px) 响应悬停
        if (window.innerWidth > 1024) {
            dropdownMenu.classList.add('active');
        }
    };

    const hideDropdown = () => {
        if (window.innerWidth > 1024) {
            // 设置延迟，给用户将鼠标从toggler移到menu的时间
            hoverTimeout = setTimeout(() => {
                dropdownMenu.classList.remove('active');
            }, 300); // 300ms 延迟
        }
    };

    // PC 端：悬停事件
    dropdownToggler.addEventListener('mouseenter', showDropdown);
    dropdownToggler.addEventListener('mouseleave', hideDropdown);
    dropdownMenu.addEventListener('mouseenter', showDropdown); // 移到菜单上保持显示
    dropdownMenu.addEventListener('mouseleave', hideDropdown); // 移出菜单后延迟隐藏

    // 移动端/点击事件：切换显示 (无论屏幕大小)
    dropdownToggler.addEventListener('click', (e) => {
        e.preventDefault();
        // 阻止移动端点击时触发悬停逻辑的 showDropdown
        clearTimeout(hoverTimeout); 
        dropdownMenu.classList.toggle('active');
    });

    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!dropdownToggler.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    });
}


// ===========================================
// Horizontal Scroll Logic (横向滑动) - 新增/修复的部分
// ===========================================
const scrollContainer = document.querySelector('.scrollable-card-wrapper');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');

if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
    const scrollAmount = 350; // 每次滚动的像素数 (略大于单个卡片宽度)

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
    // 检查本地存储的语言设置
    const userPreferredLang = localStorage.getItem('userLang') || 'cn'; // 默认中文
    switchLanguage(userPreferredLang); 
});

// 将 switchLanguage 函数暴露给全局 (因为 HTML 中使用了 onclick="switchLanguage('cn')")
window.switchLanguage = switchLanguage;
window.closeMobileMenu = closeMobileMenu;
