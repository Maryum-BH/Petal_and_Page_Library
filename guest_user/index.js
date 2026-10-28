/* index.js  –  page script for "Home" (loads after core.js) */
V.home = () =>
    `<div class="hero"><div class="big">🌸📖🌷</div><h1>Your smart library, in full bloom</h1><p class="sub">Browse manga, manhwa, thrillers, horror, history & detective tales — read free, track every page, study in a cozy desk space.</p><button class="btn" onclick="go('browse')">Browse books</button> <button class="btn o" onclick="auth('up')">Join free</button></div><div class="g3">${[
        ["📚", "Free reading", "Classics, manga & webtoons with free official links."],
        ["🪴", "Study Zone", "A cozy desk that remembers your page."],
        ["🎧", "Focus music", "Rain, deep focus & dreamy pads while you read."],
    ]
        .map(
            (f) =>
                `<div class="card stat"><div style="font-size:34px">${f[0]}</div><h3>${f[1]}</h3><p class="sub" style="margin:0">${f[2]}</p></div>`,
        )
        .join(
            "",
        )}</div><h2>Popular covers</h2><div class="grid">${[0, 8, 15, 18, 3, 12].map((i) => bk(B[i])).join("")}</div>`;
const oh = V.home;
V.home = () =>
    oh()
        .replace("🌸📖🌷", ic("flower", 60) + ic("book", 60) + ic("flower", 60))
        .replace("📚", ic("book", 46))
        .replace("🪴", ic("bear", 46))
        .replace("🎧", ic("phones", 46));

render();
