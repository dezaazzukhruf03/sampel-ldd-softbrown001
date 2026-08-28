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

    // Auto-scroll halus dari Beranda melewati semua section, berhenti di Gift
    setTimeout(() => {
        if (autoScrollEnabled) startAutoScroll(AUTO_SCROLL_DURATION);
    }, 300);
}, { once: true });

// ================= Auto Scroll (bisa dinyalakan/dimatikan lewat tombol) =================
// - Saat tombol aktif (ikon panah bawah): auto-scroll berjalan dari Beranda menuju Gift.
// - User tetap bisa scroll manual kapan saja; auto-scroll akan berhenti sejenak
//   lalu melanjutkan sendiri dari posisi terakhir setelah user berhenti berinteraksi.
// - Saat tombol dimatikan (ikon pause): auto-scroll berhenti total dan tidak akan
//   melanjutkan sendiri sampai tombol dinyalakan kembali.
const AUTO_SCROLL_DURATION = 90000; // ms — ubah angka ini untuk atur kecepatan (makin besar makin lambat)
const AUTO_SCROLL_RESUME_DELAY = 1200; // ms jeda tanpa interaksi sebelum auto-scroll melanjutkan lagi

let autoScrollEnabled = true;
let autoScrollRAF = null;
let autoScrollResumeTimer = null;
let autoScrollRemainingMs = AUTO_SCROLL_DURATION;

function getAutoScrollTargetY() {
    const giftSection = document.getElementById('gift');
    if (!giftSection) return null;
    return giftSection.getBoundingClientRect().top + window.scrollY;
}

function setAutoScrollingClass(isActive) {
    const bottomBar = document.getElementById('bottomBar');
    if (bottomBar) bottomBar.classList.toggle('auto-scrolling', isActive);
}

function setAutoScrollIcon(isActive) {
    const btn = document.getElementById('autoScrollToggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (!icon) return;

    if (isActive) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-arrow-down');
        btn.classList.remove('off');
    } else {
        icon.classList.remove('fa-arrow-down');
        icon.classList.add('fa-pause');
        btn.classList.add('off');
    }
}

function stopAutoScrollAnimation() {
    if (autoScrollRAF) {
        cancelAnimationFrame(autoScrollRAF);
        autoScrollRAF = null;
    }
    setAutoScrollingClass(false);
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function runAutoScrollStep(targetY, durationMs) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        // behavior: 'auto' WAJIB di sini, supaya tidak bentrok
        // dengan CSS "scroll-behavior: smooth" pada html
        window.scrollTo({
            top: startY + distance * easeInOutQuad(progress),
            left: 0,
            behavior: 'auto'
        });

        autoScrollRemainingMs = durationMs - elapsed;

        if (progress < 1) {
            autoScrollRAF = requestAnimationFrame(step);
        } else {
            autoScrollRAF = null;
            setAutoScrollingClass(false);
        }
    }

    setAutoScrollingClass(true);
    autoScrollRAF = requestAnimationFrame(step);
}

function startAutoScroll(durationMs) {
    const targetY = getAutoScrollTargetY();
    if (targetY === null) return;
    stopAutoScrollAnimation();
    autoScrollRemainingMs = durationMs;
    runAutoScrollStep(targetY, durationMs);
}

function pauseAutoScrollForInteraction() {
    // Interaksi manual hanya menjeda sementara selama tombol dalam keadaan aktif;
    // kalau tombol sedang dimatikan, tidak ada yang perlu dijeda/dilanjutkan.
    if (!autoScrollEnabled) return;

    stopAutoScrollAnimation();

    if (autoScrollResumeTimer) clearTimeout(autoScrollResumeTimer);
    autoScrollResumeTimer = setTimeout(() => {
        if (!autoScrollEnabled) return;

        const targetY = getAutoScrollTargetY();
        if (targetY === null) return;

        // Kalau posisi sudah sangat dekat dengan target, tidak perlu lanjut lagi
        if (Math.abs(window.scrollY - targetY) < 4) return;

        const remaining = Math.max(autoScrollRemainingMs, 1500);
        runAutoScrollStep(targetY, remaining);
    }, AUTO_SCROLL_RESUME_DELAY);
}

function initAutoScrollInteractionListeners() {
    window.addEventListener('wheel', pauseAutoScrollForInteraction, { passive: true });
    window.addEventListener('touchstart', pauseAutoScrollForInteraction, { passive: true });
    window.addEventListener('pointerdown', pauseAutoScrollForInteraction, { passive: true });
    window.addEventListener('keydown', pauseAutoScrollForInteraction);
}
initAutoScrollInteractionListeners();

function toggleAutoScroll() {
    autoScrollEnabled = !autoScrollEnabled;
    setAutoScrollIcon(autoScrollEnabled);

    if (autoScrollResumeTimer) {
        clearTimeout(autoScrollResumeTimer);
        autoScrollResumeTimer = null;
    }

    if (autoScrollEnabled) {
        startAutoScroll(AUTO_SCROLL_DURATION);
    } else {
        stopAutoScrollAnimation();
    }
}

const autoScrollToggleBtn = document.getElementById('autoScrollToggle');
if (autoScrollToggleBtn) {
    autoScrollToggleBtn.addEventListener('click', toggleAutoScroll);
}

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

// ================= Scroll Reveal =================
function initScrollReveal() {
    const revealEls = document.querySelectorAll(
        '.section, .event-card, .bank-card, .card, .hero-photo, .countdown-container, .location-card, .gallery-grid figure'
    );
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
