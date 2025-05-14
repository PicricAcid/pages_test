document.addEventListener("DOMContentLoaded", () => {
  const replacements = {
    "[!NOTE]": { class: "note", label: "📝 NOTE" },
    "[!TIP]": { class: "tip" label: "💡 TIP" },
    "[!WARNING]": { class: "warning", label: "⚠️ WARINING" }
  };

  const paras = document.querySelectorAll("blockquote p");

  paras.forEach(p => {
    const text = p.textContent.trim();
    const key = Object.keys(replacements).find(k => text.startsWith(k));
    if (key) {
      const content = p.innerHTML.replace(key, "").trim();
      wrapper.className = `admonition ${cls}`;
      wrapper.innerHTML = `<strong>${label}</strong><div class="admonition-content">${content}</div>`;

      const blockquote = p.closest("blockquote");
      if (blockquote) {
        blockquote.replaceWith(wrapper);
      }
    }
  });
});
