/* dashboard.js  –  page script for "Dashboard" (loads after core.js) */
V.dashboard = function () {
    const h = new Date().getHours(),
        n = cur != null ? B[cur] : null;
    return `<h1>Good ${h < 12 ? "morning" : h < 18 ? "afternoon" : "evening"}, ${user.nick} 🌷</h1><p class="sub">Your shelf missed you.</p><div class="g3"><div class="card stat"><b>${18 + Object.keys(prog).filter((i) => prog[i] >= B[i].p).length}</b>books read this year</div><div class="card stat"><b>${Object.keys(prog).length}</b>on your desk</div><div class="card stat"><b>${active().length}</b>active reserves</div></div>
${n ? `<h2>Continue reading</h2><div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><div style="width:80px">${cover(n)}</div><div style="flex:1;min-width:180px"><h3>${n.t}</h3><div class="bar"><i style="width:${(prog[cur] / n.p) * 100}%"></i></div><small class="sub">Page ${prog[cur]} of ${n.p}</small></div><button class="btn" onclick="go('study')">Open desk</button></div>` : ""}
<h2>Member card</h2>${mcard()}<h2>Picked for you</h2><div class="grid">${B.filter((b, i) => i % 5 == 2 || i == 8)
        .slice(0, 4)
        .map(bk)
        .join("")}</div>`;
};
const mcard = () => {
    const p = PL[user.plan] || PL[0],
        g = user.plan == 2;
    return `<div style="background:${p.out};padding:10px;border-radius:28px;max-width:560px"><div class="mc" style="background:${p.bg};color:${p.txt}"><div class="in" style="border-color:${p.dash}"><span class="pr">PETAL &amp; PAGE &nbsp;·&nbsp; MEMBER CARD</span> <span class="tag" style="background:${p.chip};color:${p.cc};margin:0 0 0 6px;font-weight:700">${p.n.toUpperCase()}${g ? " ★" : ""}</span><h2>${user.name}</h2><p>Reader : Since <b>${user.since}</b></p><p class="id" style="color:${g ? "#ffd97a" : p.dash}">ID : ${user.id.replace(/(\d+)/, "<b>$1</b>")}</p><div class="pf av">${avH()}</div><div class="stamp" style="border-color:${p.dash};color:${p.dash}"><span>VALID<br>THRU 2027</span></div></div></div></div>`;
};

render();
