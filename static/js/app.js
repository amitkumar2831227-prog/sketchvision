/* SketchVision frontend shell.
   - Hash router (#/academy, #/tools/loomis ...) so one cached page works offline.
   - Each page is a function returning HTML for #view; later modules move to their own files.
   - Foundation stage keeps lesson completion in localStorage; the Progress module
     will move this to the SQLite backend once login exists. */
(() => {
  const view = document.getElementById("view");
  const netEl = document.getElementById("net");

  // Escape text before putting it in HTML (lesson data now, user data later).
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const store = {
    done() { try { return JSON.parse(localStorage.getItem("sv_done") || "[]"); } catch { return []; } },
    toggle(id) {
      const d = this.done(), i = d.indexOf(id);
      i < 0 ? d.push(id) : d.splice(i, 1);
      localStorage.setItem("sv_done", JSON.stringify(d));
    }
  };

  let lessons = [];
  async function loadLessons() {
    try { lessons = await (await fetch("/static/data/lessons.json")).json(); } catch { lessons = []; }
  }

  // Tool modules, with honest connectivity needs.
  const tools = [
    {id:"loomis", name:"Loomis Converter", net:"Needs internet (face detection runs on the server)", text:"Overlay an approximate Loomis head construction on a face photo."},
    {id:"reference", name:"Reference Studio", net:"Works offline", text:"Crop, zoom, rotate, grayscale, brightness and contrast for reference images."},
    {id:"analyzer", name:"Sketch Analyzer", net:"Needs internet", text:"Grayscale, edge and contour views of your sketch. Image measurements only, not an art critique."},
    {id:"shading", name:"Shading Trainer", net:"Works offline", text:"Tonal scales, gradients and hatching exercises."}
  ];

  const pages = {
    home() {
      const done = store.done().length, pct = lessons.length ? Math.round(done / lessons.length * 100) : 0;
      return `<h1>Dashboard</h1>
      <section class="panel"><h2>Lesson progress</h2>
        <p class="muted">${done} of ${lessons.length} lessons complete</p>
        <div class="bar" role="progressbar" aria-label="Lessons complete" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div></section>
      <div class="grid two">
        <a class="panel item" href="#/academy"><h3>Continue learning</h3><p class="muted">Lessons for every level.</p></a>
        <a class="panel item" href="#/tools"><h3>Open a tool</h3><p class="muted">Loomis, reference, analyzer, shading.</p></a>
      </div>
      <p><a href="#/offline">What works offline?</a></p>`;
    },
    academy(id) {
      if (id) return pages.lesson(id);
      return `<h1>Drawing Academy</h1>` + ["beginner", "intermediate", "advanced"].map(l => `
        <h2>${l[0].toUpperCase() + l.slice(1)}</h2><div class="grid">
        ${lessons.filter(x => x.level === l).map(x => `
          <a class="panel item" href="#/academy/${esc(x.id)}"><h3>${esc(x.title)}</h3>
          <p class="muted">${esc(x.summary)}</p>${store.done().includes(x.id) ? '<span class="tag">Completed</span>' : ""}</a>`).join("")}
        </div>`).join("");
    },
    lesson(id) {
      const x = lessons.find(l => l.id === id);
      if (!x) return `<h1>Lesson not found</h1><p><a href="#/academy">Back to Academy</a></p>`;
      const d = store.done().includes(id);
      return `<p><a href="#/academy">Back to Academy</a></p><h1>${esc(x.title)}</h1>
        <span class="tag">${esc(x.level)}</span><p>${esc(x.summary)}</p>
        <ol class="steps">${x.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        <button class="btn${d ? " alt" : ""}" data-toggle="${esc(id)}">${d ? "Mark as not done" : "Mark lesson complete"}</button>`;
    },
    tools(id) {
      const t = tools.find(x => x.id === id);
      if (!t) return `<h1>Tools</h1><div class="grid">${tools.map(t => `
        <a class="panel item" href="#/tools/${t.id}"><h3>${esc(t.name)}</h3><p>${esc(t.text)}</p><p class="muted">${esc(t.net)}</p></a>`).join("")}</div>`;
      return `<p><a href="#/tools">Back to Tools</a></p><h1>${esc(t.name)}</h1>
        <p class="muted">${esc(t.net)}</p>
        <div class="note">This module is not built yet. It is a later step in the build plan.</div>
        ${id === "loomis" ? `<div class="note">The finished Loomis guide will be a 2D approximation from detected landmarks, not a 3D reconstruction. You will be able to adjust it by hand.</div>` : ""}`;
    },
    gallery() { return `<h1>My Sketch Gallery</h1><p>Saved sketches will appear here with categories, tags and search.</p><div class="note">Saving needs an account and internet. Coming after User Management.</div>`; },
    progress() {
      const d = store.done();
      return `<h1>Progress</h1><div class="panel"><h2>Lessons</h2><table><tbody>${lessons.map(l => `
        <tr><td>${esc(l.title)}</td><td>${d.includes(l.id) ? "Complete" : "Not started"}</td></tr>`).join("")}</tbody></table></div>
        <p class="muted">Practice history charts (Chart.js) arrive with the Progress module. For now, completion is saved on this device only.</p>`;
    },
    account() { return `<h1>Account</h1><div class="note">Registration and login are not built yet. They will use hashed passwords and secure session cookies.</div>`; },
    offline() {
      return `<h1>Offline and online</h1><table><thead><tr><th>Feature</th><th>Offline</th></tr></thead><tbody>
        <tr><td>Lessons you have opened once</td><td>Yes</td></tr>
        <tr><td>Reference Studio, Shading Trainer</td><td>Yes (when built)</td></tr>
        <tr><td>Loomis face detection, Sketch Analyzer</td><td>No, runs on the server</td></tr>
        <tr><td>Register, log in, save to gallery</td><td>No</td></tr></tbody></table>`;
    }
  };

  function route() {
    const [, name = "", id] = location.hash.slice(1).split("/");
    const key = name || "home";
    view.innerHTML = (pages[key] || pages.home)(id);
    document.querySelectorAll(".tabs a").forEach(a => {
      if (a.dataset.r === key) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    view.focus(); window.scrollTo(0, 0);
  }

  view.addEventListener("click", e => {
    const b = e.target.closest("[data-toggle]");
    if (b) { store.toggle(b.dataset.toggle); route(); }
  });

  const showNet = () => { netEl.textContent = navigator.onLine ? "" : "Offline"; };
  addEventListener("online", showNet); addEventListener("offline", showNet);
  addEventListener("hashchange", route);

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  showNet();
  loadLessons().then(route);
})();
