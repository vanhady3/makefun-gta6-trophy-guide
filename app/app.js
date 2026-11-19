const STORAGE_KEY = "leonida-tracker-v1";
const SPOILER_PLACEHOLDER = "Hidden trophy — enable spoilers to reveal";

const GRADE_LABELS = { platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
const KIND_LABELS = {
  platinum: "Platinum", story: "Story", side: "Side", hidden: "Hidden",
  activities: "Activities", heists: "Heists", vehicles: "Vehicles",
};
const GRADE_MARKS = { platinum: "◆", gold: "★", silver: "●", bronze: "●" };

let trophies = [];
let earned = new Set();
let spoilersOn = false;

const $ = (id) => document.getElementById(id);
const listEl = $("trophyList");
const detailPane = $("detailPane");
const detailBody = $("detailBody");

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) earned = new Set(data.earned.filter((n) => Number.isInteger(n)));
    if (typeof data.spoilers === "boolean") spoilersOn = data.spoilers;
  } catch {
    earned = new Set();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      earned: [...earned].sort((a, b) => a - b),
      spoilers: spoilersOn,
      savedAt: new Date().toISOString(),
    }));
  } catch { /* storage unavailable: progress lives only for this session */ }
}

function isHidden(t) { return t.hidden === true; }
function isRevealed(t) { return !isHidden(t) || spoilersOn; }
function displayName(t) { return isRevealed(t) ? t.name : "Hidden trophy"; }
function displayDesc(t) { return isRevealed(t) ? t.description : SPOILER_PLACEHOLDER; }

function visibleTrophies() {
  const q = $("searchInput").value.trim().toLowerCase();
  const kind = $("kindFilter").value;
  const grade = $("gradeFilter").value;
  const hideEarned = $("hideEarned").checked;
  return trophies.filter((t) => {
    if (kind !== "all" && t.kind !== kind) return false;
    if (grade !== "all" && t.grade !== grade) return false;
    if (hideEarned && earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderCounters() {
  const chips = [];
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
    chips.push(`<span class="counter-chip"><span class="grade-${grade}">${GRADE_LABELS[grade]}</span> <b>${got}/${total}</b></span>`);
  }
  for (const kind of ["story", "side", "hidden", "activities", "heists", "vehicles"]) {
    const total = trophies.filter((t) => t.kind === kind).length;
    if (!total) continue;
    const got = trophies.filter((t) => t.kind === kind && earned.has(t.id)).length;
    chips.push(`<span class="counter-chip">${KIND_LABELS[kind]} <b>${got}/${total}</b></span>`);
  }
  $("counters").innerHTML = chips.join("");
}

function renderProgress() {
  const total = trophies.length;
  const got = earned.size;
  const pct = total ? Math.round((got / total) * 100) : 0;
  $("earnedCount").textContent = String(got);
  $("progressFill").style.width = pct + "%";
  $("progressBar").setAttribute("aria-valuenow", String(got));
  $("progressLabel").textContent = pct + "% — " + (
    got === 0 ? "the road to platinum starts here." :
    got === total ? "Platinum! You are a Leonida Legend." :
    got >= 40 ? "almost there — the final grind." :
    got >= 20 ? "solid progress through Leonida." :
    "warming up — keep going."
  );
}

function renderList() {
  const shown = visibleTrophies();
  listEl.innerHTML = "";
  for (const t of shown) {
    const li = document.createElement("li");
    li.className = "trophy-card" + (earned.has(t.id) ? " earned" : "");
    li.dataset.id = String(t.id);

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "trophy-check";
    check.checked = earned.has(t.id);
    check.setAttribute("aria-label", "Mark " + displayName(t) + " as earned");
    check.addEventListener("click", (e) => e.stopPropagation());
    check.addEventListener("change", () => {
      if (check.checked) earned.add(t.id); else earned.delete(t.id);
      saveState();
      renderAll();
    });

    const body = document.createElement("div");
    const name = document.createElement("h3");
    name.className = "trophy-name";
    name.textContent = displayName(t);
    const desc = document.createElement("p");
    desc.className = "trophy-desc" + (isRevealed(t) ? "" : " spoiler-hidden");
    desc.textContent = displayDesc(t);
    const meta = document.createElement("div");
    meta.className = "trophy-meta";
    const gradeBadge = document.createElement("span");
    gradeBadge.className = "badge grade-" + t.grade;
    gradeBadge.textContent = GRADE_LABELS[t.grade];
    const kindBadge = document.createElement("span");
    kindBadge.className = "badge kind";
    kindBadge.textContent = KIND_LABELS[t.kind] || t.kind;
    meta.append(gradeBadge, kindBadge);
    if (t.missable) {
      const m = document.createElement("span");
      m.className = "badge missable";
      m.textContent = "Missable";
      meta.append(m);
    }
    body.append(name, desc, meta);

    const mark = document.createElement("span");
    mark.className = "trophy-grade-mark grade-" + t.grade + "-mark";
    mark.textContent = GRADE_MARKS[t.grade];
    mark.setAttribute("aria-hidden", "true");

    li.append(check, body, mark);
    li.addEventListener("click", () => openDetail(t));
    listEl.append(li);
  }
  $("emptyState").hidden = shown.length !== 0;
  $("resultsLine").textContent = "Showing " + shown.length + " of " + trophies.length + " trophies · " + earned.size + " earned";
}

function renderMissables() {
  const box = $("missableList");
  box.innerHTML = "";
  const missables = trophies.filter((t) => t.missable);
  for (const t of missables) {
    const card = document.createElement("article");
    card.className = "missable-card";
    const h = document.createElement("h3");
    h.textContent = displayName(t);
    const p = document.createElement("p");
    p.textContent = isRevealed(t) ? t.guide : SPOILER_PLACEHOLDER;
    card.append(h, p);
    box.append(card);
  }
  if (!missables.length) box.innerHTML = "<p>No missable trophies in the list.</p>";
}

function renderAll() {
  renderCounters();
  renderProgress();
  renderList();
  renderMissables();
}

function openDetail(t) {
  const revealed = isRevealed(t);
  const reported = (t.sources || []).some((s) => s.includes("reported, not confirmed"));
  detailBody.innerHTML = "";
  const h = document.createElement("h2");
  h.textContent = displayName(t);
  const desc = document.createElement("p");
  desc.className = "trophy-desc";
  desc.textContent = displayDesc(t);
  const meta = document.createElement("div");
  meta.className = "trophy-meta";
  const gradeBadge = document.createElement("span");
  gradeBadge.className = "badge grade-" + t.grade;
  gradeBadge.textContent = GRADE_LABELS[t.grade];
  const kindBadge = document.createElement("span");
  kindBadge.className = "badge kind";
  kindBadge.textContent = KIND_LABELS[t.kind] || t.kind;
  meta.append(gradeBadge, kindBadge);
  if (t.missable) {
    const m = document.createElement("span");
    m.className = "badge missable";
    m.textContent = "Missable";
    meta.append(m);
  }
  const dl = document.createElement("dl");
  const addRow = (term, valueEl) => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.append(valueEl);
    dl.append(dt, dd);
  };
  const guide = document.createElement("span");
  guide.className = "guide-text";
  guide.textContent = revealed ? t.guide : SPOILER_PLACEHOLDER;
  addRow("Guide", guide);
  const miss = document.createElement("span");
  miss.textContent = t.missable ? "Yes — see the Missables view." : "No";
  addRow("Missable", miss);
  const srcList = document.createElement("ul");
  for (const s of (t.sources || [])) {
    const li = document.createElement("li");
    li.textContent = s;
    srcList.append(li);
  }
  addRow("Sources", srcList);
  detailBody.append(h, desc, meta, dl);
  if (reported && revealed) {
    const note = document.createElement("p");
    note.className = "reported-note";
    note.textContent = "Reported, not confirmed in-game.";
    detailBody.append(note);
  }
  if (!revealed) {
    const note = document.createElement("p");
    note.className = "reported-note";
    note.textContent = "Turn on Show spoilers to reveal this trophy's guide.";
    detailBody.append(note);
  }
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "primary";
  toggleBtn.textContent = earned.has(t.id) ? "Mark as not earned" : "Mark as earned";
  toggleBtn.addEventListener("click", () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    saveState();
    renderAll();
    openDetail(t);
  });
  detailBody.append(toggleBtn);
  detailPane.hidden = false;
}

function closeDetail() { detailPane.hidden = true; }

function exportProgress() {
  const payload = {
    app: "Leonida Trophy Tracker",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    spoilers: spoilersOn,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-trophy-progress.json";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!data || !Array.isArray(data.earned)) throw new Error("bad file");
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(data.earned.filter((n) => Number.isInteger(n) && valid.has(n)));
      if (typeof data.spoilers === "boolean") {
        spoilersOn = data.spoilers;
        $("spoilerToggle").checked = spoilersOn;
      }
      saveState();
      renderAll();
    } catch {
      alert("That file could not be imported. It must be a progress JSON exported by this tracker.");
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  $("searchInput").addEventListener("input", renderList);
  $("kindFilter").addEventListener("change", renderList);
  $("gradeFilter").addEventListener("change", renderList);
  $("hideEarned").addEventListener("change", renderList);
  $("spoilerToggle").addEventListener("change", (e) => {
    spoilersOn = e.target.checked;
    saveState();
    renderAll();
  });
  $("exportBtn").addEventListener("click", exportProgress);
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importProgress(file);
    e.target.value = "";
  });
  $("resetBtn").addEventListener("click", () => {
    if (confirm("Clear all earned trophies? This cannot be undone.")) {
      earned = new Set();
      saveState();
      renderAll();
    }
  });
  $("detailClose").addEventListener("click", closeDetail);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDetail();
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      document.querySelectorAll(".view").forEach((v) => {
        v.hidden = v.id !== "view-" + tab.dataset.view;
        v.classList.toggle("active", v.id === "view-" + tab.dataset.view);
      });
    });
  });
}

async function init() {
  const res = await fetch("data/trophies.json");
  if (!res.ok) throw new Error("Could not load trophy data");
  trophies = await res.json();
  trophies.sort((a, b) => a.id - b.id);
  loadState();
  $("spoilerToggle").checked = spoilersOn;
  bindEvents();
  renderAll();
}

init().catch((err) => {
  listEl.innerHTML = "";
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "Could not load the trophy list. " + err.message;
  listEl.append(li);
});
