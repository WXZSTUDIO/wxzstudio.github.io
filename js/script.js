// 数据模拟 - 实际作品数据
// 确保图片路径与您创建的文件夹结构一致 (assets/images/...)
const worksData = {
    video: [
        {
            id: 'v1',
            type: 'video',
            title: 'ZEROBASEONE 侧拍花絮',
            description: '为韩流男团ZEROBASEONE拍摄的幕后花絮视频。',
            tags: ['明星侧拍', '短视频'],
            imageUrl: 'assets/images/video-previews/video-1.jpg',
            isFeatured: true
        },
        {
            id: 'v2',
            type: 'video',
            title: 'Hera 新产品宣传片',
            description: '高端化妆品Hera的社交媒体产品推广视频。',
            tags: ['产品拍摄', '抖音信息流'],
            imageUrl: 'assets/images/video-previews/video-2.jpg',
            isFeatured: false
        },
        {
            id: 'v3',
            type: 'video',
            title: 'idle 演唱会记录',
            description: 'IDLE演唱会官方纪录片，捕捉舞台精彩瞬间。',
            tags: ['明星侧拍'],
            imageUrl: 'assets/images/video-previews/video-3.jpg',
            isFeatured: true
        },
        // 确保至少10个作品
        { id: 'v4', type: 'video', title: 'COSREX 达人合作', description: '美妆达人产品推广短片。', tags: ['产品拍摄', '抖音信息流'], imageUrl: 'assets/images/video-previews/video-4.jpg', isFeatured: false },
        { id: 'v5', type: 'video', title: 'IOPE 旅拍广告', description: '与户外主题相结合的护肤品广告。', tags: ['产品拍摄'], imageUrl: 'assets/images/video-previews/video-5.jpg', isFeatured: false },
        { id: 'v6', type: 'video', title: '商业活动速剪', description: '新世界免税店品牌发布会快速回顾。', tags: ['商业活动'], imageUrl: 'assets/images/video-previews/video-6.jpg', isFeatured: false },
        { id: 'v7', type: 'video', title: 'WXZ Studio 品牌片', description: 'WXZ Studio 视觉宣传片。', tags: ['品牌形象'], imageUrl: 'assets/images/video-previews/video-7.jpg', isFeatured: false },
        { id: 'v8', type: 'video', title: '内可美 产品系列', description: '针对电商平台的产品演示视频。', tags: ['产品拍摄', '抖音信息流'], imageUrl: 'assets/images/video-previews/video-8.jpg', isFeatured: false },
        { id: 'v9', type: 'video', title: '丹普斯 high&gogo 露营', description: '户外用品的氛围感短片。', tags: ['产品拍摄'], imageUrl: 'assets/images/video-previews/video-9.jpg', isFeatured: false },
        { id: 'v10', type: 'video', title: '旅拍样片：首尔', description: '个人创意旅拍作品。', tags: ['旅拍'], imageUrl: 'assets/images/video-previews/video-10.jpg', isFeatured: false }
    ],
    graphic: [
        {
            id: 'g1',
            type: 'graphic',
            title: '品牌官网设计',
            description: '为某科技公司设计的响应式网站界面。',
            tags: ['网页设计'],
            imageUrl: 'assets/images/graphic-previews/graphic-1.jpg',
            isFeatured: true
        },
        {
            id: 'g2',
            type: 'graphic',
            title: 'Hera 新品社媒海报',
            description: '用于Instagram和微信的系列宣传海报。',
            tags: ['社媒设计'],
            imageUrl: 'assets/images/graphic-previews/graphic-2.jpg',
            isFeatured: false
        },
        {
            id: 'g3',
            type: 'graphic',
            title: '爱茉莉太平洋年报视觉',
            description: '公司年度报告的内页和封面设计。',
            tags: ['平面设计'],
            imageUrl: 'assets/images/graphic-previews/graphic-3.jpg',
            isFeatured: true
        },
        // 确保至少10个作品
        { id: 'g4', type: 'graphic', title: '品牌Logo设计', description: 'WXZ Studio 极简主义Logo设计。', tags: ['品牌标识'], imageUrl: 'assets/images/graphic-previews/graphic-4.jpg', isFeatured: false },
        { id: 'g5', type: 'graphic', title: '新世界免税店 Banner', description: '网站主页轮播图设计。', tags: ['网页设计'], imageUrl: 'assets/images/graphic-previews/graphic-5.jpg', isFeatured: false },
        { id: 'g6', type: 'graphic', title: '社媒模板：美食主题', description: '系列社媒帖子模板设计。', tags: ['社媒设计'], imageUrl: 'assets/images/graphic-previews/graphic-6.jpg', isFeatured: false },
        { id: 'g7', type: 'graphic', title: 'COSREX 产品包装', description: '新系列产品的包装设计概念。', tags: ['平面设计'], imageUrl: 'assets/images/graphic-previews/graphic-7.jpg', isFeatured: false },
        { id: 'g8', type: 'graphic', title: '活动邀请函', description: '线上下混合活动数字邀请函。', tags: ['平面设计'], imageUrl: 'assets/images/graphic-previews/graphic-8.jpg', isFeatured: false },
        { id: 'g9', type: 'graphic', title: 'Landing Page 设计', description: '新品发布落地页设计。', tags: ['网页设计'], imageUrl: 'assets/images/graphic-previews/graphic-9.jpg', isFeatured: false },
        { id: 'g10', type: 'graphic', title: '社媒设计：动态图', description: '用于快拍的动态GIF设计。', tags: ['社媒设计'], imageUrl: 'assets/images/graphic-previews/graphic-10.jpg', isFeatured: false }
    ]
};

/**
 * 渲染单个作品卡片
 * @param {Object} work - 作品对象
 * @returns {string} HTML字符串
 */
function createWorkItemHTML(work) {
    const featuredTag = work.isFeatured ? '<p class="is-featured">★ 精选作品</p>' : '';
    return `
        <div class="work-item" data-tags="${work.tags.join(',')}">
            <img src="${work.imageUrl}" alt="${work.title}" loading="lazy">
            <div class="work-item-info">
                <h3>${work.title}</h3>
                <p>${work.description}</p>
                ${featuredTag}
                <p class="work-tags">${work.tags.map(tag => `#${tag}`).join(' ')}</p>
            </div>
        </div>
    `;
}

/**
 * 筛选作品集
 * @param {string} type - 'video' 或 'graphic'
 * @param {string} tag - 标签名称，'all' 为全部
 */
function filterWorks(type, tag) {
    const containerId = type === 'video' ? 'video-works-container' : 'graphic-works-container';
    const container = document.getElementById(containerId);
    if (!container) return;

    const items = container.querySelectorAll('.work-item');
    
    items.forEach(item => {
        const itemTags = item.getAttribute('data-tags').split(',');
        const shouldShow = tag === 'all' || itemTags.includes(tag);

        if (shouldShow) {
            item.classList.remove('hidden');
            item.style.display = 'block'; // 确保显示
        } else {
            // 使用classList.add('hidden')配合CSS transition实现隐藏动画
            item.classList.add('hidden');
            // 延迟设置display: none，让动画完成
            setTimeout(() => {
                 if (item.classList.contains('hidden')) {
                    item.style.display = 'none';
                 }
            }, 500); 
        }
    });
}


/**
 * 初始化作品集页面（视频作品或平面设计作品）
 * @param {string} type - 'video' 或 'graphic'
 */
function initializeWorksPage(type) {
    const containerId = type === 'video' ? 'video-works-container' : 'graphic-works-container';
    const container = document.getElementById(containerId);
    const data = worksData[type];

    if (container && data) {
        // 1. 渲染所有作品
        container.innerHTML = data.map(createWorkItemHTML).join('');

        // 2. 绑定标签筛选事件
        const tagButtons = document.querySelectorAll('.tag-filter-container .tag-button');
        tagButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 更新激活状态
                tagButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // 筛选作品
                filterWorks(type, button.getAttribute('data-tag'));
            });
        });
    }
}

/**
 * 初始化首页 (精选作品)
 */
function initializeHomePage() {
    const container = document.getElementById('featured-works-container');
    if (!container) return;

    // 筛选出精选作品 (最多取前3个视频和前3个平面设计，共6个)
    const featuredVideos = worksData.video.filter(w => w.isFeatured).slice(0, 3);
    const featuredGraphics = worksData.graphic.filter(w => w.isFeatured).slice(0, 3);
    
    const featuredWorks = [...featuredVideos, ...featuredGraphics];

    if (featuredWorks.length > 0) {
        container.innerHTML = featuredWorks.map(createWorkItemHTML).join('');
    } else {
        container.innerHTML = '<p>暂无精选作品展示，请查看完整作品集。</p>';
    }
}


// ====================================
// 核心逻辑: 页面加载完成后的操作
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    // 汉堡菜单逻辑 (移动端)
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            mobileNav.classList.toggle('open');
            // 确保点击时页面不会滚动（阻止body滚动）
            document.body.classList.toggle('no-scroll', mobileNav.classList.contains('open'));
        });
    }

    // 根据当前页面URL判断需要执行的初始化函数
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path === '/' || path === '') {
        initializeHomePage();
    } else if (path.endsWith('video-works.html')) {
        // 视频作品页的初始化逻辑在 video-works.html 内部
    } else if (path.endsWith('graphic-works.html')) {
        // 平面设计作品页的初始化逻辑在 graphic-works.html 内部
    }
});

// 移除移动端菜单打开时阻止body滚动 (CSS控制)
document.addEventListener('scroll', () => {
    // 这里可以添加滚动优化，例如导航栏变色
});