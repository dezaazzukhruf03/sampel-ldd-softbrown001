window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    // Sedikit delay agar transisi terasa halus, bukan tiba-tiba
    setTimeout(() => {
        preloader.classList.add('fade-out');
    }, 400);

    // Setelah animasi opacity selesai, lepas dari alur halaman
    // supaya tidak lagi menghalangi klik ke elemen di baliknya
    preloader.addEventListener('transitionend', function handler(e) {
        if (e.propertyName === 'opacity') {
            preloader.remove();
            preloader.removeEventListener('transitionend', handler);
        }
    });
});