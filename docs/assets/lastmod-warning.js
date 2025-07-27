document.addEventListener("DOMContentLoaded", function () {
    const lastmodStr = "{{ page.lastmod | escape }}";
    if (!lastmodStr) return;

    const lastmodDate = new Date(lastmodStr);
    const now = new Date();
    const diffDays = (now - lastmodDate) / (1000 * 60 * 60 * 24);

    if (diffDays >= 180) {
        const warning = document.getElementById("stale-warning");
        if (warning) warning.style.display = "block";
    }
});