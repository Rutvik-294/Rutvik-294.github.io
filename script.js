/* ============================================================
   Rutvik Sai — portfolio v2 interactions
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Theme toggle ---------- */
    const themeToggle = document.getElementById("theme-toggle");
    const icon = themeToggle.querySelector("i");

    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateIcon(savedTheme);

    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateIcon(next);
    });

    function updateIcon(theme) {
        icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }

    /* ---------- Scroll progress bar ---------- */
    const progressBar = document.getElementById("progress-bar");
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + "%";
    }, { passive: true });

    /* ---------- Typewriter ---------- */
    const phrases = [
        "builder.",
        "problem solver.",
        "quant enthusiast.",
        "competitive programmer.",
        "robotics tinkerer."
    ];
    const typeEl = document.getElementById("typewriter");

    if (typeEl) {
        if (reducedMotion) {
            typeEl.textContent = phrases[0];
        } else {
            let phraseIdx = 0, charIdx = 0, deleting = false;
            (function tick() {
                const word = phrases[phraseIdx];
                charIdx += deleting ? -1 : 1;
                typeEl.textContent = word.slice(0, charIdx);
                let delay = deleting ? 40 : 85;
                if (!deleting && charIdx === word.length) {
                    delay = 1800;           // hold the full word
                    deleting = true;
                } else if (deleting && charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    delay = 350;
                }
                setTimeout(tick, delay);
            })();
        }
    }

    /* ---------- Hero particle network ---------- */
    const canvas = document.getElementById("net");
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext("2d");
        const hero = canvas.parentElement;
        const DPR = Math.min(window.devicePixelRatio || 1, 2);
        let W = 0, H = 0, points = [], rafId = null, running = false;

        const LINK_DIST = 120;

        function rgb() {
            const t = document.documentElement.getAttribute("data-theme");
            return t === "light" ? "8, 145, 178" : "103, 232, 249";
        }

        function resize() {
            W = hero.offsetWidth;
            H = hero.offsetHeight;
            canvas.width = W * DPR;
            canvas.height = H * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            seed();
            if (!running) drawFrame(); // keep a static render when paused
        }

        function seed() {
            const n = Math.min(90, Math.floor((W * H) / 16000));
            points = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                r: Math.random() * 1.4 + 0.8
            }));
        }

        function drawFrame() {
            const color = rgb();
            ctx.clearRect(0, 0, W, H);

            for (const p of points) {
                if (!reducedMotion) {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > W) p.vx *= -1;
                    if (p.y < 0 || p.y > H) p.vy *= -1;
                }
            }

            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const d = Math.hypot(dx, dy);
                    if (d < LINK_DIST) {
                        const alpha = (1 - d / LINK_DIST) * 0.35;
                        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[j].x, points[j].y);
                        ctx.stroke();
                    }
                }
            }

            ctx.fillStyle = `rgba(${color}, 0.55)`;
            for (const p of points) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function loop() {
            drawFrame();
            rafId = requestAnimationFrame(loop);
        }

        function start() {
            if (!running && !reducedMotion) {
                running = true;
                rafId = requestAnimationFrame(loop);
            }
        }

        function stop() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        }

        // Only animate while the hero is on screen
        new IntersectionObserver((entries) => {
            entries[0].isIntersecting ? start() : stop();
        }).observe(hero);

        document.addEventListener("visibilitychange", () => {
            document.hidden ? stop() : start();
        });

        window.addEventListener("resize", resize);
        resize();
        start();
    }

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    if (reducedMotion) {
        revealEls.forEach((el) => el.classList.add("visible"));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealEls.forEach((el) => io.observe(el));
    }

    /* ---------- Project filters ---------- */
    const chips = document.querySelectorAll("#filters .chip");
    const cards = document.querySelectorAll("#projects-grid .project-card");

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            const filter = chip.dataset.filter;
            cards.forEach((card) => {
                const show = filter === "all" || card.dataset.cat === filter;
                card.classList.toggle("hidden", !show);
            });
        });
    });

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
