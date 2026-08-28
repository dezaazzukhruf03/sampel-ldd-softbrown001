// ================= Simpan ke Kalender (Google Calendar) =================
// Setiap tombol .calendar-btn punya data-title, data-start, data-end,
// data-location, data-desc (format tanggal: YYYYMMDDTHHmmss, waktu lokal).

function buildGoogleCalendarUrl({ title, start, end, location, desc }) {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title || '',
        dates: `${start}/${end}`,
        location: location || '',
        details: desc || ''
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

document.querySelectorAll('.calendar-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
        const { title, start, end, location, desc } = btn.dataset;
        if (!start || !end) return;

        const url = buildGoogleCalendarUrl({ title, start, end, location, desc });
        window.open(url, '_blank', 'noopener');
    });
});
