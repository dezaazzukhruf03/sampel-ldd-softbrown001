// Tanggal target acara pernikahan (Tahun, Bulan-1, Tanggal, Jam, Menit)
// Catatan: Bulan di JavaScript dimulai dari index 0 (0 = Januari, 11 = Desember)
// Rabu, 31 Desember 2026, pukul 08.00 (menyesuaikan jam mulai Akad Nikah)
const targetDate = new Date(2026, 11, 31, 8, 0, 0).getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    } else {
        document.getElementById('countdown').innerHTML =
            "<p style='color: var(--rosewood); font-family: var(--font-display); font-size: 1.2rem; font-style: italic;'>Acara telah berlangsung</p>";
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();