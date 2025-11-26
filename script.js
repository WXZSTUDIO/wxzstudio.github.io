// =======================================================================
// 1. 模拟数据 (Mock Data) - 用于作品集展示
// isFeatured: true 的作品将自动展示在首页
// =======================================================================

const portfolioData = {
    // 确保涵盖 #明星侧拍 #产品拍摄 #抖音信息流
    videos: [
        { id: 1, type: 'video', title: "Idle 演唱会幕后纪录", description: "艺人 Idle 形象片与演唱会侧拍。", tags: ["明星侧拍"], isFeatured: true, img: "assets/portfolio/video_idle_concert.jpg" },
        { id: 2, type: 'video', title: "COSRX - 新品发布会", description: "产品拍摄与商业活动跟拍。", tags: ["产品拍摄", "商业活动"], isFeatured: true, img: "assets/portfolio/video_cosrx_launch.jpg" },
        { id: 3, type: 'video', title: "抖音信息流 - 美妆种草", description: "为美妆品牌定制的短视频信息流广告。", tags: ["抖音信息流"], isFeatured: false, img: "assets/portfolio/video_douyin_beauty.jpg" },
        { id: 4, type: 'video', title: "ZEROBASONE 采访花絮", description: "男子组合 ZB1 官方采访侧拍。", tags: ["明星侧拍"], isFeatured: false, img: "assets/portfolio/video_zb1_interview.jpg" },
        { id: 5, type: 'video', title: "商业活动 - 新世界免税店", description: "年度 VIP 盛典活动纪实摄影。", tags: ["商业活动"], isFeatured: false, img: "assets/portfolio/video_shinsegae_event.jpg" },
        { id: 6, type: 'video', title: "婚礼旅拍 - 冰岛", description: "浪漫冰岛，永恒定格的爱。", tags: ["婚礼旅拍"], isFeatured: true, img: "assets/portfolio/video_iceland_wedding.jpg" },
        { id: 7, type: 'video', title: "产品摄影 - 珠宝特写", description: "高级珠宝的细节与光影捕捉。", tags: ["产品拍摄"], isFeatured: false, img: "assets/portfolio/video_jewelry_shoot.jpg" },
        { id: 8, type: 'video', title: "汽车广告 - 概念短片", description: "电动汽车的未来主义概念宣传片。", tags: ["短视频拍摄"], isFeatured: false, img: "assets/portfolio/video_car_concept.jpg" },
        { id: 9, type: 'video', title: "Hera 品牌故事", description: "为 HERA 品牌创作的短篇纪录。", tags: ["短视频拍摄"], isFeatured: false, img: "assets/portfolio/video_hera_story.jpg" },
        { id: 10, type: 'video', title: "美食信息流 - 丹普斯", description: "餐饮品牌 TEMPUS 的竖屏内容。", tags: ["抖音信息流"], isFeatured: false, img: "assets/portfolio/video_tempus_food.jpg" },
        { id: 11, type: 'video', title: "IOPE 科技感宣传", description: "生物科技护肤品的质感呈现。", tags: ["产品拍摄"], isFeatured: false, img: "assets/portfolio/video_iope_tech.jpg" },
        { id: 12, type: 'video', title: "内可美 NACIFIC 包装摄影", description: "全系列产品精修摄影，用于电商。", tags: ["产品拍摄"], isFeatured: false, img: "assets/portfolio/video_nacific_pack.jpg" },
    ],
    // 确保涵盖 #网页设计 #社媒设计
    designs: [
        { id: 1, type: 'design', title: "品牌官网 - 网页设计", description: "高端时尚品牌官网的 UI/UX 设计。", tags: ["网页设计"], isFeatured: true, img: "assets/portfolio/design_website_ui.jpg" },
        { id: 2, type: 'design', title: "社媒企划 - HERA 季度视觉", description: "社交媒体主视觉海报、Banner 等。", tags: ["社媒设计"], isFeatured: true, img: "assets/portfolio/design_hera_sns.jpg" },
        { id: 3, type: 'design', title: "品牌标识 - High&Gogo", description: "全新儿童服饰品牌的 Logo 与 VI。", tags: ["品牌标识"], isFeatured: false, img: "assets/portfolio/design_highgogo_vi.jpg" },
        { id: 4, type: 'design', title: "宣传册设计 - Amorepacific", description: "企业年度报告与投资者宣传册排版。", tags: ["平面设计"], isFeatured: false, img: "assets/portfolio/design_ap_brochure.jpg" },
        { id: 5, type: 'design', title: "Banner 设计 - 免税店活动", description: "新世界免税店线上促销活动 Banner。", tags: ["社媒设计"], isFeatured: false, img: "assets/portfolio/design_dutyfree_banner.jpg" },
        { id: 6, type: 'design', title: "产品包装 - IOPE", description: "生物科技系列护肤品外包装设计。", tags: ["平面设计"], isFeatured: false, img: "assets/portfolio/design_iope_package.jpg" },
        { id: 7, type: 'design', title: "Landing Page - 网页设计", description: "活动推广着陆页的界面设计。", tags: ["网页设计"], isFeatured: true, img: "assets/portfolio/design_landing_page.jpg" },
        { id: 8, type: 'design', title: "品牌画册 - ZEROBASONE", description: "粉丝见面会纪念画册设计与印刷指导。", tags: ["平面设计"], isFeatured: false, img: "assets/portfolio/design_zb1_photobook.jpg" },
        { id: 9, type: 'design', title: "社媒设计 - 节日主题", description: "全年各大节日的社交媒体视觉素材包。", tags: ["社媒设计"], isFeatured: false, img: "assets/portfolio/design_holiday_sns.jpg" },
        { id: 10, type: 'design', title: "App 界面 - 概念设计", description: "为健身应用设计的概念 App UI。", tags: ["网页设计"], isFeatured: false, img: "assets/portfolio/design_app_ui.jpg" },
        { id: 11, type: 'design', title: "海报设计 - 品牌发布", description: "年度品牌发布会的主视觉海报。", tags: ["平面设计"], isFeatured: false, img: "assets/portfolio/design_poster_release.jpg" },
        { id: 12, type: 'design', title: "社媒设计 - Idle 宣传", description: "Idle 官方账号的日常内容模板。", tags: ["社媒设计"], isFeatured: false, img: "assets/portfolio/design_idle_sns.jpg" },
    ]
};

// =======================================================================
// 2. 核心功能: 导航 (SPA)
// =======================================================================

/**
 * 根据传入的页面ID显示对应页面，并隐藏其他页面。
 * @param {string} pageId - 目标页面的ID (e.g., 'home', 'video')
 */
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page-view').forEach(page => {
        page.classList.add('hidden');
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        // 确保页面滚动到顶部
        window.scrollTo(0, 0);

        // 更新 URL hash，以便浏览器前进/后退按钮可用
        if (window.location.hash !== '#' + pageId) {
            window.location.hash = pageId;
        }
    }

    // 隐藏移动端菜单
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

/**
 * 根据 URL hash 决定初始页面
 */
function initialPageLoad() {
    const hash = window.location.hash.replace('#', '');
    const validPages = ['home', 'video', 'design', 'contact'];
    if (validPages.includes(hash)) {
        showPage(hash);
    } else {
        showPage('home');
    }
}

// =======================================================================
// 3. 核心功能: 渲染作品集和标签筛选
// =======================================================================

/**
 * 渲染作品集网格
 * @param {string} type - 'videos' 或 'designs'
 * @param {string} filterTag - 用于筛选的标签，或 'All'
 */
function renderPortfolio(type, filterTag = 'All') {
    const data = portfolioData[type];
    const gridId = `${type}-portfolio-grid`;
    const gridElement = document.getElementById(gridId);
    if (!gridElement) return;

    gridElement.innerHTML = ''; // 清空内容

    // 筛选数据
    const filteredData = data.filter(item => 
        filterTag === 'All' || item.tags.includes(filterTag)
    );

    // 渲染筛选后的作品
    filteredData.forEach(item => {
        // 使用占位符图片，并设置 onerror 替代实际作品图片
        const imgUrl = item.img || `https://placehold.co/800x600/1e1e1e/8b5cf6?text=${item.title.replace(/\s/g, '+')}`;
        
        const tagsHtml = item.tags.map(tag => 
            `<span class="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">${tag}</span>`
        ).join(' ');

        const itemHtml = `
            <div class="portfolio-item bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="h-64 overflow-hidden">
                    <img src="${imgUrl}" alt="${item.title}" onerror="this.onerror=null;this.src='https://placehold.co/800x600/1e1e1e/8b5cf6?text=${item.title.replace(/\s/g, '+')}';" class="w-full h-full object-cover transition duration-500 ease-in-out transform hover:scale-105">
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-2">${item.title}</h3>
                    <p class="text-sm text-stone-600 mb-3">${item.description}</p>
                    <div class="flex flex-wrap gap-2">${tagsHtml}</div>
                    ${item.isFeatured ? '<span class="mt-4 inline-block text-sm font-bold text-red-500">⭐ 精选</span>' : ''}
                </div>
            </div>
        `;
        gridElement.insertAdjacentHTML('beforeend', itemHtml);
    });
}

/**
 * 渲染标签筛选器并设置点击事件
 * @param {string} type - 'videos' 或 'designs'
 */
function renderTags(type) {
    const data = portfolioData[type];
    const tagsContainerId = `${type}-tags`;
    const tagsContainer = document.getElementById(tagsContainerId);
    if (!tagsContainer) return;

    tagsContainer.innerHTML = '';

    // 收集所有独特的标签
    let allTags = new Set();
    data.forEach(item => item.tags.forEach(tag => allTags.add(tag)));
    
    const tags = ['All', ...Array.from(allTags)];
    let activeTag = 'All'; // 默认激活 'All'

    tags.forEach(tag => {
        const button = document.createElement('button');
        button.textContent = (tag === 'All' ? '全部作品' : `#${tag}`);
        button.className = 'tag-button px-4 py-2 border rounded-full text-sm font-semibold transition duration-300 whitespace-nowrap';
        
        // 初始状态设置
        if (tag === activeTag) {
            button.classList.add('tag-active', 'bg-purple-600', 'text-white', 'border-purple-600');
        } else {
            button.classList.add('bg-white', 'text-stone-700', 'border-stone-300', 'hover:bg-stone-50');
        }

        button.addEventListener('click', () => {
            // 移除所有按钮的激活状态
            tagsContainer.querySelectorAll('.tag-button').forEach(btn => {
                btn.classList.remove('tag-active', 'bg-purple-600', 'text-white', 'border-purple-600');
                btn.classList.add('bg-white', 'text-stone-700', 'border-stone-300', 'hover:bg-stone-50');
            });
            // 设置当前按钮为激活状态
            button.classList.add('tag-active', 'bg-purple-600', 'text-white', 'border-purple-600');
            button.classList.remove('bg-white', 'text-stone-700', 'border-stone-300', 'hover:bg-stone-50');

            // 重新渲染作品集
            renderPortfolio(type, tag);
        });
        tagsContainer.appendChild(button);
    });
    
    // 初次渲染作品
    renderPortfolio(type, activeTag);
}

/**
 * 渲染首页的精选作品
 */
function renderFeaturedWorks() {
    const featuredContainer = document.getElementById('featured-works-grid');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = '';
    
    // 筛选所有精选作品，并限制数量（视频和设计各选取一部分）
    const featuredVideos = portfolioData.videos.filter(item => item.isFeatured).slice(0, 3);
    const featuredDesigns = portfolioData.designs.filter(item => item.isFeatured).slice(0, 3);

    const allFeatured = [...featuredVideos, ...featuredDesigns].slice(0, 6); // 只取前6个

    allFeatured.forEach(item => {
        const page = item.type === 'video' ? 'video' : 'design';
        const typeLabel = item.type === 'video' ? '视频作品' : '平面设计';
        const imgUrl = item.img || `https://placehold.co/800x600/1e1e1e/8b5cf6?text=${item.title.replace(/\s/g, '+')}`;
        
        const itemHtml = `
            <a href="#${page}" class="portfolio-item bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer" onclick="showPage('${page}')">
                <div class="h-48 overflow-hidden">
                    <img src="${imgUrl}" alt="${item.title}" onerror="this.onerror=null;this.src='https://placehold.co/800x600/1e1e1e/8b5cf6?text=${item.title.replace(/\s/g, '+')}';" class="w-full h-full object-cover transition duration-500 ease-in-out transform hover:scale-105">
                </div>
                <div class="p-4">
                    <span class="text-xs font-semibold text-purple-600 uppercase">${typeLabel}</span>
                    <h3 class="text-lg font-bold mt-1">${item.title}</h3>
                </div>
            </a>
        `;
        featuredContainer.insertAdjacentHTML('beforeend', itemHtml);
    });
}

// =======================================================================
// 4. 工具函数: 剪贴板和提示
// =======================================================================

/**
 * 复制文本到剪贴板，并显示自定义提示
 * @param {string} textToCopy - 要复制的文本
 * @param {string} messageBoxId - 提示框的ID
 */
function copyToClipboard(textToCopy, messageBoxId) {
    // 使用 document.execCommand('copy') 确保在 iFrame 环境中可用
    const tempInput = document.createElement('input');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        // 显示提示
        const messageBox = document.getElementById(messageBoxId);
        const messageText = document.getElementById(messageBoxId + '-text');
        if (messageText) {
            messageText.textContent = `ID "${textToCopy}" 已复制到剪贴板！`;
        }
        if (messageBox) {
            messageBox.classList.remove('hidden');
            messageBox.classList.add('flex');
        }
    } catch (err) {
        console.error('无法复制文本: ', err);
        // 显示失败提示
        const messageBox = document.getElementById(messageBoxId);
        const messageText = document.getElementById(messageBoxId + '-text');
        if (messageText) {
            messageText.textContent = '复制失败，请手动复制: ' + textToCopy;
        }
        if (messageBox) {
            messageBox.classList.remove('hidden');
            messageBox.classList.add('flex');
        }
    }
    document.body.removeChild(tempInput);
}

// =======================================================================
// 5. 初始化
// =======================================================================

/**
 * 初始化应用程序：渲染内容和设置事件监听
 */
window.onload = function() {
    // 1. 设置初始页面 (根据 URL Hash)
    initialPageLoad();

    // 2. 渲染作品集内容和标签
    renderTags('videos');
    renderTags('designs');

    // 3. 渲染首页精选作品
    renderFeaturedWorks();

    // 4. 移动端菜单切换
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // 5. 监听 URL hash 变化，实现前进/后退按钮导航
    window.addEventListener('hashchange', initialPageLoad);
};