document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("pre").forEach(pre => {
    const button = document.createElement("button");
    button.className = "copy-button";
    button.textContent = "コピー";

    button.addEventListener("click", () => {
      const code = pre.innerText;
      navigator.clipboard.writeText(code).then(() => {
        button.textContent = "✔️ コピー完了";
        setTimeout(() => button.textContent = "コピー", 1500);
      });
    });

    pre.appendChild(button);
  });
});
