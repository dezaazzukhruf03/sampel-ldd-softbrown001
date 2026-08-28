// ================= Lightbox Galeri (dengan navigasi geser) =================
function initLightbox() {
    const images = Array.from(document.querySelectorAll('.gallery-grid img'));
    if (!images.length) return;

    let currentIndex = 0;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
        <button class="lightbox-nav lightbox-prev" aria-label="Foto sebelumnya"><i class="fa-solid fa-chevron-left"></i></button>
        <img src="" alt="">
        <button class="lightbox-nav lightbox-next" aria-label="Foto selanjutnya"><i class="fa-solid fa-chevron-right"></i></button>
        <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const counter = lightbox.querySelector('.lightbox-counter');

    if (images.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt;
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
    }

    images.forEach((img, i) => {
        img.addEventListener('click', () => {
            showImage(i);
            lightbox.classList.add('show');
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('show');
    }

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
    nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    // Geser (swipe) untuk layar sentuh
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 40) {
            diff < 0 ? showImage(currentIndex + 1) : showImage(currentIndex - 1);
        }
    }, { passive: true });
}
initLightbox();
