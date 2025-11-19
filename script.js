// ===========================================
// 语言切换逻辑 (Language Switch Logic)
// 语言按钮现在位于页脚
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
    // 更新所有语言切换按钮的 active 状态
    updateLanguageButtonStates(lang);
}

function updateLanguageButtonStates(lang) {
    // Desktop/Footer Buttons
    document.getElementById('btn-cn-footer').classList.toggle('active', lang === 'cn');
    document.getElementById('btn-kr-footer').classList.toggle('active', lang === 'kr');
    // Mobile Buttons
    document.getElementById('btn-cn-mobile').classList.toggle('active', lang === 'cn');
    document.getElementById('btn-kr-mobile').classList.toggle('active', lang === 'kr');
}


// ===========================================
// 导航菜单逻辑 (仅剩移动端菜单)
// ===========================================
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
const navOverlay = document.getElementById('navOverlay');
const primaryNavMenu = document.getElementById('primaryNavMenu');

// 从 data/nav_menu.js 中获取菜单数据，仅用于移动端菜单
function renderMobileNavigationMenu(lang) {
    const menuData = navMenuItems[lang];
    if (!menuData) return; 

    const mobileListContainer = mobileMenu.querySelector('.mobile-menu-list');
    mobileListContainer.innerHTML = ''; 

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
    // 渲染移动端菜单
    const currentLang = localStorage.getItem('userLang') || 'cn';
    renderMobileNavigationMenu(currentLang);
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// ===========================================
// Dropdown (悬浮下拉菜单) 逻辑 - 核心改变
// ===========================================
const dropdownToggler = document.getElementById('propertiesDropdownToggler');
const dropdownMenu = document.getElementById('propertiesDropdown');

if (dropdownToggler && dropdownMenu) {
    // 桌面端使用 Hover 展开菜单
    dropdownToggler.addEventListener('mouseenter', () => {
        if (window.innerWidth > 1024) {
            dropdownMenu.classList.add('active');
        }
    });

    // 鼠标离开 Toggler 或 Menu 时关闭菜单
    const closeDropdown = () => {
        if (window.innerWidth > 1024) {
            dropdownMenu.classList.remove('active');
        }
    };
    dropdownToggler.addEventListener('mouseleave', closeDropdown);
    dropdownMenu.addEventListener('mouseleave', closeDropdown);

    // 移动端使用 Click 切换 (在CSS中实现)
    dropdownToggler.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            e.preventDefault(); 
            dropdownMenu.classList.toggle('active');
        }
    });

    // 点击外部或菜单项后关闭菜单 (适用于移动端/点击)
    document.addEventListener('click', (e) => {
        if (!dropdownToggler.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    });

    // 监听菜单项点击，点击后关闭下拉菜单 (针对移动端/小屏点击)
    dropdownMenu.querySelectorAll('a').forEach(item => {
        item.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
            if (window.innerWidth <= 1024) {
                closeMobileMenu(); // 如果在移动端，也关闭移动菜单
            }
        });
    });
}


// ===========================================
// 初始化
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('userLang') || 'cn';
    switchLanguage(savedLang); // 初始化语言和按钮状态

    if (mobileMenuButton) mobileMenuButton.onclick = openMobileMenu;
    if (document.getElementById('closeMobileMenu')) document.getElementById('closeMobileMenu').onclick = closeMobileMenu;
    if (navOverlay) navOverlay.onclick = closeMobileMenu;
});
