/* ==========================================================================
   محمد و مریم — interactions & animation
   ========================================================================== */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (n) => String(n).replace(/\d/g, (d) => faDigits[d]);

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    setTimeout(() => pre && pre.classList.add("hide"), reduce ? 200 : 1700);
  });

  /* ---------- Scroll progress ---------- */
  const bar = document.getElementById("scrollProgress");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        // stagger children
        const kids = e.target.querySelectorAll("[data-stagger]");
        kids.forEach((k, i) => setTimeout(() => k.classList.add("is-in"), i * 140));
        io.unobserve(e.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  /* ---------- Countdown to the wedding (31 Shahrivar 1405 → 22 Sep 2026, 18:00 Iran) ---------- */
  const target = new Date("2026-09-22T18:00:00+03:30").getTime();
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    min: document.getElementById("cd-min"),
    sec: document.getElementById("cd-sec"),
  };
  const last = {};
  function setUnit(el, val) {
    const s = toFa(val);
    if (el.textContent === s) return;
    el.textContent = s;
    if (!reduce) {
      el.classList.remove("flip");
      void el.offsetWidth; // reflow to restart animation
      el.classList.add("flip");
    }
  }
  function tick() {
    let diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    const m = Math.floor(diff / 60000);    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    if (last.d !== d) { setUnit(els.days, d); last.d = d; }
    if (last.h !== h) { setUnit(els.hours, h); last.h = h; }
    if (last.m !== m) { setUnit(els.min, m); last.m = m; }
    if (last.s !== s) { setUnit(els.sec, s); last.s = s; }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Add-to-calendar (.ics) ---------- */
  const calBtn = document.getElementById("calBtn");
  if (calBtn) {
    calBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const dt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const start = new Date("2026-09-22T18:00:00+03:30");
      const end = new Date("2026-09-22T22:00:00+03:30");
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding//FA//EN",
        "BEGIN:VEVENT",
        "UID:mohammad-maryam-1405@wedding",
        "DTSTAMP:" + dt(new Date()),
        "DTSTART:" + dt(start),
        "DTEND:" + dt(end),
        "SUMMARY:جشن عروسی محمد و مریم",
        "DESCRIPTION:مفتخریم به میزبانی شما عزیزان",
        "LOCATION:تالار تچرا، اندیشه، فاز یک، میدان صیاد شیرازی",
        "END:VEVENT", "END:VCALENDAR",
      ].join("\r\n");
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "wedding-mohammad-maryam.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      const label = calBtn.childNodes[calBtn.childNodes.length - 1];
      calBtn.classList.add("copied");
      if (label) label.textContent = " به تقویم اضافه شد ✓";
      setTimeout(() => {
        calBtn.classList.remove("copied");
        if (label) label.textContent = " افزودن به تقویم";
      }, 2400);
    });
  }

  /* ---------- Falling petals ---------- */
  if (!reduce) {
    const canvas = document.getElementById("petals");
    const ctx = canvas.getContext("2d");
    let W, H, petals;
    const COLORS = ["#f6e2c0", "#efd6ad", "#e9c98f", "#f3ddb0", "#f7ead0"];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const count = Math.min(38, Math.round(W / 34));
      petals = Array.from({ length: count }, makePetal);
    }
    function makePetal() {
      const r = 5 + Math.random() * 7;
      return {
        x: Math.random() * W,
        y: Math.random() * -H,
        r,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        sway: 0.6 + Math.random() * 1.2,
        speed: 0.4 + Math.random() * 0.9,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.03,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.5 + Math.random() * 0.4,
      };
    }
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.quadraticCurveTo(p.r, -p.r * 0.2, 0, p.r);
      ctx.quadraticCurveTo(-p.r, -p.r * 0.2, 0, -p.r);
      ctx.fill();
      ctx.restore();
    }
    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      for (const p of petals) {
        p.y += p.speed;
        p.x += Math.sin(t * 0.001 + p.phase) * p.sway * 0.5;
        p.angle += p.spin;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        drawPetal(p);
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(frame);
  }
})();
