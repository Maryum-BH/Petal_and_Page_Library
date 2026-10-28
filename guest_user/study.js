/* study.js  –  page script for "Study Zone" (loads after core.js) */
const MS = [
    [1800, "30 min", "Small steps still move mountains — 30 minutes of pure focus! 🌱"],
    [3600, "1 hour", "One whole hour of cozy focus. Your future self is so proud of you 💖"],
    [7200, "2 hours", "Two hours deep in the pages — you're blooming beautifully 🌸"],
    [10800, "3 hours", "3 hours! Discipline is just self-love in action. Sip some water 💧"],
    [14400, "4 hours", "4 hours strong — a reader today, a legend tomorrow ✨"],
    [18000, "5 hours", "5 hours of pure dedication. The finish line is near, superstar 🌟"],
];
const hms = (s) => [(s / 3600) | 0, ((s % 3600) / 60) | 0, s % 60].map((x) => String(x).padStart(2, "0")).join(":");
function qbox(h, t, e) {
    document.querySelectorAll(".qm").forEach((x) => x.remove());
    const d = document.createElement("div");
    d.className = "qm";
    d.innerHTML = `<div style="font-size:46px">${e}</div><h2 style="margin:6px 0">${h}</h2><p style="line-height:1.6">${t}</p><button class="btn" style="margin-top:12px">Thank you 💕</button>`;
    d.onclick = () => d.remove();
    document.body.append(d);
    setTimeout(() => d.remove(), 14000);
}
function confetti() {
    for (let i = 0; i < 70; i++) {
        const c = document.createElement("span");
        c.className = "cf";
        c.textContent = ["🌸", "🎉", "💖", "⭐", "🌷", "🎊", "🦋"][i % 7];
        c.style.left = Math.random() * 100 + "vw";
        c.style.animationDelay = Math.random() * 1.5 + "s";
        document.body.append(c);
        setTimeout(() => c.remove(), 6000);
    }
}
setInterval(() => {
    if (dayD.d != new Date().toDateString()) dayD = { d: new Date().toDateString(), s: 0, f: [] };
    if (!sty || !user) return;
    dayD.s++;
    const e = $("#sd");
    e && (e.textContent = hms(dayD.s));
    for (const m of MS)
        if (dayD.s >= m[0] && !dayD.f.includes(m[0])) {
            dayD.f.push(m[0]);
            qbox(m[1] + " of focus!", m[2], "💌");
            render(true);
        }
    if (dayD.s >= 21600 && !dayD.f.includes(21600)) {
        dayD.f.push(21600);
        confetti();
        qbox(
            "6 HOURS TODAY! 🎉",
            "Congratulations, " +
                user.nick +
                "! You're an absolute reading superstar. Time to rest, snack & celebrate 🍰",
            "🏆",
        );
        render(true);
    }
    if (dayD.s % 5 == 0) ls.set("pp3_day", dayD);
}, 1000);
const scene1 = () => {
    const n = cur != null ? B[cur] : null,
        me = user.img
            ? `<clipPath id="cp"><circle cx="300" cy="150" r="46"/></clipPath><image href="${user.img}" x="254" y="104" width="92" height="92" clip-path="url(#cp)" preserveAspectRatio="xMidYMid slice"/>`
            : face(user.av, 96).replace("<svg ", "<svg x='252' y='102' ");
    return `<svg viewBox="0 0 640 360" style="width:100%;border-radius:28px;display:block;box-shadow:var(--sh)" role="img" aria-label="Cozy study desk"><defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeaf3"/><stop offset="1" stop-color="#ffd0e3"/></linearGradient></defs><rect width="640" height="360" fill="url(#w)"/><ellipse cx="330" cy="170" rx="260" ry="140" fill="#ffc2da" opacity=".4"/>
<path d="M0 22Q160 60 320 22T640 22" stroke="#c9a" stroke-width="1.5" fill="none" opacity=".6"/>${[40, 120, 200, 280, 360, 440, 520, 600].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 44 : 34}" r="5" fill="${["#fff3a8", "#ffb3d1", "#c9b8ff", "#b8f0d8"][i % 4]}"/>`).join("")}
<rect x="30" y="64" width="110" height="130" rx="55" fill="#cfe9ff" stroke="#fff" stroke-width="7"/><path d="M85 64v130M30 130h110" stroke="#fff" stroke-width="4"/><circle cx="60" cy="100" r="9" fill="#fff"/><circle cx="74" cy="98" r="11" fill="#fff"/>
<rect x="440" y="50" width="190" height="148" rx="12" fill="#e8c795" stroke="#fff" stroke-width="5"/><rect x="450" y="60" width="74" height="58" fill="#fff0a6" transform="rotate(-3 487 89)"/><text x="487" y="80" font-size="11" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">Dream</text><text x="487" y="94" font-size="11" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">Plan · Do</text><text x="487" y="108" font-size="11" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">Repeat ♥</text><rect x="534" y="58" width="86" height="42" fill="#cdbdf7" transform="rotate(3 577 79)"/><text x="577" y="76" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">One page</text><text x="577" y="88" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">at a time ♥</text><rect x="452" y="128" width="62" height="56" fill="#ffb3d1" transform="rotate(4 483 156)"/><text x="483" y="152" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">You can</text><text x="483" y="164" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">do it!</text><rect x="522" y="108" width="52" height="46" fill="#c4f0df" transform="rotate(-4 548 131)"/><text x="548" y="128" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">Read</text><text x="548" y="140" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">&amp; rest</text><rect x="580" y="108" width="42" height="42" fill="#ffd9b8" transform="rotate(5 601 129)"/><text x="601" y="126" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">Stay</text><text x="601" y="138" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">cozy ✦</text><rect x="528" y="160" width="86" height="30" fill="#fff" transform="rotate(-2 571 175)"/><text x="571" y="172" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">Small steps</text><text x="571" y="183" font-size="9" text-anchor="middle" fill="#6a3a5c" font-family="Poppins">every day ✿</text><circle cx="487" cy="62" r="3.5" fill="#ee6f9d"/><circle cx="577" cy="60" r="3.5" fill="#7fb2ff"/><circle cx="483" cy="130" r="3.5" fill="#ffd54a"/><circle cx="548" cy="110" r="3.5" fill="#ee6f9d"/>
<rect y="262" width="640" height="98" fill="#e5b98c"/><rect y="262" width="640" height="9" fill="#d6a276"/>
<rect x="56" y="240" width="110" height="22" rx="4" fill="#b9a8f0"/><text x="111" y="255" font-size="10" text-anchor="middle" fill="#fff" font-family="Poppins">NOVELS</text><rect x="62" y="218" width="98" height="22" rx="4" fill="#f6c667"/><text x="111" y="233" font-size="10" text-anchor="middle" fill="#fff" font-family="Poppins">MANGA</text><rect x="52" y="196" width="106" height="22" rx="4" fill="#ff9ec2"/><text x="105" y="211" font-size="10" text-anchor="middle" fill="#fff" font-family="Poppins">POEMS</text>
<path d="M105 176q-22-30-10-42 14 8 10 42ZM105 176q22-30 36-34-6 24-36 34Z" fill="#7cc46f"/><rect x="85" y="168" width="40" height="28" rx="8" fill="#fff"/><circle cx="97" cy="180" r="2" fill="#3a2a30"/><circle cx="113" cy="180" r="2" fill="#3a2a30"/><path d="M101 185q4 3 8 0" stroke="#3a2a30" fill="none" stroke-width="1.5"/><circle cx="92" cy="185" r="3" fill="#ffb3c6"/><circle cx="118" cy="185" r="3" fill="#ffb3c6"/>
<ellipse cx="300" cy="238" rx="100" ry="46" fill="#ff9ec2"/>${me}
<path d="M200 262L212 160H392L404 262Z" fill="#b9bcc9"/><rect x="214" y="162" width="176" height="92" rx="4" fill="#f4f1fa"/><rect x="190" y="262" width="224" height="8" rx="4" fill="#9a9db0"/><text x="226" y="184" font-size="11" fill="#6a3a5c" font-family="Playfair Display" font-weight="700">${n ? esc(n.t.slice(0, 24)) : "Pick a book"}</text><text id="lp" x="226" y="202" font-size="9.5" fill="#8a5a7a" font-family="Poppins">${n ? `Page ${prog[cur]} / ${n.p}` : "Browse → Study Zone"}</text><text id="lt" x="226" y="217" font-size="9.5" fill="#b0869f" font-family="Poppins">${n ? "On this page: " + mmss(pageSec(cur)) : ""}</text><text id="lr" x="226" y="232" font-size="9.5" fill="#b0869f" font-family="Poppins">${n ? "Pages read today: " + todayPages() : ""}</text><text x="226" y="247" font-size="8.5" fill="#ee6f9d" font-family="Poppins">${sess ? "● reading live" : ""}</text><rect x="352" y="222" width="34" height="28" fill="#fff0a6" transform="rotate(5 369 236)"/><text x="369" y="233" font-size="7" text-anchor="middle" fill="#6a3a5c">Keep</text><text x="369" y="242" font-size="7" text-anchor="middle" fill="#6a3a5c">Growing</text>
<rect x="436" y="228" width="34" height="36" rx="7" fill="#3a2a40"/><path d="M470 238q14 2 0 18" stroke="#3a2a40" stroke-width="5" fill="none"/><text x="453" y="246" font-size="8" text-anchor="middle" fill="#fff" font-family="Poppins">READ</text><text x="453" y="256" font-size="9" text-anchor="middle" fill="#ff9ec2">♥</text><path d="M446 222q-4-8 2-14M456 222q-4-8 2-14" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
<g transform="rotate(-18 506 236)"><rect x="494" y="196" width="7" height="42" rx="2" fill="#7ed39a"/><path d="M494 196l3.5-9 3.5 9z" fill="#f3d6b0"/><path d="M496 190l1.5-3.5 1.5 3.5z" fill="#3a2a30"/></g><g transform="rotate(0 506 236)"><rect x="503" y="196" width="7" height="42" rx="2" fill="#ffd54a"/><path d="M503 196l3.5-9 3.5 9z" fill="#f3d6b0"/><path d="M505 190l1.5-3.5 1.5 3.5z" fill="#3a2a30"/></g><g transform="rotate(16 506 236)"><rect x="512" y="196" width="7" height="42" rx="2" fill="#7fb2ff"/><path d="M512 196l3.5-9 3.5 9z" fill="#f3d6b0"/><path d="M514 190l1.5-3.5 1.5 3.5z" fill="#3a2a30"/></g><rect x="486" y="230" width="40" height="34" rx="9" fill="#ff9ec2"/><rect x="486" y="230" width="40" height="8" rx="4" fill="#ff7fa8"/><text x="506" y="254" font-size="15" text-anchor="middle" fill="#fff">♥</text>
<path d="M530 184L572 184L616 262L488 262Z" fill="#fff3a8" opacity=".32"/><ellipse cx="582" cy="262" rx="28" ry="6" fill="#ff9ec2"/><path d="M582 258V208L554 160" stroke="#ff7fa8" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M524 184C524 150 580 150 580 184Z" fill="#ffb3d1"/><path d="M524 184h56" stroke="#ff7fa8" stroke-width="4" stroke-linecap="round"/><circle cx="552" cy="190" r="6" fill="#fff59a"/>
<text x="150" y="112" font-size="20" fill="#ffd54a">✦</text><text x="428" y="112" font-size="16" fill="#ff9ec2">♥</text><text x="190" y="62" font-size="14" fill="#c9b8ff">✦</text><text x="420" y="58" font-size="18" fill="#ffd54a">✦</text><text x="600" y="228" font-size="14" fill="#ff9ec2">♥</text></svg>`;
};
V.study = () => {
    const list = Object.keys(prog).map(Number),
        n = cur != null ? B[cur] : null,
        M = [
            ["birds", "bird", "Cute birds"],
            ["fire", "fire", "Cozy fireplace"],
            ["rain", "rain", "Gentle rain"],
            ["ocean", "wave", "Ocean waves"],
            ["brain", "brain", "Brain relax"],
            ["brown", "phones", "Deep focus"],
        ];
    return `<h1>Cozy Study Zone</h1><p class="sub">Press start and read — sweet quotes bloom at 30 min, 1h, 2h… and a party at 6 hours 🎉</p>${scene()}
<div class="g3" style="margin-top:16px"><div class="card stat"><small class="sub">Today's focus</small><b id="sd">${hms(dayD.s)}</b><button class="btn" onclick="sty=!sty;render(true)">${sty ? "⏸ Pause" : "▶ Start studying"}</button><div class="chips" style="margin-top:12px;justify-content:center">${MS.map((m) => `<span class="chip ${dayD.s >= m[0] ? "on" : ""}">${m[1]}</span>`).join("")}<span class="chip ${dayD.s >= 21600 ? "on" : ""}">6h 🎉</span></div></div>
<div class="card">${n ? `<h3>${n.t}</h3><div class="bar"><i style="width:${(prog[cur] / n.p) * 100}%"></i></div><b style="font-size:14px">Page ${prog[cur]} / ${n.p}${prog[cur] >= n.p ? " · Finished 🎉" : ""}</b><input type="range" min="1" max="${n.p}" value="${prog[cur]}" onchange="setPage(cur,+this.value);render(true)"><button class="btn o" onclick="setPage(cur,Math.min(${n.p},prog[cur]+10));render(true)">+10 pages</button> <a class="btn" href="${n.l}" target="_blank" rel="noopener">Read free ↗</a>` : `<p class="sub">Your desk is empty. Open a book and tap “Study Zone”.</p>`}</div>
<div class="card"><h3>Focus &amp; relax sounds</h3><div class="chips" style="margin-top:10px">${M.map((m) => `<span class="chip ${mus == m[0] ? "on" : ""}" onclick="music('${m[0]}')">${ic(m[1], 22)} ${m[2]}</span>`).join("")}</div><input type="range" min="0" max="1" step=".05" value="${vol}" oninput="vol=+this.value;mg&&(mg.gain.value=vol)" aria-label="Volume"><button class="btn o" style="margin-top:4px" onclick="music(null)">Stop sound</button></div></div>
<h2>Books on my desk</h2>${list.map((i) => `<div class="row"><span><b>${B[i].t}</b><br><small class="sub">Page ${prog[i]} of ${B[i].p} (${Math.round((prog[i] / B[i].p) * 100)}%)</small></span><button class="btn o" onclick="cur=${i};save();render(true)">Put on desk</button></div>`).join("") || "<p class='sub'>Nothing yet.</p>"}`;
};
// ---- sounds (6) ----
const nz = (a, k) => {
    const b = a.createBuffer(1, a.sampleRate * 3, a.sampleRate),
        d = b.getChannelData(0);
    let l = 0;
    for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        d[i] = k == "w" ? w : (l = (l + 0.02 * w) / 1.02) * 3.5;
    }
    const s = a.createBufferSource();
    s.buffer = b;
    s.loop = true;
    return s;
};
let tm = [];
function music(k) {
    nodes.forEach((n) => {
        try {
            n.stop ? n.stop() : n.disconnect();
        } catch (e) {}
    });
    nodes = [];
    tm.forEach(clearInterval);
    tm = [];
    clearInterval(mt);
    mus = k;
    if (k) {
        try {
            const a = AC();
            if (!mg) {
                mg = a.createGain();
                mg.connect(a.destination);
            }
            mg.gain.value = vol;
            const add = (n) => (nodes.push(n), n),
                gn = (v) => {
                    const g = add(a.createGain());
                    g.gain.value = v;
                    return g;
                },
                fl = (t, f) => {
                    const x = add(a.createBiquadFilter());
                    x.type = t;
                    x.frequency.value = f;
                    return x;
                },
                noise = (kind, t, f, v) => {
                    const s = add(nz(a, kind)),
                        x = fl(t, f),
                        g = gn(v);
                    s.connect(x);
                    x.connect(g);
                    g.connect(mg);
                    s.start();
                    return g;
                };
            if (k == "rain") noise("w", "bandpass", 3200, 0.6);
            if (k == "brown") noise("b", "lowpass", 450, 1);
            if (k == "ocean") {
                const g = noise("b", "lowpass", 700, 0.55),
                    l = add(a.createOscillator()),
                    lg = gn(0.4);
                l.frequency.value = 0.12;
                l.connect(lg);
                lg.connect(g.gain);
                l.start();
            }
            if (k == "fire") {
                noise("b", "lowpass", 320, 1.1);
                tm.push(
                    setInterval(() => {
                        if (Math.random() < 0.4) return;
                        const s = a.createBufferSource(),
                            b = a.createBuffer(1, a.sampleRate * 0.05, a.sampleRate),
                            d = b.getChannelData(0);
                        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
                        s.buffer = b;
                        const h = a.createBiquadFilter();
                        h.type = "highpass";
                        h.frequency.value = 1500 + Math.random() * 2500;
                        const g = a.createGain();
                        g.gain.value = 0.15 + Math.random() * 0.35;
                        s.connect(h);
                        h.connect(g);
                        g.connect(mg);
                        s.start();
                    }, 170),
                );
            }
            if (k == "birds") {
                noise("b", "lowpass", 260, 0.4);
                tm.push(
                    setInterval(() => {
                        if (Math.random() < 0.45) return;
                        const n = (1 + Math.random() * 3) | 0,
                            f = 2200 + Math.random() * 1800;
                        for (let i = 0; i < n; i++) {
                            const t = a.currentTime + i * 0.15,
                                o = a.createOscillator(),
                                g = a.createGain();
                            o.frequency.setValueAtTime(f, t);
                            o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.07);
                            o.frequency.exponentialRampToValueAtTime(f * 1.1, t + 0.12);
                            g.gain.setValueAtTime(0.0001, t);
                            g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
                            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
                            o.connect(g);
                            g.connect(mg);
                            o.start(t);
                            o.stop(t + 0.15);
                        }
                    }, 650),
                );
            }
            if (k == "brain") {
                [
                    [180, -1],
                    [190, 1],
                ].forEach(([f, p]) => {
                    const o = add(a.createOscillator()),
                        g = gn(0.1),
                        pn = add(a.createStereoPanner());
                    pn.pan.value = p;
                    o.frequency.value = f;
                    o.connect(g);
                    g.connect(pn);
                    pn.connect(mg);
                    o.start();
                });
                noise("b", "lowpass", 250, 0.6);
            }
        } catch (e) {
            say("Audio not available");
        }
    }
    render(true);
}
const readLog = () => {
    const t = new Date().toDateString(),
        sec = LOG.filter((r) => r.d == t).reduce((s, r) => s + r.sec, 0);
    return `<h2>Reading record</h2><div class="card">${sess ? `<div class="row" style="background:var(--in);border-radius:16px;padding:10px 14px;margin-bottom:8px"><span><b>Reading now:</b> ${esc(B[sess.b].t)}<br><small class="sub">Started ${new Date(sess.ts).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })} — come back here when you pause</small></span><button class="btn" onclick="askBack()">Log my page</button></div>` : ""}<div class="g3" style="margin-bottom:8px"><div class="stat"><b>${todayPages()}</b>pages read today</div><div class="stat"><b>${mmss(sec)}</b>logged today</div><div class="stat"><b>${LOG.length}</b>records</div></div>${
        LOG.slice(0, 12)
            .map(
                (r) =>
                    `<div class="row"><span><b>${esc(B[r.b].t)}</b><br><small class="sub">${r.from == r.to ? "Stayed on page " + r.from : "Page " + r.from + " → " + r.to + " (+" + (r.to - r.from) + ")"} · ${r.d == t ? "Today" : r.d.slice(4, 10)} ${r.t}</small></span><b style="color:var(--co)">${mmss(r.sec)}</b></div>`,
            )
            .join("") || "<p class='sub'>No records yet. Tap “Read free”, read, then come back and log your page.</p>"
    }${LOG.length ? `<button class="btn o" style="margin-top:10px" onclick="LOG=[];sv4();render(true)">Clear record</button>` : ""}</div>`;
};
const os = V.study;
V.study = () => {
    if (cur != null && pSec[cur] == null) pSec[cur] = 0;
    return (
        os().replace(
            /<a class="btn" href="([^"]*)" target="_blank" rel="noopener">Read free ↗<\/a>/,
            (m, u) =>
                `<a class="btn" href="${u}" target="_blank" rel="noopener" onclick="startRead(${cur})">Read free ↗</a>`,
        ) + readLog()
    );
};
// ---- study themes ----
IC.speaker = [
    `<path d="M7 21h11l13-11v36L18 35H7Z" fill="#c9b8ff"/><path d="M39 21q6 7 0 14M44 14q11 14 0 28" fill="none" stroke="#ff9ec2" stroke-width="3.5" stroke-linecap="round"/>`,
    19,
    28,
];
const tt = (x, y, t, f, c) =>
    `<text x="${x}" y="${y}" font-size="${f || 8}" text-anchor="middle" fill="${c || "#6a3a5c"}" font-family="Poppins">${t}</text>`;
const mAv = () =>
    user.img
        ? `<clipPath id="cp"><circle cx="300" cy="150" r="46"/></clipPath><image href="${user.img}" x="254" y="104" width="92" height="92" clip-path="url(#cp)" preserveAspectRatio="xMidYMid slice"/>`
        : face(user.av, 96).replace("<svg ", "<svg x='252' y='102' ");
const scr = (n) =>
    `<text x="226" y="184" font-size="11" fill="#6a3a5c" font-family="Playfair Display" font-weight="700">${n ? esc(n.t.slice(0, 24)) : "Pick a book"}</text><text id="lp" x="226" y="202" font-size="9.5" fill="#8a5a7a" font-family="Poppins">${n ? `Page ${prog[cur]} / ${n.p}` : "Browse → Study Zone"}</text><text id="lt" x="226" y="217" font-size="9.5" fill="#b0869f" font-family="Poppins">${n ? "On this page: " + mmss(pageSec(cur)) : ""}</text><text id="lr" x="226" y="232" font-size="9.5" fill="#b0869f" font-family="Poppins">${n ? "Pages read today: " + todayPages() : ""}</text><text x="226" y="247" font-size="8.5" fill="#ee6f9d" font-family="Poppins">${sess ? "● reading live" : ""}</text>`;
const lapT = (n) =>
    `<path d="M200 262L212 160H392L404 262Z" fill="#b9bcc9"/><rect x="214" y="162" width="176" height="92" rx="4" fill="#f4f1fa"/><rect x="190" y="262" width="224" height="8" rx="4" fill="#9a9db0"/>` +
    scr(n);
const tabT = (n) =>
    `<rect x="204" y="156" width="196" height="108" rx="14" fill="#e9a3b8"/><rect x="214" y="164" width="176" height="92" rx="6" fill="#fbf3e6"/><path d="M290 264L276 270H328L314 264Z" fill="#d98aa3"/>` +
    scr(n);
const pcl = (x, y, cs) =>
    cs
        .map(
            (c, i) =>
                `<rect x="${x + i * 8}" y="${y - 30 + (i % 2) * 6}" width="6" height="36" rx="2" fill="${c}" transform="rotate(${(i - 1) * 10} ${x + i * 8 + 3} ${y})"/>`,
        )
        .join("");
const T_cream = (n) =>
    `<defs><linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdebd5"/><stop offset="1" stop-color="#f6d9bd"/></linearGradient></defs><rect width="640" height="360" fill="url(#gc)"/><ellipse cx="360" cy="54" rx="32" ry="13" fill="#fff"/><ellipse cx="382" cy="46" rx="20" ry="14" fill="#fff"/><ellipse cx="338" cy="50" rx="18" ry="11" fill="#fff"/><path d="M30 0Q52 30 40 72M62 0Q82 38 70 62M96 0Q102 26 92 50" stroke="#6a9a5a" stroke-width="3" fill="none"/>` +
    [
        [40, 40],
        [44, 68],
        [72, 34],
        [70, 58],
        [96, 26],
        [92, 48],
    ]
        .map(
            (p) =>
                `<ellipse cx="${p[0]}" cy="${p[1]}" rx="9" ry="6" fill="#7fb06f" transform="rotate(${p[0] % 40} ${p[0]} ${p[1]})"/>`,
        )
        .join("") +
    `<rect x="0" y="132" width="172" height="10" rx="3" fill="#d49c6a"/><rect x="112" y="102" width="40" height="30" rx="7" fill="#ffd1dc"/><path d="M132 102q-14-24-4-30 8 10 4 30ZM132 102q14-24 24-26-4 18-24 26Z" fill="#7fb06f"/>` +
    tt(132, 122, "♥", 12, "#ee6f9d") +
    `<g transform="rotate(-6 192 68)"><rect x="160" y="40" width="64" height="56" fill="#fdd2dc"/><rect x="182" y="34" width="20" height="9" fill="#ffe3a8"/>${tt(192, 64, "good things")}${tt(192, 76, "take time ♥")}</g><g transform="rotate(-8 168 158)"><rect x="140" y="132" width="56" height="50" fill="#fff"/><rect x="146" y="138" width="44" height="32" fill="#bfe0ff"/><path d="M146 170l14-14 10 8 12-12 8 10v8z" fill="#9fd08f"/></g><g transform="rotate(-5 46 186)"><rect x="12" y="160" width="68" height="52" fill="#cfe0f5"/>${tt(46, 182, "you're doing")}${tt(46, 194, "great! :)")}</g>` +
    `<rect x="520" y="98" width="88" height="74" fill="#fff" stroke="#e6d2b8" stroke-width="4"/>${tt(564, 128, "it's a", 10)}${tt(564, 142, "beautiful", 10)}${tt(564, 156, "day ☼", 10)}<g transform="rotate(5 570 60)"><rect x="546" y="34" width="48" height="50" fill="#fdd2dc"/><circle cx="570" cy="62" r="11" fill="#b9825a"/><circle cx="562" cy="52" r="4" fill="#b9825a"/><circle cx="578" cy="52" r="4" fill="#b9825a"/><circle cx="566" cy="61" r="1.6" fill="#3a2a30"/><circle cx="574" cy="61" r="1.6" fill="#3a2a30"/></g>` +
    `<rect y="262" width="640" height="98" fill="#dcb68a"/><rect y="262" width="640" height="8" fill="#cfa575"/>` +
    `<g transform="translate(66 262)"><ellipse cx="-34" cy="-30" rx="12" ry="22" fill="#c99a68" transform="rotate(14 -34 -30)"/><ellipse cx="34" cy="-30" rx="12" ry="22" fill="#c99a68" transform="rotate(-14 34 -30)"/><ellipse cx="0" cy="-22" rx="36" ry="30" fill="#f6e2c0"/><ellipse cx="0" cy="-12" rx="14" ry="10" fill="#fff3dc"/><circle cx="-13" cy="-26" r="3.4" fill="#3a2a30"/><circle cx="13" cy="-26" r="3.4" fill="#3a2a30"/><ellipse cx="0" cy="-17" rx="4" ry="3" fill="#3a2a30"/><path d="M-4 -11q4 4 8 0" stroke="#3a2a30" fill="none" stroke-width="1.8" stroke-linecap="round"/><circle cx="-24" cy="-14" r="5" fill="#ffb3c6" opacity=".7"/><circle cx="24" cy="-14" r="5" fill="#ffb3c6" opacity=".7"/><ellipse cx="-16" cy="2" rx="12" ry="7" fill="#f6e2c0"/><ellipse cx="16" cy="2" rx="12" ry="7" fill="#f6e2c0"/></g>` +
    `<g transform="rotate(4 151 234)"><rect x="118" y="204" width="66" height="58" rx="4" fill="#fff"/>${tt(151, 215, "good day checklist ♥", 5.5)}${["drink water", "be kind", "take breaks", "smile more!"].map((t, i) => `<rect x="124" y="${222 + i * 9}" width="5" height="5" fill="none" stroke="#b08a6a" stroke-width=".8"/><text x="133" y="${227 + i * 9}" font-size="6" fill="#6a3a5c" font-family="Poppins">${t}</text>`).join("")}</g>` +
    `<path d="M440 238V208M450 238V214" stroke="#7fb06f" stroke-width="3"/><circle cx="440" cy="204" r="7" fill="#ff9ec2"/><circle cx="450" cy="210" r="7" fill="#ffb3d1"/><rect x="430" y="236" width="30" height="26" rx="7" fill="#fff"/>` +
    tt(445, 254, "♥", 11, "#ee6f9d") +
    `<rect x="500" y="244" width="124" height="18" rx="3" fill="#8fb98a"/>${tt(562, 257, "good vibes", 8, "#fff")}<rect x="506" y="226" width="110" height="18" rx="3" fill="#f4a9b7"/>${tt(561, 239, "dream big", 8, "#fff")}<rect x="512" y="208" width="98" height="18" rx="3" fill="#6f9fb8"/>${tt(561, 221, "notes", 8, "#fff")}<circle cx="562" cy="192" r="36" fill="#fff3c4" opacity=".35"/><path d="M544 208a18 17 0 0 1 36 0Z" fill="#fff7dc"/>` +
    `<ellipse cx="300" cy="238" rx="100" ry="46" fill="#f6b8c8"/>` +
    mAv() +
    lapT(n) +
    tt(30, 90, "♥", 14, "#ff9ec2") +
    tt(240, 40, "✦", 16, "#ffd54a") +
    tt(460, 80, "♥", 12, "#ff9ec2");
const T_win = (n) =>
    `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#d9f0ff"/></linearGradient></defs><rect width="640" height="360" fill="#fdebd0"/><rect x="16" y="44" width="244" height="148" fill="url(#sk)"/>` +
    [
        [26, 130, 36, 62, "#b8c8d8"],
        [70, 110, 30, 82, "#c9d6e2"],
        [104, 138, 40, 54, "#aebfd2"],
        [150, 120, 34, 72, "#c4d2e0"],
        [192, 134, 44, 58, "#b3c4d6"],
    ]
        .map((b) => `<rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" fill="${b[4]}"/>`)
        .join("") +
    `<circle cx="236" cy="172" r="18" fill="#8fc98a"/><circle cx="48" cy="178" r="14" fill="#8fc98a"/><ellipse cx="90" cy="76" rx="30" ry="12" fill="#fff"/><ellipse cx="112" cy="68" rx="20" ry="13" fill="#fff"/><ellipse cx="200" cy="96" rx="22" ry="9" fill="#fff"/><rect x="16" y="44" width="244" height="148" fill="none" stroke="#c9a57a" stroke-width="8"/><path d="M138 44V192" stroke="#c9a57a" stroke-width="5"/><rect x="8" y="22" width="260" height="26" fill="#f4e3c6"/>` +
    [0, 1, 2, 3, 4].map((i) => `<path d="M8 ${28 + i * 5}H268" stroke="#e4cfa8" stroke-width="1.5"/>`).join("") +
    `<rect x="4" y="192" width="270" height="12" rx="3" fill="#e6c9a3"/>` +
    `<path d="M46 166q-18-30-8-40 12 8 8 40ZM46 166q18-34 30-34-2 20-30 34ZM46 166q-26-14-34-30 20 0 34 30Z" fill="#6fae6a"/><rect x="28" y="164" width="38" height="28" rx="7" fill="#fff"/>` +
    tt(47, 176, "GOOD", 7) +
    tt(47, 185, "DAY!", 7) +
    `<circle cx="192" cy="161" r="8" fill="#eee"/><circle cx="224" cy="161" r="8" fill="#eee"/><circle cx="208" cy="176" r="20" fill="#fff" stroke="#eee"/><circle cx="201" cy="175" r="2.4" fill="#3a2a30"/><circle cx="215" cy="175" r="2.4" fill="#3a2a30"/><ellipse cx="208" cy="181" rx="3" ry="2.2" fill="#3a2a30"/><circle cx="196" cy="182" r="3.5" fill="#ffb3c6" opacity=".7"/><circle cx="220" cy="182" r="3.5" fill="#ffb3c6" opacity=".7"/>` +
    `<circle cx="400" cy="68" r="38" fill="#5a68b8"/><circle cx="400" cy="68" r="32" fill="#fff"/>` +
    [...Array(12)]
        .map(
            (_, i) =>
                `<path d="M400 40v${i % 3 ? 3 : 6}" stroke="#3a3a5a" stroke-width="2" transform="rotate(${i * 30} 400 68)"/>`,
        )
        .join("") +
    `<path d="M400 68V46" stroke="#3a3a5a" stroke-width="3" stroke-linecap="round"/><path d="M400 68V52" stroke="#3a3a5a" stroke-width="3.5" stroke-linecap="round" transform="rotate(240 400 68)"/><circle cx="400" cy="68" r="3" fill="#3a3a5a"/>` +
    `<rect x="500" y="36" width="114" height="116" rx="7" fill="#fff" stroke="#e6d9c9" stroke-width="2"/><rect x="540" y="30" width="34" height="9" fill="#9ec9ff"/>${tt(557, 58, "To-Do", 11)}` +
    ["Project", "Reply email", "Meeting 10:00", "Workout"]
        .map(
            (t, i) =>
                `<rect x="512" y="${72 + i * 20}" width="10" height="10" fill="#fff" stroke="#5a68b8" stroke-width="1.3"/>${i < 3 ? tt(517, 81 + i * 20, "✓", 9, "#5a68b8") : ""}<text x="528" y="${81 + i * 20}" font-size="9" fill="#6a3a5c" font-family="Poppins">${t}</text>`,
        )
        .join("") +
    `<g transform="rotate(-5 366 144)"><rect x="330" y="118" width="72" height="52" fill="#ffe27a"/>${tt(366, 138, "Focus and", 9)}${tt(366, 150, "get things", 9)}${tt(366, 162, "done!", 9)}</g><rect x="418" y="148" width="46" height="40" fill="#bfe0ff" transform="rotate(3 441 168)"/>${tt(441, 166, "Idea", 8)}${tt(441, 177, "loading...", 8)}<rect x="470" y="142" width="58" height="42" fill="#ffc2d4" transform="rotate(-3 499 163)"/>${tt(499, 160, "♥ You", 9)}${tt(499, 172, "can do it!", 9)}` +
    `<rect y="262" width="640" height="98" fill="#e3b98c"/><rect y="262" width="640" height="8" fill="#d6a876"/>` +
    [
        ["#f6d27a", "PLAN"],
        ["#a8d5c2", "WORK"],
        ["#b9c7f2", "IDEA"],
        ["#f4a9b7", "NOTE"],
    ]
        .map(
            (b, i) =>
                `<rect x="${14 + i * 17}" y="194" width="15" height="68" rx="2" fill="${b[0]}"/><text x="${21 + i * 17}" y="228" font-size="8" fill="#6a3a5c" text-anchor="middle" font-family="Poppins" transform="rotate(-90 ${21 + i * 17} 228)">${b[1]}</text>`,
        )
        .join("") +
    pcl(98, 236, ["#ff9ec2", "#7fb2ff", "#ffd54a"]) +
    `<rect x="92" y="230" width="38" height="32" rx="8" fill="#ffe6a8"/><circle cx="111" cy="246" r="7" fill="#fff"/><circle cx="108" cy="245" r="1.2" fill="#3a2a30"/><circle cx="114" cy="245" r="1.2" fill="#3a2a30"/>` +
    `<path d="M448 218q-6-8 0-14M458 218q-6-8 0-14" stroke="#cfd8e8" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="438" y="226" width="34" height="36" rx="7" fill="#6f8fd8"/><path d="M472 236q14 2 0 18" stroke="#6f8fd8" stroke-width="5" fill="none"/>` +
    tt(455, 250, "★", 13, "#ffd54a") +
    `<path d="M548 262l8-48h50l8 48Z" fill="#fff" stroke="#e6d9c9" stroke-width="2"/>${tt(581, 234, "Let's do", 8)}${tt(581, 245, "our best!", 8)}${tt(581, 256, "♥", 10, "#ee6f9d")}<rect x="636" y="236" width="0" height="0"/>` +
    `<ellipse cx="300" cy="238" rx="100" ry="46" fill="#ff8f8f"/>` +
    mAv() +
    lapT(n);
const T_eve = (n) =>
    `<rect width="640" height="360" fill="#4b2b30"/><rect width="150" height="262" fill="#b9743c"/>` +
    [...Array(6)]
        .map((_, i) => `<rect x="${i * 26 + 6}" width="12" height="262" fill="#8d5128" opacity=".55"/>`)
        .join("") +
    `<rect x="150" width="190" height="262" fill="#7e3d51"/>` +
    [...Array(6)]
        .map(
            (_, i) =>
                `<path d="M${162 + i * 30} 0Q${176 + i * 30} 130 ${162 + i * 30} 262" stroke="#a45a70" stroke-width="3" fill="none" opacity=".6"/>`,
        )
        .join("") +
    `<rect x="340" width="300" height="262" fill="#f1ddc5"/>` +
    [
        [360, 14, "#f6e6b8"],
        [402, 8, "#fff3d6"],
        [444, 18, "#f6e6b8"],
        [486, 6, "#fff3d6"],
        [528, 16, "#f6e6b8"],
        [570, 10, "#fff3d6"],
        [600, 60, "#f6e6b8"],
        [366, 70, "#fff3d6"],
        [420, 74, "#f6e6b8"],
    ]
        .map(
            (p) =>
                `<rect x="${p[0]}" y="${p[1]}" width="34" height="40" fill="${p[2]}" transform="rotate(${(p[0] % 7) - 3} ${p[0] + 17} ${p[1] + 20})"/>`,
        )
        .join("") +
    `<rect x="484" y="104" width="62" height="42" fill="#f6b8c8" transform="rotate(-3 515 125)"/>` +
    tt(515, 122, "YOU", 11, "#c0507a") +
    tt(515, 137, "CAN", 11, "#c0507a") +
    `<circle cx="30" cy="130" r="64" fill="#ffd27a" opacity=".2"/><circle cx="28" cy="222" r="64" fill="#ffd27a" opacity=".2"/><rect y="164" width="340" height="12" fill="#5a3523"/><rect y="176" width="340" height="6" fill="#3a2217" opacity=".5"/>` +
    pcl(56, 116, ["#ffb3d1", "#7fb2ff", "#ffd54a", "#7ed39a"]) +
    `<rect x="48" y="112" width="50" height="52" rx="9" fill="#fff"/><circle cx="73" cy="142" r="14" fill="#2a2230"/><path d="M62 132l3-10 8 6ZM84 132l-3-10-8 6Z" fill="#2a2230"/><circle cx="68" cy="141" r="1.8" fill="#fff"/><circle cx="78" cy="141" r="1.8" fill="#fff"/>` +
    pcl(112, 132, ["#ffd54a", "#ff9ec2"]) +
    `<rect x="106" y="128" width="34" height="36" rx="8" fill="#ff9ec2"/>` +
    tt(123, 152, "♥", 13, "#fff") +
    `<path d="M160 164v-30a18 18 0 0 1 36 0v30Z" fill="#d9a24a"/><path d="M168 164v-28a10 10 0 0 1 20 0v28Z" fill="#7a4a33"/><rect x="212" y="130" width="52" height="34" fill="#fff" opacity=".2" stroke="#ffe3b3"/><rect x="300" y="134" width="40" height="30" rx="3" fill="#d98aa3"/><rect x="22" y="140" width="16" height="24" rx="3" fill="#ffb3d1"/><path d="M30 124q-6 8 0 14q6-6 0-14Z" fill="#ffb74d"/>` +
    `<rect y="262" width="640" height="98" fill="#7a4a33"/><rect y="262" width="640" height="7" fill="#946042"/><rect x="16" y="228" width="16" height="34" rx="3" fill="#ffb3d1"/><path d="M24 212q-6 8 0 14q6-6 0-14Z" fill="#ffb74d"/><rect x="48" y="258" width="88" height="6" rx="3" fill="#f08a7a"/><rect x="64" y="196" width="48" height="10" rx="3" fill="#c68a4a"/><rect x="58" y="206" width="60" height="52" rx="10" fill="#fff" opacity=".18" stroke="#ffe3b3"/>` +
    [
        [72, 222],
        [92, 226],
        [78, 242],
        [100, 244],
        [88, 214],
    ]
        .map((p) => tt(p[0], p[1], "★", 16, "#f6a85a"))
        .join("") +
    `<rect x="440" y="224" width="34" height="38" rx="5" fill="#d9d4de"/><rect x="440" y="218" width="34" height="8" fill="#8b8794"/>${tt(457, 246, "Lavender", 6)}<rect x="484" y="222" width="64" height="20" rx="3" fill="#9fb7d6"/><rect x="484" y="242" width="64" height="20" rx="3" fill="#f4b6c4"/><circle cx="516" cy="232" r="2.4" fill="#fff"/><circle cx="516" cy="252" r="2.4" fill="#fff"/><rect x="560" y="196" width="70" height="66" rx="5" fill="#fff" stroke="#e6a0b0" stroke-width="2"/>` +
    [1, 2, 3]
        .map((i) => `<path d="M${560 + i * 17.5} 204V258M562 ${204 + i * 13}H628" stroke="#f2c6d0" stroke-width="1"/>`)
        .join("") +
    `<circle cx="596" cy="236" r="6" fill="#ff7f9a" opacity=".7"/>` +
    `<ellipse cx="300" cy="238" rx="100" ry="46" fill="#c88aa0"/>` +
    mAv() +
    tabT(n) +
    tt(240, 40, "✦", 16, "#ffd54a");
const STH = [
    ["pink", "Pink blossom", 0],
    ["cream", "Cream kawaii", 1],
    ["window", "Sunny window", 1],
    ["eve", "Cozy evening", 2],
    ["star", "Starlit library", 2],
];
let stT = ls.get("pp4_theme", "pink");
const SVW = (x) =>
    `<svg viewBox="0 0 640 360" style="width:100%;border-radius:28px;display:block;box-shadow:var(--sh)" role="img" aria-label="Cozy study desk"><defs><radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5a2a5a" stop-opacity=".2"/></radialGradient></defs>${x}<rect width="640" height="360" fill="url(#vg)"/></svg>`;
const scene = () => {
    const n = cur != null ? B[cur] : null,
        t = STH.find((x) => x[0] == stT),
        k = t && user.plan >= t[2] ? stT : "pink";
    return k == "pink" ? scene1() : SVW({ cream: T_cream, window: T_win, eve: T_eve, star: T_star }[k](n));
};
function setT(k) {
    stT = k;
    ls.set("pp4_theme", k);
    render(true);
}
const os2 = V.study;
V.study = () =>
    os2().replace(
        "<h1>Cozy Study Zone</h1>",
        `<h1>Cozy Study Zone</h1><div class="chips">${STH.map((t) => {
            const lk = user.plan < t[2];
            return `<span class="chip ${stT == t[0] && !lk ? "on" : ""}" onclick="setT('${t[0]}')">${t[1]}${lk ? " " + ic("lock", 15) + "<small>" + PL[t[2]].n + "</small>" : ""}</span>`;
        }).join("")}</div>`,
    );
function setT(k) {
    const t = STH.find((x) => x[0] == k);
    if (user.plan < t[2]) return buy(t[2]);
    stT = k;
    ls.set("pp4_theme", k);
    render(true);
}
// ---- VIP exclusive theme ----
const T_star = (n) =>
    `<defs><linearGradient id="ns" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1646"/><stop offset=".6" stop-color="#3b2a7a"/><stop offset="1" stop-color="#6b3f8f"/></linearGradient><radialGradient id="lg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs><rect width="640" height="360" fill="url(#ns)"/>` +
    [...Array(36)]
        .map(
            (_, i) =>
                `<circle class="tw" cx="${(i * 89 + 20) % 640}" cy="${((i * 47) % 190) + 8}" r="${i % 4 ? 1 : 1.9}" fill="#fff" style="animation-delay:${(i % 5) * 0.4}s"/>`,
        )
        .join("") +
    `<path d="M50 238V118a85 85 0 0 1 170 0V238Z" fill="#241c63" stroke="#d9b36a" stroke-width="6"/><circle cx="178" cy="96" r="24" fill="#fff3c4"/><circle cx="188" cy="90" r="22" fill="#241c63"/><path d="M135 33V238M50 150H220" stroke="#d9b36a" stroke-width="3" opacity=".8"/><circle class="tw" cx="90" cy="80" r="2" fill="#fff"/><circle class="tw" cx="110" cy="190" r="1.6" fill="#fff"/><circle class="tw" cx="200" cy="170" r="1.8" fill="#fff"/>` +
    `<path d="M0 0Q30 40 20 90M44 0Q70 50 58 100M274 0Q252 40 264 86" stroke="#6a8a5a" stroke-width="3" fill="none"/>` +
    [...Array(16)]
        .map(
            (_, i) =>
                `<circle cx="${(i % 2 ? 16 : 56) + Math.sin(i) * 7}" cy="${20 + i * 5}" r="${5 - (i % 3)}" fill="${["#c9a0ff", "#b48cf2", "#e0c4ff"][i % 3]}"/><circle cx="${268 - (i % 2 ? 8 : -6) + Math.cos(i) * 6}" cy="${16 + i * 4.5}" r="${4.5 - (i % 3)}" fill="${["#c9a0ff", "#b48cf2", "#e0c4ff"][i % 3]}"/>`,
        )
        .join("") +
    `<path d="M0 16Q80 46 160 16T320 16T480 16T640 16" stroke="#e6c9ff" stroke-width="1.5" fill="none"/>` +
    [...Array(16)]
        .map((_, i) => {
            const x = i * 42 + 6,
                y = 22 + (i % 2 ? 12 : -2);
            return `<circle cx="${x}" cy="${y}" r="9" fill="#ffe9a8" opacity=".2"/><circle class="tw" cx="${x}" cy="${y}" r="3.5" fill="#ffe9a8"/>`;
        })
        .join("") +
    `<rect x="416" y="46" width="208" height="186" rx="8" fill="#3a2036" stroke="#d9b36a" stroke-width="3"/>` +
    [0, 1, 2]
        .map(
            (r) =>
                `<rect x="418" y="${104 + r * 60}" width="204" height="6" fill="#8a5a3a"/>` +
                [...Array(14)]
                    .map((_, j) => {
                        const h = 34 + ((j * 5 + r * 3) % 14);
                        return `<rect x="${424 + j * 14}" y="${104 + r * 60 - h}" width="${10 + ((j * 7 + r) % 4)}" height="${h}" rx="2" fill="${["#e46fa5", "#7fb2ff", "#ffd54a", "#7ed39a", "#c9a0ff", "#ff9e7a"][(j + r * 2) % 6]}"/>`;
                    })
                    .join(""),
        )
        .join("") +
    `<rect y="262" width="640" height="98" fill="#4a2d3a"/><rect y="262" width="640" height="7" fill="#6b4254"/><ellipse cx="62" cy="228" rx="80" ry="62" fill="url(#lg)" opacity=".6"/><ellipse cx="62" cy="262" rx="24" ry="5" fill="#d9a24a"/><path d="M62 258V214" stroke="#d9a24a" stroke-width="4"/><path d="M34 214C34 184 90 184 90 214Z" fill="#ffd27a" stroke="#d9a24a" stroke-width="2"/>` +
    `<circle cx="439" cy="214" r="26" fill="url(#lg)"/><rect x="432" y="232" width="14" height="30" rx="3" fill="#fff3e0"/><path d="M439 214q-6 9 0 15q6-6 0-15Z" fill="#ffb74d"/>` +
    `<ellipse cx="474" cy="246" rx="25" ry="16" fill="#fff"/><circle cx="466" cy="244" r="3" fill="#ff9ec2"/><circle cx="478" cy="248" r="3" fill="#ff9ec2"/><circle cx="486" cy="241" r="2.5" fill="#c9a0ff"/><path d="M450 242q-12-6-14-16 10 4 16 12ZM498 246q14 0 14 12" fill="none" stroke="#fff" stroke-width="4"/><rect x="464" y="226" width="20" height="6" rx="3" fill="#ffd97a"/><path class="st" d="M470 220q-5-8 0-14M480 220q-5-8 0-14" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>` +
    `<rect x="556" y="244" width="70" height="18" rx="3" fill="#7a2f4f"/><rect x="562" y="226" width="60" height="18" rx="3" fill="#2f4f7a"/><rect x="558" y="208" width="64" height="18" rx="3" fill="#4f7a3f"/>` +
    [
        [556, 250],
        [562, 232],
        [558, 214],
    ]
        .map((p) => `<rect x="${p[0] + 6}" y="${p[1]}" width="50" height="3" fill="#ffd97a"/>`)
        .join("") +
    `<path d="M590 184l12 12-12 16-12-16Z" fill="#e0c4ff" stroke="#fff" stroke-width="1.5"/><text class="tw" x="604" y="182" font-size="12" fill="#ffd97a">✦</text>` +
    `<rect x="12" y="318" width="124" height="22" rx="11" fill="#ffd97a"/>` +
    tt(74, 333, "VIP STUDY SUITE", 8.5, "#4a2c00") +
    `<ellipse cx="300" cy="238" rx="100" ry="46" fill="#8a6bd6"/>` +
    mAv() +
    lapT(n) +
    [
        [160, 60],
        [380, 56],
        [330, 30],
        [240, 118],
    ]
        .map((p, i) => `<text class="tw" x="${p[0]}" y="${p[1]}" font-size="${12 + i * 2}" fill="#ffd97a">✦</text>`)
        .join("");

render();
