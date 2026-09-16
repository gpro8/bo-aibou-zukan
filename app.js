const $ = (s, r = document) => r.querySelector(s);

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(arr) {
  return (arr || []).filter(Boolean);
}

function chips(arr) {
  return list(arr)
    .map((t) => `<span class="chip">${esc(t)}</span>`)
    .join("");
}

function sec(title, inner) {
  if (!inner) return "";
  return `<section class="sec"><h3>${esc(title)}</h3>${inner}</section>`;
}

function bullets(arr) {
  const xs = list(arr);
  if (!xs.length) return "";
  return `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
}

function padNo(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return "No. —";
  return `No.${String(x).padStart(3, "0")}`;
}

function cardHtml(e) {
  const owner = e.owner ? `主 ${esc(e.owner)}` : "主 未記入";
  const tag = "";
  return `<button class="card" type="button" data-id="${esc(e.id)}" aria-label="${esc(e.name)}">
    <div class="card-art"><img src="${esc(e.image)}" alt=""></div>
    <div class="card-meta">
      <div class="no">${padNo(e.no)}</div>
      <h2>${esc(e.name)} ${tag}</h2>
      <div class="en">${esc(e.nameEn || "")}</div>
      <div class="chips">${chips(e.types)}${e.species ? `<span class="chip">${esc(e.species)}</span>` : ""}</div>
      <p class="owner">${owner}</p>
    </div>
  </button>`;
}

function moreHtml(more) {
  const o = more && typeof more === "object" ? more : {};
  const keys = Object.keys(o).filter((k) => o[k] != null && String(o[k]).trim() !== "");
  if (!keys.length) return "";
  return keys
    .map((k) => sec(k, `<p>${esc(Array.isArray(o[k]) ? o[k].join(" · ") : o[k])}</p>`))
    .join("");
}

function modalHtml(e) {
  const fromFields = (e.fields || [])
    .filter((row) => Array.isArray(row) && row[0] && row[1])
    .map(([k, v]) => sec(k, `<p>${esc(v)}</p>`));
  const fallback = [
    sec("ひとこと", e.catchphrase ? `<p class="catch">${esc(e.catchphrase)}</p>` : ""),
    sec("種類", e.species ? `<p>${esc(e.species)}</p>` : ""),
    sec("属性", list(e.types).length ? `<p>${esc(e.types.join(" · "))}</p>` : ""),
    sec("性格", bullets(e.personality)),
    sec("好き", bullets(e.likes)),
    sec("特技", bullets(e.can)),
    moreHtml(e.more),
  ];
  const bits = [
    ...(fromFields.length ? fromFields : fallback),
    sec("主", `<p>${esc(e.owner || "未記入")}</p>`),
    sec("絵師", e.artist ? `<p>${esc(e.artist)}</p>` : ""),
  ].join("");
  return `
    <div class="modal-head">
      <div>
        <div class="no">${padNo(e.no)}</div>
        <h2>${esc(e.name)}</h2>
        <div class="en">${esc(e.nameEn || "")}</div>
      </div>
      <button class="close" type="button" data-close>閉じる</button>
    </div>
    <div class="modal-art"><img src="${esc(e.image)}" alt="${esc(e.name)}"></div>
    <div class="sections">${bits}</div>`;
}

async function main() {
  const res = await fetch("./data/entries.json");
  const data = await res.json();
  const entries = data.entries || [];
  $("[data-kicker]").textContent = data.kicker || "BushiDAO";
  $("[data-title]").textContent = data.title || "相棒図鑑";
  $("[data-blurb]").textContent = data.blurb || "";
  $("[data-license]").textContent = data.licenseNote || "";
  $("[data-count]").textContent = `${entries.length} 体`;
  const grid = $("[data-grid]");
  grid.innerHTML = entries.map(cardHtml).join("");

  const scrim = $("[data-scrim]");
  const body = $("[data-modal]");
  const byId = Object.fromEntries(entries.map((e) => [e.id, e]));

  function open(id) {
    const e = byId[id];
    if (!e) return;
    body.innerHTML = modalHtml(e);
    scrim.classList.add("open");
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  }
  function close() {
    scrim.classList.remove("open");
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }

  grid.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-id]");
    if (btn) open(btn.getAttribute("data-id"));
  });
  scrim.addEventListener("click", (ev) => {
    if (ev.target === scrim || ev.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") close();
  });

  const hash = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  if (hash && byId[hash]) open(hash);
}

main().catch((err) => {
  $("[data-blurb]").textContent = "図鑑を読み込めませんでした。";
  console.error(err);
});
