
document.addEventListener('DOMContentLoaded', function () {
    let visits = localStorage.getItem('visitCount');
    if (!visits) {
        visits = 1;
    } else {
        visits = parseInt(visits) + 1;
    }
    localStorage.setItem('visitCount', visits);
    const visitElement = document.getElementById('visitCount');
    if (visitElement) {
        visitElement.textContent = visits;
    }
    console.log('[Visits] Counter updated:', visits);
});

document.addEventListener('DOMContentLoaded', typeTitle);

document.addEventListener('DOMContentLoaded', initVideo);

document.getElementById('enterButton').addEventListener('click', async function () {
    const introScreen = document.getElementById('introScreen');
    const mainContent = document.getElementById('mainContent');
    const audio = document.getElementById('bgMusic');
    const particlesCanvas = document.getElementById('particles-canvas');
    const muteIcon = document.getElementById('muteIcon');
    const unmuteIcon = document.getElementById('unmuteIcon');

    introScreen.style.opacity = '0';

    mainContent.classList.add('visible');

    playVideo();

    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.muted = false;
    audio.play().catch(error => {
        console.error('[Audio] Playback error:', error);
    });

    muteIcon.style.display = 'none';
    unmuteIcon.style.display = 'block';

    setTimeout(() => {
        introScreen.style.display = 'none';

        setTimeout(() => {
            startParticlesEffect();
            particlesCanvas.classList.add('visible');
            console.log('[Particles] Effect started');
        }, 500);
    }, 1000);
});

document.getElementById('muteButton').addEventListener('click', function () {
    const audio = document.getElementById('bgMusic');
    const muteIcon = document.getElementById('muteIcon');
    const unmuteIcon = document.getElementById('unmuteIcon');

    if (audio.muted) {
        audio.muted = false;
        audio.volume = 0.7;
        muteIcon.style.display = 'none';
        unmuteIcon.style.display = 'block';
        console.log('[Audio] Unmuted');
    } else {
        audio.muted = true;
        muteIcon.style.display = 'block';
        unmuteIcon.style.display = 'none';
        console.log('[Audio] Muted');
    }
});
