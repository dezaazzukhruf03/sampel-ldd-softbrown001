const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

function playAudio() {
    if (bgMusic) {
        bgMusic.play().then(() => {
            setMusicIcon(true);
        }).catch(error => {
            console.log("Autoplay diblokir oleh browser:", error);
            setMusicIcon(false);
        });
    }
}

function setMusicIcon(isPlaying) {
    if (!musicToggle) return;
    const icon = musicToggle.querySelector('i');
    if (isPlaying) {
        musicToggle.classList.add('playing');
        icon.classList.remove('fa-music-disc');
        icon.classList.add('fa-compact-disc');
    } else {
        musicToggle.classList.remove('playing');
        icon.classList.remove('fa-compact-disc');
        icon.classList.add('fa-music-disc');
    }
}

if (musicToggle) {
    musicToggle.addEventListener('click', function () {
        if (!bgMusic) return;
        if (bgMusic.paused) {
            playAudio();
        } else {
            bgMusic.pause();
            setMusicIcon(false);
        }
    });
}