(function () {

    /* =====================================================
       GOOGLE APPS SCRIPT
    ===================================================== */

    const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbwrHji0oU0VPiLM7lhkhGMd53HvzZJplOXwqRYE-ox-z_f4rGo1FluF_EgG6mU6Bpc/exec";

    const SHEET_NAME =
        "Sampel";

    /* -------------------------------
       ELEMEN
    -------------------------------- */

    const form = document.getElementById("rsvpForm");
    const list = document.getElementById("wishList");
    const message = document.getElementById("formMessage");
    const rsvpName = document.getElementById("rsvpName");
    const rsvpStatus = document.getElementById("rsvpStatus");
    const rsvpMessage = document.getElementById("rsvpMessage");

    /* -------------------------------
       HELPER
    -------------------------------- */

    const escapeHtml = (str) => {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const formatDate = (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    /* --------------------------------
       STATISTIK RSVP
    -------------------------------- */

    const updateRsvpStatistics = (data) => {
        const statHadir = document.getElementById("statHadir");
        const statTidakHadir = document.getElementById("statTidakHadir");
        const statRagu = document.getElementById("statRagu");
        const statTotal = document.getElementById("statTotal");

        if (!statHadir || !statTidakHadir || !statRagu || !statTotal) return;

        let hadir = 0;
        let tidakHadir = 0;
        let ragu = 0;

        if (Array.isArray(data)) {
            data.forEach((item) => {
                const status = String(item.kehadiran || "").trim().toLowerCase();

                if (status === "hadir" || status === "insya allah hadir") {
                    hadir++;
                } else if (status === "tidak hadir") {
                    tidakHadir++;
                } else if (status === "ragu") {
                    ragu++;
                }
            });
        }

        const total = hadir + tidakHadir + ragu;

        statHadir.textContent = hadir;
        statTidakHadir.textContent = tidakHadir;
        statRagu.textContent = ragu;
        statTotal.textContent = total;
    };

    /* --------------------------------
       RENDER UCAPAN
    -------------------------------- */

    let allWishesData = [];
    const WISH_PAGE_SIZE = 3;
    let wishVisibleCount = WISH_PAGE_SIZE;

    const renderWishes = (data) => {
        if (!list) return;

        if (!Array.isArray(data) || data.length === 0) {
            list.innerHTML = `<p class="wish-empty">Belum ada ucapan. Jadilah yang pertama mengirim doa.</p>`;
            updateRsvpStatistics([]);
            return;
        }

        updateRsvpStatistics(data);

        allWishesData = data.slice().reverse();
        wishVisibleCount = WISH_PAGE_SIZE;
        renderWishPage();
    };

    const renderWishPage = () => {
        const visible = allWishesData.slice(0, wishVisibleCount);

        const itemsHtml = visible.map((item) => `
            <article class="wish-item">
                <div class="wish-head">
                    <span class="wish-name">${escapeHtml(item.nama)}</span>
                    <span class="wish-status">${escapeHtml(item.kehadiran)}</span>
                </div>
                ${item.ucapan ? `<p class="wish-text">${escapeHtml(item.ucapan)}</p>` : ""}
                ${item.waktu ? `<small class="wish-time">${formatDate(item.waktu)}</small>` : ""}
            </article>
        `).join("");

        const hasMore = allWishesData.length > wishVisibleCount;

        list.innerHTML = itemsHtml + (
            hasMore
                ? `<button type="button" id="wishLoadMore" class="wish-load-more">
                       Muat Ucapan Lainnya (${allWishesData.length - wishVisibleCount})
                   </button>`
                : ""
        );

        const loadMoreBtn = document.getElementById("wishLoadMore");
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", () => {
                wishVisibleCount += WISH_PAGE_SIZE;
                renderWishPage();
            });
        }
    };

    /* --------------------------------
       LOAD UCAPAN DARI GOOGLE SHEETS (JSONP)
    -------------------------------- */

    const loadWishes = () => {
        if (!list) return;

        const callbackName = "__laraDezaCallback_" + Date.now();

        const script = document.createElement("script");

        window[callbackName] = (data) => {
            try {
                if (data && data.success === false) {
                    console.error("Apps Script:", data.message);
                    return;
                }
                renderWishes(data);
            } finally {
                delete window[callbackName];
                script.remove();
            }
        };

        script.onerror = () => {
            console.error("Gagal mengambil data ucapan dari Google Sheets.");
            delete window[callbackName];
            script.remove();
        };

        script.src =
            SCRIPT_URL +
            "?sheet=" + encodeURIComponent(SHEET_NAME) +
            "&callback=" + encodeURIComponent(callbackName) +
            "&t=" + Date.now();

        document.body.appendChild(script);

        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                script.remove();
                console.warn("Request ucapan timeout.");
            }
        }, 10000);
    };

    /* --------------------------------
       KIRIM DATA KE GOOGLE SHEETS (hidden iframe)
    -------------------------------- */

    const submitToGoogleSheets = (data) => {
        return new Promise((resolve) => {
            const iframeName = "laraDezaSubmit_" + Date.now();

            const iframe = document.createElement("iframe");
            iframe.name = iframeName;
            iframe.style.display = "none";
            document.body.appendChild(iframe);

            const submitForm = document.createElement("form");
            submitForm.method = "POST";
            submitForm.action = SCRIPT_URL;
            submitForm.target = iframeName;
            submitForm.style.display = "none";

            Object.entries(data).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value ?? "";
                submitForm.appendChild(input);
            });

            document.body.appendChild(submitForm);

            let finished = false;

            const cleanup = () => {
                submitForm.remove();
                setTimeout(() => iframe.remove(), 500);
            };

            const success = () => {
                if (finished) return;
                finished = true;
                cleanup();
                resolve();
            };

            iframe.addEventListener("load", success, { once: true });

            submitForm.submit();

            setTimeout(() => {
                if (!finished) success();
            }, 3000);
        });
    };

    /* --------------------------------
       SUBMIT RSVP
    -------------------------------- */

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = rsvpName ? rsvpName.value.trim() : "";
            const status = rsvpStatus ? rsvpStatus.value : "";
            const msg = rsvpMessage ? rsvpMessage.value.trim() : "";

            if (!name || !status) {
                if (message) message.textContent = "Silakan isi nama dan konfirmasi kehadiran terlebih dahulu.";
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Mengirim...";
            }

            try {
                const data = {
                    sheet: SHEET_NAME,
                    nama: name,
                    kehadiran: status,
                    ucapan: msg
                };

                await submitToGoogleSheets(data);

                form.reset();

                if (message) message.textContent = "Terima kasih, RSVP dan ucapan Anda berhasil dikirim.";

                setTimeout(() => loadWishes(), 1000);
                setTimeout(() => { if (message) message.textContent = ""; }, 4000);

            } catch (error) {
                console.error("Gagal mengirim RSVP:", error);
                if (message) message.textContent = "Maaf, ucapan belum berhasil dikirim. Silakan coba lagi.";
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim';
                }
            }
        });
    }

    /* --------------------------------
       LOAD UCAPAN SAAT WEBSITE DIBUKA
    -------------------------------- */

    loadWishes();

})();