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
    } else {
        cnElements.forEach(el => el.classList.add('hidden'));
        krElements.forEach(el => el.classList.remove('hidden'));
        btnCn.classList.remove('active');
        btnKr.classList.add('active');
    }
}

// 确保初始加载时显示中文
document.addEventListener('DOMContentLoaded', () => {
    switchLanguage('cn'); 
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
}

function closeVideoModal() {
    videoModal.style.display = 'none';
    videoPlayer.innerHTML = ''; // 停止播放 (清除 iframe)
}

// 点击模态框背景关闭
window.onclick = function(event) {
    if (event.target == videoModal) {
        closeVideoModal();
    }
}
