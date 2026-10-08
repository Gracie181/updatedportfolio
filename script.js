document.documentElement.classList.add("js");

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Theme (dark by default, remembers choice) ---------- */
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (e) {}
$("#theme").addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

/* ---------- Mobile menu ---------- */
const links = $("#links");
$("#menu").addEventListener("click", () => links.classList.toggle("open"));
$$("#links a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

/* ---------- Toast helper ---------- */
const toast = $("#toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* Links that aren't ready yet (e.g. Blog) */
$$("[data-soon]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  showToast("Blog coming soon");
}));

/* ---------- Scroll progress, nav state, active link ---------- */
const progress = $("#progress");
const sections = $$("main section[id]");
const navLinks = $$("#links a[href^='#']:not([href='#'])");

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  let current = sections[0].id;
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 140) current = s.id; });
  navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Reveal on scroll, counters, skill bars ---------- */
function countUp(el) {
  const target = +el.dataset.count;
  const duration = 1200;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("in");
    $$("[data-count]", el).forEach(countUp);
    $$(".bar i", el).forEach(b => (b.style.width = b.dataset.w + "%"));
    io.unobserve(el);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach(el => io.observe(el));

// Safety net: never leave content hidden or bars empty
setTimeout(() => {
  $$(".reveal").forEach(el => el.classList.add("in"));
  $$(".bar i").forEach(b => (b.style.width = b.dataset.w + "%"));
}, 3000);

/* ---------- Projects carousel (swipe / scroll, dots) ---------- */
const track = $("#track");
const cards = $$(".project", track);
const dots = $("#dots");
cards.forEach((_, i) => {
  const b = document.createElement("button");
  b.setAttribute("aria-label", "Go to project " + (i + 1));
  b.addEventListener("click", () => track.scrollTo({ left: i * (cards[0].offsetWidth + 22), behavior: "smooth" }));
  dots.appendChild(b);
});
function updateDots() {
  const maxScroll = track.scrollWidth - track.clientWidth;
  let i = Math.round(track.scrollLeft / (cards[0].offsetWidth + 22));
  if (maxScroll > 4 && track.scrollLeft >= maxScroll - 4) i = cards.length - 1;
  $$("button", dots).forEach((b, k) => b.classList.toggle("on", k === i));
}
track.addEventListener("scroll", updateDots, { passive: true });
updateDots();

/* ---------- Footer year ---------- */
$("#year").textContent = new Date().getFullYear();
