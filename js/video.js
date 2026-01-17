const bgVideo = document.getElementById('bgVideo');

function initVideo() {
    if (bgVideo) {
        bgVideo.load();
        console.log('[Video] Initialized');
    }
}

function playVideo() {
    if (bgVideo) {
        bgVideo.play().then(() => {
            bgVideo.classList.add('playing');
            console.log('[Video] Playing');
        }).catch(error => {
            console.error('[Video] Playback error:', error);
        });
    }
}
