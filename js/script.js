// ================= Nama Tamu dari Parameter URL =================
// Contoh link: index.html?to=Budi+Santoso
(function showGuestName() {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get('to');
    if (!guest) return;

    const guestLine = document.getElementById('guestLine');
    const guestNameText = document.getElementById('guestNameText');
    if (guestLine && guestNameText) {
        guestNameText.textContent = decodeURIComponent(guest.replace(/\+/g, ' '));
        guestLine.classList.remove('hidden');
    }
})();

// ================= Buka Undangan =================
document.getElementById('btn-open-invitation').addEventListener('click', function () {
    const cover = document.getElementById('cover-screen');
    const mainContent = document.getElementById('mainContent');
    const bottomBar = document.getElementById('bottomBar');

    cover.classList.add('hide');
    mainContent.classList.remove('hidden');
    bottomBar.classList.remove('hidden');

    // Buka kunci scroll (sebelumnya dikunci selama cover screen tampil)
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');

    playAudio();
    startPetals();
    initScrollReveal();

    setTimeout(() => cover.classList.add('hidden'), 900);
});

// ================= Toast =================
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ================= Salin Nomor Rekening =================
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;

    function fallbackCopy() {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('Nomor rekening disalin: ' + text);
        } catch (err) {
            console.error('Gagal menyalin: ', err);
            showToast('Gagal menyalin nomor rekening');
        }
        document.body.removeChild(textarea);
    }

    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('Nomor rekening disalin: ' + text))
            .catch(() => fallbackCopy());
    } else {
        fallbackCopy();
    }
}

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

// ================= Scroll Reveal =================
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.section, .event-card, .bank-card, .card, .story-item');
    revealEls.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
}

// ================= Highlight Navbar Aktif =================
function initNavHighlight() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.navbar a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
}
initNavHighlight();