/* ============================================================
   RUTVIK SAI — portfolio v3 engine
   Loader · custom cursor · depth particle field · split reveals
   magnetic elements · tilt + spotlight cards · counters · clocks
   ============================================================ */

(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const interactive = finePointer && !reducedMotion;

    if (document.documentElement.classList.contains("js") === false) {
        document.documentElement.classList.add("js");
    }

    /* ---------- helpers ---------- */
    const lerp = (a, b, t) => a + (b - a) * t;

    /* ---------- theme ---------- */
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = themeToggle.querySelector("i");

    themeToggle.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        themeIcon.className = next === "dark" ? "fas fa-sun" : "fas fa-moon";
    });
    themeIcon.className =
        (localStorage.getItem("theme") || "dark") === "dark" ? "fas fa-sun" : "fas fa-moon";

    /* ---------- scroll progress ---------- */
    const progressBar = document.getElementById("progress-bar");
    addEventListener("scroll", () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        progressBar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
    }, { passive: true });

    /* ---------- custom cursor ---------- */
    if (interactive) {
        document.documentElement.classList.add("fine");
        const dot = document.getElementById("cursor-dot");
        const ring = document.getElementById("cursor-ring");
        let mx = -100, my = -100, rx = -100, ry = -100;

        addEventListener("mousemove", (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx - 3.5}px, ${my - 3.5}px)`;
        }, { passive: true });

        (function ringLoop() {
            rx = lerp(rx, mx, 0.16);
            ry = lerp(ry, my, 0.16);
            const s = ring.classList.contains("grow") ? 32 : 19;
            ring.style.transform = `translate(${rx - s}px, ${ry - s}px)`;
            requestAnimationFrame(ringLoop);
        })();

        const growSel = "a, button, .chip, .project-card";
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(growSel)) ring.classList.add("grow");
        });
        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(growSel)) ring.classList.remove("grow");
        });
    }

    /* ---------- depth particle field ---------- */
    const canvas = document.getElementById("field");
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext("2d");
        const hero = canvas.parentElement;
        const DPR = Math.min(devicePixelRatio || 1, 1.75);
        let W = 0, H = 0, pts = [], rafId = null, running = false;
        let mouse = { x: -9999, y: -9999 };
        const LINK = 130;

        const rgb = () =>
            document.documentElement.getAttribute("data-theme") === "light" ? "16, 16, 20" : "235, 235, 235";

        function resize() {
            W = hero.offsetWidth; H = hero.offsetHeight;
            canvas.width = W * DPR; canvas.height = H * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            seed(); if (!running) draw();
        }

        function seed() {
            const n = Math.min(110, Math.floor((W * H) / 14000));
            pts = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                z: 0.25 + Math.random() * 0.75,          // depth: 0.25 far, 1 near
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            }));
        }

        function draw() {
            const color = rgb();
            ctx.clearRect(0, 0, W, H);

            for (const p of pts) {
                if (!reducedMotion) {
                    // mouse repulsion, stronger for near particles
                    const dx = p.x - mouse.x, dy = p.y - mouse.y;
                    const d = Math.hypot(dx, dy);
                    if (d < 130 && d > 0.01) {
                        const f = ((130 - d) / 130) * 0.9 * p.z;
                        p.x += (dx / d) * f * 2.2;
                        p.y += (dy / d) * f * 2.2;
                    }
                    p.x += p.vx * p.z;
                    p.y += p.vy * p.z;
                    if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
                    if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
                }
            }

            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const a = pts[i], b = pts[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
                    const d = Math.hypot(dx, dy);
                    if (d < LINK) {
                        const alpha = (1 - d / LINK) * 0.32 * Math.min(a.z, b.z);
                        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                    }
                }
            }

            for (const p of pts) {
                ctx.fillStyle = `rgba(${color}, ${0.25 + p.z * 0.5})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r = (0.8 + p.z * 1.8), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function loop() { draw(); rafId = requestAnimationFrame(loop); }
        const start = () => { if (!running && !reducedMotion) { running = true; rafId = requestAnimationFrame(loop); } };
        const stop = () => { running = false; if (rafId) cancelAnimationFrame(rafId); };

        hero.addEventListener("mousemove", (e) => {
            const r = canvas.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        }, { passive: true });
        hero.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

        // parallax drift on scroll
        addEventListener("scroll", () => {
            canvas.style.transform = `translateY(${scrollY * 0.14}px)`;
        }, { passive: true });

        new IntersectionObserver((en) => en[0].isIntersecting ? start() : stop()).observe(hero);
        document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
        addEventListener("resize", resize);
        resize(); start();
    }

    /* ---------- typewriter ---------- */
    const phrases = ["builder.", "problem solver.", "quant enthusiast.", "competitive programmer.", "robotics tinkerer."];
    const typeEl = document.getElementById("typewriter");
    if (typeEl) {
        if (reducedMotion) typeEl.textContent = phrases[0];
        else {
            let pi = 0, ci = 0, del = false;
            (function tick() {
                const w = phrases[pi];
                ci += del ? -1 : 1;
                typeEl.textContent = w.slice(0, ci);
                let d = del ? 38 : 82;
                if (!del && ci === w.length) { d = 1900; del = true; }
                else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; d = 380; }
                setTimeout(tick, d);
            })();
        }
    }

    /* ---------- char split (hero title) ---------- */
    document.querySelectorAll("[data-chars]").forEach((word) => {
        const text = word.textContent;
        word.textContent = "";
        [...text].forEach((ch, i) => {
            const s = document.createElement("span");
            s.className = "ch";
            s.textContent = ch;
            s.style.transitionDelay = `${0.15 + i * 0.04}s`;
            word.appendChild(s);
        });
    });

    /* ---------- word split (section titles) ---------- */
    document.querySelectorAll("[data-split]").forEach((el) => {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = "";
        words.forEach((w, i) => {
            const mask = document.createElement("span");
            mask.className = "w";
            const inner = document.createElement("span");
            inner.className = "wi";
            inner.style.setProperty("--i", i);
            inner.textContent = w;
            mask.appendChild(inner);
            el.appendChild(mask);
        });
    });

    /* ---------- reveals + counters ---------- */
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add("visible");
            if (el.matches(".sec-head")) el.querySelector(".sec-title")?.classList.add("in");
            io.unobserve(el);
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal, .sec-head").forEach((el) => {
        if (reducedMotion) {
            el.classList.add("visible");
            el.querySelector?.(".sec-title")?.classList.add("in");
        } else io.observe(el);
    });

    const countIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            countIO.unobserve(el);
            const target = parseInt(el.dataset.count, 10);
            const prefix = el.dataset.prefix || "";
            if (reducedMotion) { el.textContent = prefix + target; return; }
            const t0 = performance.now(), dur = 1300;
            (function step(now) {
                const t = Math.min((now - t0) / dur, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = prefix + Math.round(eased * target);
                if (t < 1) requestAnimationFrame(step);
            })(t0);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll(".stat-num[data-count]").forEach((el) => countIO.observe(el));

    /* ---------- magnetic elements ---------- */
    if (interactive) {
        document.querySelectorAll("[data-magnetic]").forEach((el) => {
            el.addEventListener("mouseenter", () => { el.style.transition = "transform .18s ease-out"; });
            el.addEventListener("mousemove", (e) => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
            });
            el.addEventListener("mouseleave", () => {
                el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
                el.style.transform = "";
            });
        });
    }

    /* ---------- tilt + spotlight ---------- */
    document.querySelectorAll(".spot").forEach((el) => {
        el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            el.style.setProperty("--mx", x + "px");
            el.style.setProperty("--my", y + "px");
            if (interactive && el.classList.contains("project-card")) {
                const rx = ((y / r.height) - 0.5) * -5;
                const ry = ((x / r.width) - 0.5) * 5;
                el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            }
        }, { passive: true });
        el.addEventListener("mouseleave", () => {
            if (el.classList.contains("project-card")) {
                el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1), border-color .3s ease, box-shadow .3s ease";
                el.style.transform = "";
                setTimeout(() => { el.style.transition = ""; }, 500);
            }
        });
    });

    /* ---------- clocks (IST) ---------- */
    const clocks = document.querySelectorAll("[data-clock]");
    function tickClock() {
        let now;
        try {
            now = {
                short: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()),
                long: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date())
            };
        } catch {
            const d = new Date();
            const p = (n) => String(n).padStart(2, "0");
            now = { short: `${p(d.getHours())}:${p(d.getMinutes())}`, long: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` };
        }
        clocks.forEach((c) => { c.textContent = c.dataset.clock === "short" ? now.short : now.long; });
    }
    if (clocks.length) { tickClock(); setInterval(tickClock, 1000); }

    /* ---------- filters ---------- */
    const chips = document.querySelectorAll("#filters .chip");
    const cards = document.querySelectorAll("#projects-grid .project-card");
    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            const f = chip.dataset.filter;
            cards.forEach((card) => card.classList.toggle("hidden", f !== "all" && card.dataset.cat !== f));
        });
    });

    /* ---------- footer year ---------- */
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- preloader ---------- */
    const loader = document.getElementById("loader");
    const loaderCount = document.getElementById("loader-count");

    function reveal() {
        document.body.classList.remove("loading");
        document.body.classList.add("ready");
        loader.classList.add("done");
        loader.style.pointerEvents = "none";
    }

    if (reducedMotion || !loader) {
        reveal();
    } else {
        const t0 = performance.now(), dur = 1500;
        (function count(now) {
            const t = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            loaderCount.textContent = String(Math.round(eased * 100)).padStart(3, "0");
            if (t < 1) requestAnimationFrame(count);
            else setTimeout(reveal, 250);
        })(t0);
    }
})();
