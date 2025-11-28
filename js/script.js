/*
 * WXZ STUDIO Website JavaScript (Enhanced with Hybrid/Traffic Features)
 * Author: Gemini
 * Functions: Environment Sniffing, JS Bridge, NetFunnel Placeholder, Lazy Loading & Caching
 */

// ====================================================================
// === 1. HYBRID & TRAFFIC MANAGEMENT FEATURES (新增功能区) ===
// ====================================================================

// --- 1.1 NetFunnel Placeholder (流量削峰保护) ---
// 警告: 这是一个模拟函数。实际部署时，您需要引入 NetFunnel 的官方 JS 文件。
const NetFunnel_Action = (actionName) => {
    console.log(`[NetFunnel] 正在执行流量削峰保护动作: ${actionName}...`);
    // 实际代码中，NetFunnel_Action 会在这里与服务器进行交互，
    // 如果服务器过载，会显示排队界面并阻塞后续代码执行。
};

// --- 1.2 Environment Sniffing and Detection (环境嗅探) ---
const getEnvironment = () => {
    const ua = navigator.userAgent;
    // 假设您的 App UserAgent 中包含 'WXZStudioApp' 标识符
    if (/iPad|iPhone|iPod/.test(ua) && ua.indexOf('WXZStudioApp') > -1) {
        return 'iOS_APP'; 
    }
    if (/Android/.test(ua) && ua.indexOf('WXZStudioApp') > -1) {
        return 'Android_APP'; 
    }
    return 'WEB';
};

// --- 1.3 Native Function Bridging (原生功能桥接) ---
const callNativeFunction = (funcName, params = {}) => {
    const env = getEnvironment();
    const paramsJson = JSON.stringify(params);

    console.log(`[JS Bridge] 尝试在 ${env} 环境中调用原生功能: ${funcName}`);

    try {
        if (env === 'Android_APP' && window.TsJSInterface) {
            // Android: 通过 window.TsJSInterface 调用
            if (typeof window.TsJSInterface[funcName] === 'function') {
                window.TsJSInterface[funcName](paramsJson);
                console.log(`[JS Bridge: Android] 成功调用 ${funcName}`);
            } else {
                console.error(`[JS Bridge: Android] 错误: ${funcName} 方法不存在于 TsJSInterface`);
            }
        } else if (env === 'iOS_APP' && window.webkit && window.webkit.messageHandlers) {
            // iOS: 通过 webkit.messageHandlers 调用
            const handlerName = 'WXZStudioBridge'; // 假设 App 定义的原生 Handler 名称
            if (window.webkit.messageHandlers[handlerName]) {
                window.webkit.messageHandlers[handlerName].postMessage({
                    function: funcName,
                    params: params,
                });
                console.log(`[JS Bridge: iOS] 成功调用 ${handlerName}，功能: ${funcName}`);
            } else {
                console.error(`[JS Bridge: iOS] 错误: ${handlerName} 消息处理器不存在`);
            }
        } else {
            // WEB 或其他环境
            alert(`[JS Bridge: Web] 当前环境 (${env}) 无法调用原生功能: ${funcName}`);
        }
    } catch (e) {
        console.error(`[JS Bridge] 调用原生功能时发生异常: ${e}`);
    }
};

// --- 1.4 Lazy Loading & Caching Mechanism (按需加载与缓存) ---
let clickBcdCnt = 0; // 缓存计数器：记录点击次数
let cachedBarcodeData = null; // 缓存数据存储

const loadBarcodeData = async () => {
    const dataDisplay = document.getElementById('barcodeDataDisplay');
    const loadingMessage = document.getElementById('loadingMessage');
    
    // 显示加载中信息
    loadingMessage.textContent = "正在加载数据...";
    dataDisplay.style.display = 'none';

    if (clickBcdCnt > 0 && cachedBarcodeData) {
        // 缓存机制：非首次点击，直接使用缓存
        console.log("[LazyLoad/Cache] 数据已缓存，直接显示。");
        dataDisplay.innerHTML = cachedBarcodeData;
        dataDisplay.style.display = 'block';
        loadingMessage.textContent = "数据已从缓存加载 (点击次数: " + clickBcdCnt + ")";
        clickBcdCnt++;
        return;
    }

    // 首次点击：模拟 AJAX 请求 (/ts/bcdLayerPopAjax.json)
    console.log("[LazyLoad/Cache] 首次请求，通过 AJAX 模拟获取数据...");
    
    // 模拟 AJAX 延时
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // 模拟服务器响应数据
    const mockResponse = {
        success: true,
        barcode: '1234 5678 9012',
        giftCard: 'WXZ-GIFT-A1B2',
        note: '此数据仅供演示。',
    };

    if (mockResponse.success) {
        const htmlContent = `
            <p><strong>条形码数据:</strong> ${mockResponse.barcode}</p>
            <p><strong>礼品卡编号:</strong> ${mockResponse.giftCard}</p>
            <p style="color: red;">${mockResponse.note}</p>
        `;
        
        // 缓存数据
        cachedBarcodeData = htmlContent;
        
        dataDisplay.innerHTML = htmlContent;
        dataDisplay.style.display = 'block';
        loadingMessage.textContent = "数据加载成功！";
        clickBcdCnt++;
        console.log(`[LazyLoad/Cache] 数据加载成功并已缓存。`);
    } else {
        loadingMessage.textContent = "数据加载失败，请重试。";
    }
};

// ====================================================================
// === 2. STANDARD WXZ STUDIO LOGIC (网站通用逻辑) ===
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 启动流量削峰保护 (页面加载时) ---
    NetFunnel_Action('PAGE_LOAD_' + window.location.pathname.toUpperCase().replace(/\//g, '_').replace('.HTML', ''));
    
    // --- 绑定新的功能按钮 ---
    const settingsBtn = document.getElementById('openSettingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // 假设打开设置页的原生功能名称为 'openSettings'
            callNativeFunction('openSettings', { page: 'general' });
        });
    }

    const loadDataBtn = document.getElementById('loadDataBtn');
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', loadBarcodeData);
    }
    
    
    // --- 2.1 Utility: Fisher-Yates Shuffle Algorithm (Logo 随机排序) ---
    const shuffleElements = (parentSelector, itemSelector) => {
        const parents = document.querySelectorAll(parentSelector);
        parents.forEach(parent => {
            const items = Array.from(parent.querySelectorAll(itemSelector));
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                if (i !== j) {
                    const itemA = items[i];
                    const itemB = items[j];
                    parent.insertBefore(itemA, itemB.nextSibling); 
                    parent.insertBefore(itemB, itemA.nextSibling); 
                }
            }
        });
    };
    if (document.querySelector('.clients-wall')) {
        shuffleElements('.clients-list-inner', '.client-logo');
    }
    
    // --- 2.2 Portfolio Filtering Logic (作品筛选) ---
    const filterButtons = document.querySelectorAll('.tag-filter button');
    const workItems = document.querySelectorAll('.work-item');

    if (filterButtons.length > 0 && workItems.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filterTag = e.target.dataset.tag;
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                workItems.forEach(item => {
                    const itemTags = item.dataset.tags ? item.dataset.tags.split(' ') : [];
                    if (filterTag === 'all' || itemTags.includes(filterTag)) {
                        item.style.display = 'block'; 
                    } else {
                        item.style.display = 'none'; 
                    }
                });
            });
        });
        
        const allButton = document.querySelector('.tag-filter button[data-tag="all"]');
        if(allButton) {
            allButton.click();
        }
    }

    // --- 2.3 Client Logo Show More Logic (Home Page Mobile Only) ---
    const showMoreButton = document.getElementById('showMoreClients');
    const clientLogos = document.querySelectorAll('.clients-list-inner:first-child .client-logo');
    const maxInitialClients = 9;

    if (showMoreButton && clientLogos.length > maxInitialClients) {
        showMoreButton.addEventListener('click', () => {
            for (let i = maxInitialClients; i < clientLogos.length; i++) {
                clientLogos[i].classList.add('is-visible'); 
            }
            showMoreButton.style.display = 'none';
        });
    } else if (showMoreButton) {
        showMoreButton.style.display = 'none';
    }


    // --- 2.4 Scroll To Top Button Logic (返回顶部) ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollThreshold = 300;
    
    if (!scrollToTopBtn) return; 

    window.addEventListener('scroll', () => {
        const currentScroll = document.body.scrollTop || document.documentElement.scrollTop;
        if (currentScroll > scrollThreshold) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });
    });
});