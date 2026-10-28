/* reservation.js  –  page script for "My Reservations" (loads after core.js) */
async function cancelRes(id) {
    try {
        await reservationsApi({ action: "cancel", id });
        say("Reservation cancelled");
    } catch (e) {
        say(e.message);
    }
    render(true);
}
const resCard = (r) => {
    const b = B[r.b],
        s = resState(r),
        m = Math.round((slotT(r)[0] - new Date()) / 60000),
        rel =
            m >= 1440
                ? Math.floor(m / 1440) + "d " + Math.floor((m % 1440) / 60) + "h"
                : Math.floor(m / 60) + "h " + (m % 60) + "m",
        lab = s == "queue" ? "In queue · position " + r.pos : s == "now" ? "In progress" : "Starts in " + rel;
    return `<div class="card" style="display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap"><div style="width:84px">${cover(b)}</div><div style="flex:1;min-width:200px"><span class="pill ${r.mode == "library" ? "" : "p"}">${r.mode == "library" ? "Read in library" : r.mode == "queue" ? "Queue" : "Borrow · pick-up"}</span><h3 style="margin:8px 0 2px">${esc(b.t)}</h3><p class="sub" style="margin:0">${esc(b.a)}</p>${r.mode == "queue" ? "" : `<p style="margin:8px 0 0;font-size:14px">${dl(r.date)} · <b>${r.slot}</b></p><p class="sub" style="margin:2px 0 0">${r.mode == "library" ? r.desk : "Pick-up at Desk 2"} · Shelf ${r.shelf}</p>`}</div><div style="border-left:2px dashed var(--gb);padding-left:16px;display:flex;flex-direction:column;justify-content:center;gap:8px;min-width:150px"><b style="color:var(--co)">${lab}</b><button class="btn o" onclick="cancelRes(${r.id})">Cancel</button><button class="btn o" onclick="go('book/${r.b}')">View book</button></div></div>`;
};
V.reservation = () => {
    const A = active(),
        p = PL[user.plan],
        used = A.filter((r) => r.mode != "queue").length,
        past = RS.filter((r) => resState(r) == "done");
    return `<h1>My reservations</h1><p class="sub">Reserve a physical copy to read in the library or to borrow. Slots release automatically if you don't arrive.</p><div class="card" style="margin-bottom:16px"><div class="row" style="border:0;padding:0"><b>${used} of ${p.ph} physical slots used</b><span class="pill p">${p.n} · ${p.room}</span></div><div class="bar"><i style="width:${Math.min(100, (used / p.ph) * 100)}%"></i></div><button class="btn" onclick="go('browse')">Reserve another book</button></div>${A.map(resCard).join("") || `<div class="card stat">${ic("ticket", 52)}<h3>No reservations yet</h3><p class="sub">Find a book in Browse and tap Reserve.</p><button class="btn" onclick="go('browse')">Browse books</button></div>`}${
        past.length
            ? `<h2>Past visits</h2><div class="card">${past
                  .slice(0, 6)
                  .map(
                      (r) =>
                          `<div class="row"><span>${esc(B[r.b].t)}</span><small class="sub">${dl(r.date)} · ${r.slot}</small></div>`,
                  )
                  .join("")}</div>`
            : ""
    }`;
};

render();
