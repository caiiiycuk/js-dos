document.addEventListener("DOMContentLoaded", () => {
    const div = document.createElement("div");
    div.classList.add("deprecated");
    div.innerHTML = "<div><div>This documentation is outdated. Open newest</div> <a href=\"https://js-dos.com\">documentation</a>.</div>";
    document.body.appendChild(div);
});