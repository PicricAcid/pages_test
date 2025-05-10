document.addEventListener("DOMContentLoaded", function () {
  const content = document.querySelector("main") || document.body;
  const headings = content.querySelectorAll("h2", "h3");
  if (headings.length === 0) return;

  const toc = document.createElement("nav");
  toc.id = "toc";
  toc.innerHTML = "<h2>目次</h2><ul></ul>";

  const ul = toc.querySelector("ul");

  headings.forEach(h => {
    if (!h.id) {
      h.id = h.textContent.trim().toLowerCase().replace(/\s+/g, "-");
    }
    const li = document.createElement("li");
    li.style.marginLeft = h.tagName === "H3" ? "1em" : "0";
    li.innerHTML = `<a href="#${h.id}">${h.textContent}</a>`;
    ul.appendChild(li);
  });

  content.prepend(toc);
});
