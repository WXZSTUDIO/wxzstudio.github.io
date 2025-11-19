// ===========================================
// 语言切换逻辑 (Language Switch Logic)
// ===========================================
function switchLanguage(lang) {
    const cnElements = document.querySelectorAll('.lang-cn');
    const krElements = document.querySelectorAll('.lang-kr');
    const btnCn = document.getElementById('btn-cn');
    const btnKr = document.getElementById('btn-kr');

    // 切换所有元素的可见性
    if (lang === 'cn') {
        cnElements.forEach(el => el.classList.remove('hidden'));
        krElements.forEach(el => el.classList.add('hidden'));
        btnCn.classList.add('active');
        btnKr.classList.remove('active');
        localStorage.setItem('userLang', 'cn'); // 保存用户语言偏好
    } else {
        cnElements.forEach(el => el.classList.add('hidden'));
        krElements.forEach(el => el.classList.remove('hidden'));
        btnCn.classList.remove('active');
        btnKr.classList.add('active');
        localStorage.setItem('userLang', 'kr'); // 保存用户语言偏好
    }
    // 重新渲染导航菜单以显示新语言
    renderNavigationMenu(lang);
}

// ===========================================
// 导航菜单逻辑 (Navigation Menu Logic)
// ===========================================
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mainNav = document.getElementById('mainNav');
const navOverlay = document.getElementById('navOverlay');
const desktopNavItems = document.getElementById('desktopNavItems');

// 从 data/nav_menu.js 中获取菜单数据
// navMenuItems 应该由外部脚本加载
// 确保 data/nav_menu.js 在 script.js 之前加载

function renderNavigationMenu(lang) {
    const menuData = navMenuItems[lang];
    if (!menuData) return; // 如果没有数据，则退出

    // 清空现有菜单项
    desktopNavItems.innerHTML = '';
    mainNav.innerHTML = `
        <button id="closeMobileMenu" class="close-btn">&times;</button>
        <div class="lang-switch-mobile">
            <button onclick="switchLanguage('cn'); closeMobileMenu();" id="btn-cn-mobile">CN</button>
            <span>|</span>
            <button onclick="switchLanguage('kr'); closeMobileMenu();" id="btn-kr-mobile">KR</button>
        </div>
    `;

    // 重新填充桌面导航
    menuData.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        li.appendChild(a);
        desktopNavItems.appendChild(li);
    });

    // 重新填充移动端导航
    const mobileList = document.createElement('ul');
    menuData.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        a.onclick = closeMobileMenu; // 点击菜单项后关闭菜单
        li.appendChild(a);
        mobileList.appendChild(li);
    });
    mainNav.appendChild(mobileList);

    // 更新移动端语言切换按钮的 active 状态
    const currentLang = localStorage.getItem('userLang') || 'cn';
    document.getElementById('btn-cn-mobile').classList.toggle('active', currentLang === 'cn');
    document.getElementById('btn-kr-mobile').classList.toggle('active', currentLang === 'kr');

    // 重新绑定关闭按钮事件
    document.getElementById('closeMobileMenu').onclick = closeMobileMenu;
}


function openMobileMenu() {
    mainNav.classList.add('active');
    navOverlay.classList.add('active');
    document.body.classList.add('no-scroll'); // 禁止页面滚动
}

function closeMobileMenu() {
    mainNav.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll'); // 恢复页面滚动
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 恢复用户上次选择的语言，如果没有则默认为中文
    const savedLang = localStorage.getItem('userLang') || 'cn';
    switchLanguage(savedLang);

    // 桌面端语言切换按钮激活状态
    document.getElementById('btn-cn').classList.toggle('active', savedLang === 'cn');
    document.getElementById('btn-kr').classList.toggle('active', savedLang === 'kr');

    // 移动菜单事件
    if (mobileMenuButton) mobileMenuButton.onclick = openMobileMenu;
    if (navOverlay) navOverlay.onclick = closeMobileMenu;
});


// ===========================================
// 视频模态框逻辑 (Video Modal Logic)
// ===========================================
const videoModal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');

function showVideoModal(videoId) {
    // 假设 videoId 是 YouTube 视频的 ID (例如，dQw4w9WgXcQ)
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
    videoModal.style.display = 'flex'; // 显示模态框
    document.body.classList.add('no-scroll'); // 禁止页面滚动
}

function closeVideoModal() {
    videoModal.style.display = 'none';
    videoPlayer.innerHTML = ''; // 停止播放 (清除 iframe)
    document.body.classList.remove('no-scroll'); // 恢复页面滚动
}

// 点击模态框背景关闭
window.onclick = function(event) {
    if (event.target == videoModal) {
        closeVideoModal();
    }
}
