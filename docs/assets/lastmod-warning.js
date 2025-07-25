document.addEventListener("DOMContentLoaded", function () {
    const meta = document.querySelector('meta[name="lastmod"]');
    if (!meta) return;

    const lastmodStr = meta.getAttribute("content");
    const lastmodDate = new Date(lastmodStr);
    const now = new Date();
    const diffDays = (now - lastmodDate) / (1000 * 60 * 60 * 24);

    if (diffDays >= 180) {
        const warning = document.getElementById("stale-warning");
        if (warning) warning.style.display = "block";
    }
});