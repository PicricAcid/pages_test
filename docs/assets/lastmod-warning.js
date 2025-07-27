document.addEventListener("DOMContentLoaded", function () {
    const warning = document.getElementById("stale-warning");
    if (!warning) return;
    
    const lastmodStr = warning.dataset.lastmod;
    console.log("lastmodStr raw:", lastmodStr);
    if (!lastmodStr) return;

    const lastmodDate = new Date(lastmodStr);
    const now = new Date();
    const diffDays = (now - lastmodDate) / (1000 * 60 * 60 * 24);
    console.log(`Last modified: ${lastmodDate.toLocaleDateString()}`);
    console.log(`Days since last modified: ${diffDays}`);

    if (diffDays >= 180) {
        if (warning) warning.style.display = "block";
    }
});