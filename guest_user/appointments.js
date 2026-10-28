/* appointments.js  –  page script for "VIP Appointments" (loads after core.js) */
// ---- VIP appointments ----
let ap = Object.assign({ t: 0, note: "" }, firstSlot());
function setAp(k, v) {
    ap[k] = v;
    if (k == "date") ap.slot = slotsFor(v)[0];
    render(true);
}
function bookApt() {
    AP.unshift({ id: Date.now(), t: ap.t, date: ap.date, slot: ap.slot, note: ap.note.trim() });
    ls.set("pp5_apt", AP);
    ap.note = "";
    say("Appointment booked");
    render(true);
}
function cancelApt(id) {
    AP = AP.filter((a) => a.id != id);
    ls.set("pp5_apt", AP);
    render(true);
}
V.appointments = () => {
    if (user.plan < 2)
        return `<div class="card stat" style="max-width:560px;margin:24px auto"><div>${ic("lock", 64)}</div><h1 style="font-size:28px">VIP members only</h1><p class="sub">Book rare-collection viewings, research consults with our librarians and private study rooms. Upgrade to VIP to unlock this page.</p><ul style="list-style:none;padding:0;line-height:2;font-size:14px;margin-bottom:14px">${APT.map((x) => `<li>✓ ${x}</li>`).join("")}</ul><button class="btn" onclick="buy(2)">Purchase VIP — ৳300 / month</button></div>`;
    const ch = (on, fn, t) => `<span class="chip ${on ? "on" : ""}" onclick="${fn}">${t}</span>`;
    return `<h1>Booked appointments <span class="tag" style="background:#ffd97a;color:#4a2c00;font:700 12px Poppins;vertical-align:middle">VIP</span></h1><p class="sub">Rare collection, research help and private study rooms — by appointment.</p><div class="g3" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))"><div class="card"><h3>Book a visit</h3><p class="sub" style="margin:8px 0 6px">What do you need?</p><div class="chips">${APT.map((t, i) => ch(ap.t == i, `setAp('t',${i})`, t)).join("")}</div><p class="sub" style="margin-bottom:6px">Day</p><div class="chips">${dayOpts()
        .filter((d) => slotsFor(iso(d)).length)
        .map((d) =>
            ch(
                ap.date == iso(d),
                `setAp('date','${iso(d)}')`,
                d.toLocaleDateString("en", { weekday: "short", day: "numeric" }),
            ),
        )
        .join("")}</div><p class="sub" style="margin-bottom:6px">Time slot</p><div class="chips">${slotsFor(ap.date)
        .map((s) => ch(ap.slot == s, `setAp('slot','${s}')`, s))
        .join(
            "",
        )}</div><input placeholder="Notes (e.g. title you'd like to see)" value="${esc(ap.note)}" oninput="ap.note=this.value"><button class="btn" onclick="bookApt()">Book appointment</button></div><div class="card"><h3>Your appointments</h3>${AP.map((a) => `<div class="row"><span><b>${APT[a.t]}</b><br><small class="sub">${dl(a.date)} · ${a.slot}${a.note ? " · " + esc(a.note) : ""}</small></span><button class="btn o" onclick="cancelApt(${a.id})">Cancel</button></div>`).join("") || "<p class='sub' style='margin-top:8px'>No appointments yet.</p>"}</div></div>`;
};

render();
