/* book.js  –  page script for "Book details" (loads after core.js) */
V.book = function (i) {
    const b = B[i],
        rel = B.filter((x) => x.g == b.g && x.id != i).slice(0, 4);
    return `<div class="det"><div><h1>${b.t}</h1><p class="sub" style="font-size:17px">${b.a}</p><p>${[b.g.toLowerCase(), ...b.tg].map((t) => `<span class="tag">${t}</span>`).join("")}</p><p style="line-height:1.7;margin-bottom:18px;font-size:14px">${b.d}<br><br>Free to read legally via ${src(b)}. Track your pages in the Study Zone.</p>
<a class="fmt" href="${b.l}" target="_blank" rel="noopener">Read online<b>FREE</b></a><span class="fmt" onclick="start(${i})">Study Zone<b>Track pages</b></span><span class="fmt" onclick="${b.g == "Manga" || b.g == "Manhwa" ? "say('Digital only — read free online 📱')" : `reserve(${i})`}">Paperback<b>Reserve</b></span><span class="fmt" onclick="wl(${i})">${wish.includes(i) ? "💖" : "🤍"}<b>Wishlist</b></span></div><div class="cv">${cover(b)}</div></div>
<h2>You may like</h2><div class="grid">${rel.map(bk).join("")}</div>`;
};
const ob = V.book;
V.book = (i) =>
    ob(i).replace(
        'target="_blank" rel="noopener">Read online',
        'target="_blank" rel="noopener" onclick="startRead(' + i + ')">Read online',
    ) + revHTML(i);
let rm = {};
function reserve(i) {
    if (!user) return need();
    const c = avail(i);
    if (!c) return say("Digital title — read it free online");
    const p = PL[user.plan];
    if (active().some((r) => r.b == i)) return say("You already have a reservation for this book");
    if (active().filter((r) => r.mode != "queue").length >= p.ph && c.a)
        return say(p.n + " allows " + p.ph + " physical reservations — upgrade for more");
    const f = firstSlot();
    rm = { b: i, mode: "library", date: f.date, slot: f.slot };
    drawRes();
    $("#auth").classList.add("show");
}
function drawRes() {
    const c = avail(rm.b),
        ch = (on, fn, t) => `<span class="chip ${on ? "on" : ""}" onclick="${fn}">${t}</span>`;
    $("#authBox").style.maxWidth = "460px";
    $("#authBox").innerHTML =
        `<h2 style="margin-top:0">Reserve a copy</h2><p class="sub"><b>${esc(B[rm.b].t)}</b><br>${c.a ? c.a + " of " + c.t + " copies free right now" : "All copies are out — you'll join the queue"}</p>${
            c.a
                ? `<p class="sub" style="margin-bottom:6px">How will you read it?</p><div class="chips">${ch(rm.mode == "library", "rm.mode='library';drawRes()", "Read in the library")}${ch(rm.mode == "borrow", "rm.mode='borrow';drawRes()", "Borrow &amp; pick up")}</div><p class="sub" style="margin-bottom:6px">${rm.mode == "library" ? "Choose a day" : "Pick-up day"}</p><div class="chips">${dayOpts()
                      .filter((d) => slotsFor(iso(d)).length)
                      .map((d) =>
                          ch(
                              rm.date == iso(d),
                              `rm.date='${iso(d)}';rm.slot=slotsFor(rm.date)[0];drawRes()`,
                              d.toLocaleDateString("en", { weekday: "short", day: "numeric" }),
                          ),
                      )
                      .join(
                          "",
                      )}</div><p class="sub" style="margin-bottom:6px">Time slot</p><div class="chips">${slotsFor(
                      rm.date,
                  )
                      .map((s) => ch(rm.slot == s, `rm.slot='${s}';drawRes()`, s))
                      .join("")}</div>`
                : ""
        }<button class="btn" style="width:100%" onclick="confirmRes()">${c.a ? "Confirm reservation" : "Join the queue"}</button>`;
}
async function confirmRes() {
    const c = avail(rm.b),
        p = PL[user.plan];
    if (!c.a && RS.filter((r) => r.mode == "queue" && resState(r) == "queue").length >= p.hold)
        return say(p.n + " allows " + p.hold + " hold request(s) — upgrade for more");
    try {
        // the server saves it (and decides if a copy is really free); the librarian sees it straight away
        await reservationsApi({ action: "create", title: B[rm.b].t, mode: rm.mode, date: rm.date, slot: rm.slot });
    } catch (e) {
        return say(e.message);
    }
    const mine = RS.find((r) => r.b == rm.b && resState(r) != "done");
    $("#auth").classList.remove("show");
    say(mine && mine.mode == "queue" ? "Added to the queue" : "Reserved!");
    go("reservation");
    render(true);
}
const lockCard = `<div class="card" style="margin-bottom:14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">${ic("lock", 44)}<div style="flex:1;min-width:200px"><b>Members only</b><p class="sub" style="margin:2px 0 0;font-size:13px">Log in to read online, use the Study Zone, reserve a copy and add to your wishlist.</p></div><span><button class="btn" onclick="auth('in')">Log in</button> <button class="btn o" onclick="auth('up')">Sign up</button></span></div>`;
const availBlock = (i) => `<div style="margin:0 0 12px">${avl(B[i])}</div>`;
const guestRev = (i) => {
    const [a, c] = avgR(i);
    return `<h2>Ratings &amp; reviews</h2><div class="card" style="margin-bottom:14px;display:flex;gap:18px;align-items:center;flex-wrap:wrap"><div class="stat"><b>${c ? a.toFixed(1) : "—"}</b>${stx(a, 18)}<br><small class="sub">${c} rating${c == 1 ? "" : "s"}</small></div><p class="sub" style="margin:0">Log in to rate and review this book.</p></div>${RV.filter(
        (r) => r.b == i,
    )
        .map(
            (r) =>
                `<div class="card" style="margin-bottom:10px"><div class="row" style="border:0;padding:0"><b>${esc(r.u)} <small class="sub">· ${r.d}</small></b><span>${stx(r.r)}</span></div>${r.t ? `<p style="font-size:14px;margin-top:6px;line-height:1.6">${esc(r.t)}</p>` : ""}</div>`,
        )
        .join("")}`;
};
const rb = V.book;
V.book = (i) => {
    const mk = (h) => h.replace('<p style="line-height:1.7', availBlock(i) + '<p style="line-height:1.7');
    if (!user)
        return (
            mk(
                ob(i)
                    .replace(/<a class="fmt"[\s\S]*?(?=<\/div><div class="cv">)/, lockCard)
                    .replace(/Free to read legally via[^<]*/, ""),
            ) + guestRev(i)
        );
    return mk(rb(i)).replace(
        /(💖|🤍)<b>Wishlist<\/b>/,
        (m, e) => ic(e == "💖" ? "heart" : "heart0", 28) + "<b>Wishlist</b>",
    );
};

render();
