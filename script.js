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
    document.getElementById('btn-cn-footer').classList.toggle('active', lang === 'cn');
    document.getElementById('btn-kr-footer').classList.toggle('active', lang === 'kr');
    // Mobile Buttons
    document.getElementById('btn-cn-mobile').classList.toggle('active', lang === 'cn');
    document.getElementById('btn-kr-mobile').classList.toggle('active', lang === 'kr');
}


// ===========================================
// 导航菜单逻辑 (Mobile Menu)
// ===========================================
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
const navOverlay = document.getElementById('navOverlay');

function renderMobileNavigationMenu(lang) {
    // 假设 menu data 存在于全局变量 navMenuItems 中 (来自 data/nav_menu.js)
    const menuData = navMenuItems[lang] || []; 

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

// ===========================================
// Dropdown (悬浮下拉菜单) 逻辑 - 修复悬停消失问题
// ===========================================
const dropdownToggler = document.getElementById('propertiesDropdownToggler');
const dropdownMenu = document.getElementById('propertiesDropdown');
let hoverTimeout;

if (dropdownToggler && dropdownMenu) {
    const showDropdown = () => {
        clearTimeout(hoverTimeout);
        if (window.innerWidth > 1024) {
            dropdownMenu.classList.add('active');
        }
    };

    const hideDropdown = () => {
        if (window.innerWidth > 1024) {
            // 设置延迟，给用户将鼠标从toggler移到menu的时间
            hoverTimeout = setTimeout(() => {
                dropdown
