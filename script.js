// ===========================================
// 语言切换逻辑 (Language Switch Logic)
// ===========================================
function switchLanguage(lang) {
    const cnElements = document.querySelectorAll('.lang-cn');
    const krElements = document.querySelectorAll('.lang-kr');
    const btnCn = document.getElementById('btn-cn');
    const btnKr = document.getElementById('btn-kr');

    if (lang === 'cn') {
        cnElements.forEach(el => el.classList.remove('hidden'));
        krElements.forEach(el => el.classList.add('hidden'));
        btnCn.classList.add('active');
        btnKr.classList.remove('active');
        localStorage.setItem('userLang', 'cn');
    } else {
        cnElements.forEach(el => el.classList.add('hidden'));
        krElements.forEach(el => el.classList.remove('hidden'));
        btnCn.classList.remove('active');
        btnKr.classList.add('active');
        localStorage.setItem('userLang', 'kr');
    }
    // 重新渲染导航菜单以显示新语言
    renderNavigationMenu(lang);
}

// ===========================================
// 导航菜单逻辑 (Navigation Menu Logic)
// ===========================================
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
const navOverlay = document.getElementById('navOverlay');
const primaryNavMenu = document.getElementById('primaryNavMenu');

// 从 data/nav_menu.js 中获取菜单数据
function renderNavigationMenu(lang) {
    const menuData = navMenuItems[lang];
    if (!menuData) return; 

    // 填充主要菜单 (桌面端和移动端列表)
    const renderList = (container, isMobile = false) => {
        container.innerHTML = ''; // Clear existing
        menuData.forEach(item => {
            if (item.label !== (lang === 'cn' ? "作品" : "포트폴리오")) { // 排除已在下拉菜单中的项
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = item.href;
                a.textContent = item.label;
                if (isMobile) {
                    a.onclick = closeMobileMenu;
                }
                li.appendChild(a);
                container.appendChild(li);
            }
        });
    };

    renderList(primaryNavMenu, false); 
    // 移动端菜单列表需要单独处理，因为它在 #mobileMenu 内部
    const mobileListContainer = mobileMenu.querySelector('.mobile-menu-list');
    if (mobileListContainer) {
        renderList(mobileListContainer, true);
    }

    // 更新移动端语言切换按钮的 active 状态
    const currentLang = localStorage.getItem('userLang') || 'cn';
    document.getElementById('btn-cn-mobile').classList.toggle('active', currentLang === 'cn');
    document.getElementById('btn-kr-mobile').classList.toggle('active', currentLang === 'kr');
}


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

// ===========================================
// Dropdown (悬浮下拉菜单) 逻辑
// ===========================================
const dropdownToggler = document.getElementById('propertiesDropdownToggler');
const dropdownMenu = document.getElementById('propertiesDropdown');

if (dropdownToggler && dropdownMenu) {
    // 桌面端使用 Hover (CSS也可以实现，但JS提供更好的兼容性)
    dropdownToggler.addEventListener('mouseenter', () => dropdownMenu.classList.add('active'));
    dropdownMenu.addEventListener('mouseleave', () => dropdownMenu.classList.remove('active'));

    // 移动端使用 Click 切换
    dropdownToggler.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            e.preventDefault(); 
            dropdownMenu.classList.toggle('active');
        }
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (!dropdownToggler.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
    });
}


// ===========================================
// 视频模态框逻辑 (Video Modal Logic)
// ===========================================
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');

function showVideoModal(videoId) {
    const embedCode = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
        ></iframe>`;
        
    videoPlayer.innerHTML = embedCode;
    videoModal.style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function closeVideoModal() {
    videoModal.style.display = 'none';
    videoPlayer.innerHTML = '';
    document.body.classList.remove('no-scroll');
}

window.onclick = function(event) {
    if (event.target == videoModal) {
        closeVideoModal();
    }
}


// ===========================================
// 初始化
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('userLang') || 'cn';
    switchLanguage(savedLang);

    document.getElementById('btn-cn').classList.toggle('active', savedLang === 'cn');
    document.getElementById('btn-kr').classList.toggle('active', savedLang === 'kr');

    if (mobileMenuButton) mobileMenuButton.onclick = openMobileMenu;
    if (document.getElementById('closeMobileMenu')) document.getElementById('closeMobileMenu').onclick = closeMobileMenu;
    if (navOverlay) navOverlay.onclick = closeMobileMenu;
});
