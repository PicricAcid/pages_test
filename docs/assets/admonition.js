document.addEventListener("DOMContentLoaded", () => {
  const replacements = {
    "[!NOTE]": { class: "note", label: "📝 NOTE" },
    "[!Tip]": { class: "tip", label: "💡 TIP" },
    "[!Warning]": { class: "warning", label: "⚠️ WARNING" }
  };

  const paras = document.querySelectorAll("blockquote p");

  paras.forEach(p => {
    const text = p.textContent.trim();
    const key = Object.keys(replacements).find(k => text.startsWith(k));
    if (key) {
      const content = p.innerHTML.replace(key, "").trim();
      const { class: cls, label } = replacements[key];

      const wrapper = document.createElement("div");
      wrapper.className = `admonition ${cls}`;
      wrapper.innerHTML = `<strong>${label}</strong><div class="admonition-content">${content}</div>`;

      const blockquote = p.closest("blockquote");
      if (blockquote) {
        blockquote.replaceWith(wrapper);
      }
    }
  });
});
