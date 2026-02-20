/* SurfContext — Minimal vanilla JS */
(function () {
    "use strict";

    // 1. Theme toggle
    function initTheme() {
        var saved = localStorage.getItem("theme");
        if (!saved) {
            saved = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        }
        document.documentElement.setAttribute("data-theme", saved);
    }
    initTheme();

    document.addEventListener("DOMContentLoaded", function () {
        var toggle = document.querySelector(".theme-toggle");
        if (toggle) {
            toggle.addEventListener("click", function () {
                var current = document.documentElement.getAttribute("data-theme");
                var next = current === "dark" ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", next);
                localStorage.setItem("theme", next);
                toggle.textContent = next === "dark" ? "\u263E" : "\u2600";
            });
            var theme = document.documentElement.getAttribute("data-theme");
            toggle.textContent = theme === "dark" ? "\u263E" : "\u2600";
        }

        // 2. Mobile menu
        var navToggle = document.querySelector(".nav-toggle");
        var navLinks = document.querySelector(".nav-links");
        if (navToggle && navLinks) {
            navToggle.addEventListener("click", function (e) {
                e.stopPropagation();
                navLinks.classList.toggle("open");
            });
            navLinks.querySelectorAll("a").forEach(function (link) {
                link.addEventListener("click", function () {
                    navLinks.classList.remove("open");
                });
            });
            document.addEventListener("click", function (e) {
                if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove("open");
                }
            });
        }

        // 3. Code copy buttons
        document.querySelectorAll(".code-block").forEach(function (block) {
            if (block.querySelector(".code-copy")) return;
            var btn = document.createElement("button");
            btn.className = "code-copy";
            btn.textContent = "Copy";
            btn.addEventListener("click", function () {
                var code = block.querySelector("code");
                if (!code) return;
                navigator.clipboard.writeText(code.textContent).then(function () {
                    btn.textContent = "Copied!";
                    setTimeout(function () { btn.textContent = "Copy"; }, 2000);
                });
            });
            block.appendChild(btn);
        });

        // 4. Spec TOC tracking (only when .spec-toc exists)
        var toc = document.querySelector(".spec-toc");
        if (toc) {
            var sections = document.querySelectorAll(".spec-section");
            var tocItems = toc.querySelectorAll(".toc-item");
            if (sections.length && tocItems.length) {
                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var id = entry.target.getAttribute("id");
                            tocItems.forEach(function (item) {
                                item.classList.toggle("active", item.getAttribute("href") === "#" + id);
                            });
                        }
                    });
                }, { rootMargin: "-80px 0px -60% 0px", threshold: 0 });
                sections.forEach(function (s) { observer.observe(s); });
            }
        }

        // 5. Stack selector (getting-started page)
        var stackSelector = document.querySelector(".stack-selector");
        if (stackSelector) {
            var hidden = stackSelector.parentElement.querySelector("input[type=hidden]");
            stackSelector.querySelectorAll(".stack-btn").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    btn.classList.toggle("selected");
                    if (hidden) {
                        var selected = stackSelector.querySelectorAll(".stack-btn.selected");
                        var vals = [];
                        selected.forEach(function (s) { vals.push(s.dataset.value || s.textContent.trim()); });
                        hidden.value = vals.join(",");
                    }
                });
            });
        }
    });
})();
