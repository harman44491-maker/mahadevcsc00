/* Shared helpers + Supabase client for Mahadev Computer Service Center */

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ---------- tiny DOM helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function toast(el, msg, type = "err") {
  if (!el) return;
  el.textContent = msg;
  el.className = "alert show " + type;
  if (type === "ok") setTimeout(() => el.classList.remove("show"), 5000);
}
const fmtDate = (d) =>
  new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

/* ---------- auth guard ---------- */
async function requireUser(redirect = "login.html") {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.href = redirect; return null; }
  return session.user;
}
async function requireAdmin() {
  const user = await requireUser("admin-login.html");
  if (!user) return null;
  const { data } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin") { location.href = "admin-login.html"; return null; }
  return user;
}

/* ---------- nav state (login/logout links) ---------- */
async function renderNav() {
  const box  = $("#navAuth");
  const cbox = $("#navChat");
  if (!box) return;
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    const name = session.user.user_metadata?.full_name || session.user.email;
    box.innerHTML = `<a href="dashboard.html">Dashboard</a>
      <a href="#" id="logoutBtn">Logout (${name.split(" ")[0]})</a>`;
    if (cbox) cbox.innerHTML = `<a href="chat.html" class="cta">Live Chat</a>`;
    $("#logoutBtn").onclick = async (e) => {
      e.preventDefault(); await sb.auth.signOut(); location.href = "index.html";
    };
  } else {
    box.innerHTML = `<a href="login.html">Login</a><a href="register.html" class="cta">Register</a>`;
    if (cbox) cbox.innerHTML = `<a href="chat.html" class="cta">Live Chat</a>`;
  }
}

/* ---------- services catalogue (shared) ---------- */
const SERVICES = [
  { id:"laptop-repair",   icon:"💻", name:"Laptop & Desktop Repair",  desc:"Hardware faults, screen replacement, keyboard, battery, overheating and full diagnostics." },
  { id:"printer-service", icon:"🖨️", name:"Printer Sales & Service", desc:"Inkjet & laser printer repair, cartridge refilling, network printing setup and AMC." },
  { id:"cctv-install",    icon:"📹", name:"CCTV Installation",        desc:"HD & IP camera supply, installation, DVR/NVR configuration and mobile viewing." },
  { id:"software-os",     icon:"⚙️", name:"Software & OS Installation", desc:"Windows/Linux install, MS Office, drivers, antivirus and full system formatting." },
  { id:"data-recovery",   icon:"💾", name:"Data Recovery & Backup",   desc:"Recovery from crashed drives, pen drives and memory cards; scheduled cloud backup." },
  { id:"networking",      icon:"🌐", name:"Networking & Wi-Fi",       desc:"Router setup, LAN cabling, Wi-Fi range extension and small-office network design." },
  { id:"amc",             icon:"📋", name:"Annual Maintenance (AMC)", desc:"Yearly contracts for offices, schools and shops with priority on-site support." },
  { id:"accessories",     icon:"🛒", name:"Computer Accessories",     desc:"Laptop bags, RAM, SSD upgrades, mouse, keyboard, UPS and genuine spares." },
  { id:"onsite",          icon:"🚚", name:"On-Site / Doorstep Visit", desc:"Technician visits your home or office anywhere in the local service area." },
];
const findService = (id) => SERVICES.find((s) => s.id === id);

/* ---------- render service cards into #serviceGrid ---------- */
function renderServiceCards(mount, limit) {
  if (!mount) return;
  const list = limit ? SERVICES.slice(0, limit) : SERVICES;
  mount.innerHTML = list.map((s) => `
    <article class="card">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <a class="btn sm" href="service-detail.html?id=${s.id}">Book / Enquire →</a>
    </article>`).join("");
}

/* ---------- page bootstraps ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderServiceCards($("#serviceGrid"), Number($("#serviceGrid")?.dataset.limit) || 0);
});
