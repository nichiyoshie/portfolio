const filterButtons = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".project-grid .card");
const countEl = document.getElementById("count");
const emptyMsg = document.getElementById("empty");

function applyFilter(type) {
    let visible = 0;

    cards.forEach(card => {
        const show = type === "all" || card.dataset.type === type;
        card.hidden = !show;
        if (show) visible++;
    });

    countEl.textContent = `${visible} ${visible === 1 ? "project" : "projects"}`;
    emptyMsg.hidden = visible > 0;
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        applyFilter(btn.dataset.filter);
    });
});

applyFilter("all");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initCursorGlow() {
    const glow = document.querySelector(".cursor-glow");
    if (!glow || reduceMotion || !window.matchMedia("(hover: hover)").matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    window.addEventListener("mousemove", e => {
        targetX = e.clientX;
        targetY = e.clientY;
        glow.classList.add("active");
    });
    document.documentElement.addEventListener("mouseleave", () => {
        glow.classList.remove("active");
    });

    function follow() {
        x += (targetX - x) * 0.12;
        y += (targetY - y) * 0.12;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        requestAnimationFrame(follow);
    }
    follow();
}

function initScrollReveal() {
    const targets = document.querySelectorAll(
        ".hero-text > *, .hero-photo, section h2, .filters, " +
        ".info-card, .skill-card, .project-grid .card, .contact-card"
    );

    document.querySelectorAll(".bar-fill").forEach(bar => {
        bar.dataset.width = bar.style.width;
        bar.style.width = "0";
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add("visible");

            const bar = el.querySelector(".bar-fill");
            if (bar) bar.style.width = bar.dataset.width;
            const pct = el.querySelector(".percent");
            if (pct && !reduceMotion) {
                const goal = parseInt(bar.dataset.width);
                const start = performance.now();
                (function tick(now) {
                    const t = Math.min((now - start) / 1200, 1);
                    pct.textContent = Math.round(goal * t) + "%";
                    if (t < 1) requestAnimationFrame(tick);
                })(start);
            }

            observer.unobserve(el);
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

    targets.forEach(el => {
        el.classList.add("reveal");
        const index = [...el.parentElement.children].indexOf(el);
        el.style.setProperty("--i", Math.min(index, 6));
        observer.observe(el);
    });
}

function initCodeBackground() {
    const canvas = document.getElementById("code-bg");
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");

    const LANGUAGES = [
        { name: "Python",     color: "#60a5fa", snippets: ['def greet():', 'print("hello")', 'for i in range(10):', 'import numpy as np', 'return [x * 2 for x in data]'] },
        { name: "JavaScript", color: "#facc15", snippets: ['const add = (a, b) => a + b;', 'console.log("hi");', 'document.querySelector(".box")', 'async function load() {}', 'items.map(x => x * 2)'] },
        { name: "CSS",        color: "#c084fc", snippets: ['display: flex;', 'color: #5eead4;', '.card:hover { }', 'border-radius: 1rem;', 'grid-template-columns: 1fr 1fr;'] },
        { name: "C++",        color: "#f472b6", snippets: ['#include <iostream>', 'int main() {', 'std::cout << "hi";', 'vector<int> nums;', 'return 0;'] },
        { name: "HTML",       color: "#fb923c", snippets: ['<div class="card">', '<section id="home">', '<h1>Hello</h1>', '<a href="#about">', '</body>'] }
    ];

    let width, height, particles;

    function randomParticle(startAnywhere) {
        const lang = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
        const text = lang.snippets[Math.floor(Math.random() * lang.snippets.length)];
        const depth = Math.random();

        return {
            text,
            color: lang.color,
            x: Math.random() * width,
            y: startAnywhere ? Math.random() * height : height + 30,
            size: 11 + depth * 8,
            speed: 0.12 + depth * 0.3,
            alpha: 0.1 + depth * 0.14,
            sway: Math.random() * Math.PI * 2
        };
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.max(15, Math.min(45, Math.floor(width / 40)));
        particles = Array.from({ length: count }, () => randomParticle(true));
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, i) => {
            p.y -= p.speed;
            p.sway += 0.01;
            const x = p.x + Math.sin(p.sway) * 18;

            const fade = Math.max(0, Math.min(1, p.y / 120, (height - p.y) / 60));

            ctx.globalAlpha = p.alpha * fade;
            ctx.fillStyle = p.color;
            ctx.font = `${p.size}px ui-monospace, "Courier New", monospace`;
            ctx.fillText(p.text, x, p.y);

            if (p.y < -20) particles[i] = randomParticle(false);
        });

        requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", () => {
        if (window.innerWidth !== width) resize();
    });
    animate();
}

initCursorGlow();
initScrollReveal();
initCodeBackground();

document.addEventListener("click", e => {
    const toggle = e.target.closest(".edu-toggle");
    if (!toggle) return;

    const item = toggle.closest(".edu-item");
    const willOpen = !item.classList.contains("open");

    document.querySelectorAll(".edu-item").forEach(other => {
        other.classList.remove("open");
        other.querySelector(".edu-toggle").setAttribute("aria-expanded", "false");
    });

    if (willOpen) {
        item.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");

        const map = item.querySelector(".edu-map");
        if (map && !map.getAttribute("src")) map.src = map.dataset.src;
    }
});