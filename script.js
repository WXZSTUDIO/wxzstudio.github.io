// --------- 数据源（示例） ---------
// 请把 img 字段的路径替换为 assets/images/videos/*.jpg 或 assets/images/designs/*.jpg
const works = [
  // 视频类（10）
  {id:'v1',category:'video',tags:['明星侧拍','抖音信息流'],featured:true,title:'明星侧拍 · 片场花絮',img:'assets/images/videos/video1.jpg',desc:'短片 / 30s' },
  {id:'v2',category:'video',tags:['产品拍摄'],featured:false,title:'COSRX 产品静物',img:'assets/images/videos/video2.jpg',desc:'电商商品摄影'},
  {id:'v3',category:'video',tags:['抖音信息流'],featured:true,title:'信息流广告生活方式',img:'assets/images/videos/video3.jpg',desc:'15s 广告素材'},
  {id:'v4',category:'video',tags:['产品拍摄'],featured:false,title:'料理摄影示范',img:'assets/images/videos/video4.jpg',desc:'美食拍摄'},
  {id:'v5',category:'video',tags:['明星侧拍'],featured:false,title:'活动记录 · 现场花絮',img:'assets/images/videos/video5.jpg',desc:'活动纪录'},
  {id:'v6',category:'video',tags:['抖音信息流','产品拍摄'],featured:false,title:'家电示范短片',img:'assets/images/videos/video6.jpg',desc:'产品短片'},
  {id:'v7',category:'video',tags:['产品拍摄'],featured:true,title:'HERA 广告拍摄',img:'assets/images/videos/video7.jpg',desc:'广告级拍摄'},
  {id:'v8',category:'video',tags:['明星侧拍'],featured:false,title:'艺人专访短片',img:'assets/images/videos/video8.jpg',desc:'档案短片'},
  {id:'v9',category:'video',tags:['抖音信息流'],featured:false,title:'餐饮信息流素材',img:'assets/images/videos/video9.jpg',desc:'信息流素材'},
  {id:'v10',category:'video',tags:['产品拍摄','抖音信息流'],featured:false,title:'小家电视觉短片',img:'assets/images/videos/video10.jpg',desc:'短视频'},

  // 设计类（10）
  {id:'d1',category:'design',tags:['网页设计'],featured:true,title:'品牌官网重构',img:'assets/images/designs/design1.jpg',desc:'视觉系统/响应式'},
  {id:'d2',category:'design',tags:['社媒设计'],featured:false,title:'夏季社媒海报',img:'assets/images/designs/design2.jpg',desc:'活动模板'},
  {id:'d3',category:'design',tags:['网页设计'],featured:false,title:'产品页视觉',img:'assets/images/designs/design3.jpg',desc:'转化优化'},
  {id:'d4',category:'design',tags:['社媒设计'],featured:true,title:'短视频封面模板',img:'assets/images/designs/design4.jpg',desc:'品牌一致'},
  {id:'d5',category:'design',tags:['社媒设计'],featured:false,title:'节日推广图',img:'assets/images/designs/design5.jpg',desc:'多平台适配'},
  {id:'d6',category:'design',tags:['网页设计'],featured:false,title:'Landing Page 设计',img:'assets/images/designs/design6.jpg',desc:'A/B 测试特性'},
  {id:'d7',category:'design',tags:['社媒设计'],featured:false,title:'社群贴纸包',img:'assets/images/designs/design7.jpg',desc:'互动素材'},
  {id:'d8',category:'design',tags:['网页设计'],featured:false,title:'产品详情视觉',img:'assets/images/designs/design8.jpg',desc:'模块化组件'},
  {id:'d9',category:'design',tags:['社媒设计'],featured:false,title:'图文排版模板',img:'assets/images/designs/design9.jpg',desc:'可复用模板'},
  {id:'d10',category:'design',tags:['网页设计','社媒设计'],featured:false,title:'整合推广视觉',img:'assets/images/designs/design10.jpg',desc:'跨渠道视觉'},
];

// --------- 站点初始化 ---------
document.addEventListener('DOMContentLoaded', ()=>{
  populateClients();
  populateWorksOnPages();
  populateFeaturedHome();
  setupTagFilters();
  setupNavToggle();
  setupCopyId();
  lazyInit();
});

// 客户墙（读取 assets/images/clients/*）
function populateClients(){
  const clients = ['idle','zerobaseone','newworld','amore','hera','iope','cosrx','naikemei','dampers'];
  const grid = document.getElementById('clientsGrid');
  if(!grid) return;
  clients.forEach(name=>{
    const div = document.createElement('div');
    div.className='client';
    const img = document.createElement('img');
    img.dataset.src = `assets/images/clients/${name}.png`;
    img.alt = name;
    img.className='lazy';
    div.appendChild(img);
    grid.appendChild(div);
  });
}

// 根据当前页面填充作品网格
function populateWorksOnPages(){
  const vgrid = document.getElementById('video-grid');
  const dgrid = document.getElementById('design-grid');

  works.forEach(w=>{
    const item = document.createElement('div');
    item.className='item';
    item.dataset.tags = w.tags.join(',');
    item.dataset.featured = !!w.featured;
    item.dataset.category = w.category;

    const img = document.createElement('img');
    img.alt = w.title;
    img.dataset.src = w.img;
    img.className = 'lazy';
    item.appendChild(img);

    const cap = document.createElement('div');
    cap.className='caption';
    cap.innerHTML = `<strong>${w.title}</strong><br><span class="muted">${w.desc}</span>`;
    item.appendChild(cap);

    if(w.category === 'video' && vgrid) vgrid.appendChild(item);
    if(w.category === 'design' && dgrid) dgrid.appendChild(item);
  });
}

// 首页精选
function populateFeaturedHome(){
  const fgrid = document.getElementById('featuredGrid');
  if(!fgrid) return;
  const featured = works.filter(w=>w.featured).slice(0,6);
  featured.forEach(f=>{
    const a = document.createElement('a');
    a.href = 'videos.html';
    a.className = 'card';
    a.innerHTML = `<img data-src="${f.img}" alt="${f.title}" class="lazy"><div class="caption"><strong>${f.title}</strong><br><span class="muted">${f.desc}</span></div>`;
    fgrid.appendChild(a);
  });
}

// 标签筛选：绑定页面上的标签容器
function setupTagFilters(){
  const tagContainers = [
    {containerId:'video-tags',gridId:'video-grid'},
    {containerId:'design-tags',gridId:'design-grid'}
  ];
  tagContainers.forEach(pair=>{
    const c = document.getElementById(pair.containerId);
    const g = document.getElementById(pair.gridId);
    if(!c || !g) return;
    c.addEventListener('click', (e)=>{
      if(!e.target.classList.contains('tag')) return;
      c.querySelectorAll('.tag').forEach(t=>t.classList.remove('active'));
      e.target.classList.add('active');
      const tag = e.target.dataset.tag;
      filterGridByTag(g, tag);
    });
  });
}

function filterGridByTag(grid, tag){
  const items = Array.from(grid.children);
  items.forEach(it=>{
    const tags = (it.dataset.tags || '').split(',').map(s=>s.trim());
    if(tag === 'all' || tags.includes(tag)) it.style.display = '';
    else it.style.display = 'none';
  });
  lazyLoadVisible();
}

// 懒加载（IntersectionObserver）
let io;
function lazyInit(){
  const lazyImgs = () => document.querySelectorAll('img.lazy[data-src]');
  if('IntersectionObserver' in window){
    io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(ent=>{
        if(ent.isIntersecting){
          const img = ent.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, {rootMargin:'200px',threshold:0.01});
    lazyImgs().forEach(img => io.observe(img));
  } else {
    // fallback
    document.querySelectorAll('img.lazy').forEach(img => { img.src = img.dataset.src; img.classList.remove('lazy'); });
  }
}
function lazyLoadVisible(){
  if(!io) return;
  document.querySelectorAll('img.lazy[data-src]').forEach(img => io.observe(img));
}

// 导航切换（移动端）
function setupNavToggle(){
  document.querySelectorAll('.nav-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const nav = document.querySelector('.main-nav');
      if(!nav) return;
      if(window.getComputedStyle(nav).display === 'none' || nav.style.display === 'none') nav.style.display = 'flex';
      else nav.style.display = 'none';
    });
  });
}

// 复制 ID
function setupCopyId(){
  const el = document.getElementById('copy-id') || document.getElementById('copyBtn');
  if(!el) return;
  el.addEventListener('click', ()=>{
    navigator.clipboard?.writeText('icf304').then(()=> alert('已复制：icf304'), ()=> alert('复制失败，请手动复制：icf304'));
  });
}

// 页面间无 bug 小技巧：用 DOMContentLoaded 填充并延迟图片加载（已实现）
// 额外建议：把图片转 webp 并生成不同分辨率，使用 srcset 和 sizes 提高性能。
