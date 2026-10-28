/* ============================================================
   core.js  –  shared by every page
   data, state, helpers, icons, avatars, header/sidebar, login,
   reviews, reservation data, reading tracker, plans
   ============================================================ */
const $ = (s) => document.querySelector(s);
const GU = (n) => "https://www.gutenberg.org/ebooks/" + n,
    MP = "https://mangaplus.shueisha.co.jp/",
    WT = "https://www.webtoons.com/en/";
const GEN = ["Manga", "Manhwa", "Thriller", "Horror", "Historical", "Detective", "Cozy"];
// title,author,genre,pages,emoji,c1,c2,link,desc,tags
const B = [
    [
        "One Piece",
        "Eiichiro Oda",
        "Manga",
        1100,
        "🏴‍☠️",
        "#ffd36b",
        "#ff8a5c",
        MP,
        "Luffy and his Straw Hat crew sail the Grand Line in search of the legendary treasure One Piece.",
        "shonen,adventure",
    ],
    [
        "Spy x Family",
        "Tatsuya Endo",
        "Manga",
        140,
        "🥜",
        "#ffd6e4",
        "#f7a1c4",
        MP,
        "A spy, an assassin and a telepath pose as a family — and hide it from each other.",
        "comedy,action",
    ],
    [
        "Dandadan",
        "Yukinobu Tatsu",
        "Manga",
        180,
        "👽",
        "#c8f0ff",
        "#ff9ecb",
        MP,
        "Ghosts, aliens and a wild high-school romance collide in this supernatural hit.",
        "supernatural,action",
    ],
    [
        "Tower of God",
        "SIU",
        "Manhwa",
        600,
        "🗼",
        "#c9c5ff",
        "#8fb6ff",
        WT,
        "Bam climbs a mysterious tower to follow the girl he loves. Free chapters on WEBTOON.",
        "fantasy,webtoon",
    ],
    [
        "Lore Olympus",
        "Rachel Smythe",
        "Manhwa",
        250,
        "🌹",
        "#f5c6ff",
        "#ffa6c9",
        WT,
        "A modern, glittering retelling of Hades and Persephone.",
        "romance,myth",
    ],
    [
        "True Beauty",
        "Yaongyi",
        "Manhwa",
        300,
        "💄",
        "#ffd0e2",
        "#ffb0a8",
        WT,
        "A girl who masters makeup hides her bare-faced self at a new school.",
        "romance,school",
    ],
    [
        "The Thirty-Nine Steps",
        "John Buchan",
        "Thriller",
        160,
        "🏃",
        "#d7e0ea",
        "#8aa0b8",
        GU(558),
        "Richard Hannay is hunted across Scotland after a spy dies in his flat.",
        "spy,chase",
    ],
    [
        "The Woman in White",
        "Wilkie Collins",
        "Thriller",
        600,
        "👻",
        "#eeeaf6",
        "#b9b0d8",
        GU(583),
        "A midnight encounter on a lonely road launches a tangled Victorian conspiracy.",
        "suspense,victorian",
    ],
    [
        "Dracula",
        "Bram Stoker",
        "Horror",
        450,
        "🦇",
        "#5a1f35",
        "#2a0f1d",
        GU(345),
        "Count Dracula travels from Transylvania to England, and a band of friends fights back.",
        "vampire,gothic",
    ],
    [
        "Frankenstein",
        "Mary Shelley",
        "Horror",
        280,
        "⚡",
        "#334a4a",
        "#1b2a2a",
        GU(84),
        "A scientist's creature turns against its creator in the original sci-fi horror.",
        "gothic,classic",
    ],
    [
        "Strange Case of Dr Jekyll and Mr Hyde",
        "R. L. Stevenson",
        "Horror",
        90,
        "🧪",
        "#4a3a66",
        "#241a3a",
        GU(43),
        "A respectable doctor and a monstrous alter ego share one body.",
        "gothic,short",
    ],
    [
        "The Turn of the Screw",
        "Henry James",
        "Horror",
        120,
        "🕯️",
        "#3b3b55",
        "#1d1d30",
        GU(209),
        "A governess fears the children in her care are haunted.",
        "ghost,gothic",
    ],
    [
        "A Tale of Two Cities",
        "Charles Dickens",
        "Historical",
        400,
        "⚔️",
        "#ffd9c2",
        "#e89b7a",
        GU(98),
        "Love and sacrifice between London and Paris during the French Revolution.",
        "revolution,classic",
    ],
    [
        "The Three Musketeers",
        "Alexandre Dumas",
        "Historical",
        700,
        "🗡️",
        "#c8dcff",
        "#7ea3e6",
        GU(1257),
        "D'Artagnan joins three swordsmen in 17th-century France: all for one!",
        "adventure,france",
    ],
    [
        "Ivanhoe",
        "Walter Scott",
        "Historical",
        500,
        "🛡️",
        "#d6ecc9",
        "#93c47d",
        GU(82),
        "Knights, tournaments and Robin Hood in medieval England.",
        "medieval,romance",
    ],
    [
        "The Hound of the Baskervilles",
        "Arthur Conan Doyle",
        "Detective",
        250,
        "🐕",
        "#c9d4c0",
        "#7d9a78",
        GU(2852),
        "Sherlock Holmes investigates a spectral hound on the foggy moors.",
        "sherlock,mystery",
    ],
    [
        "The Adventures of Sherlock Holmes",
        "Arthur Conan Doyle",
        "Detective",
        300,
        "🔍",
        "#ffe3a3",
        "#e7b955",
        GU(1661),
        "Twelve classic cases from Baker Street.",
        "sherlock,short stories",
    ],
    [
        "The Moonstone",
        "Wilkie Collins",
        "Detective",
        520,
        "💎",
        "#e4dcff",
        "#a99be8",
        GU(155),
        "A cursed diamond vanishes — considered the first detective novel in English.",
        "mystery,victorian",
    ],
    [
        "Pride and Prejudice",
        "Jane Austen",
        "Cozy",
        320,
        "🌹",
        "#fbc9d9",
        "#f19bb8",
        GU(1342),
        "Witty Elizabeth Bennet meets proud Mr. Darcy.",
        "romance,classic",
    ],
    [
        "Anne of Green Gables",
        "L. M. Montgomery",
        "Cozy",
        340,
        "🍎",
        "#ffd6c2",
        "#f7a98a",
        GU(45),
        "A spirited orphan wins every heart in Avonlea.",
        "cozy,coming-of-age",
    ],
    [
        "The Secret Garden",
        "Frances H. Burnett",
        "Cozy",
        270,
        "🌱",
        "#c8f0dd",
        "#8fdcb8",
        GU(113),
        "A lonely girl discovers a hidden garden that heals.",
        "garden,children",
    ],
    [
        "Little Women",
        "Louisa May Alcott",
        "Cozy",
        500,
        "🧵",
        "#e6d6fa",
        "#c9aef0",
        GU(514),
        "Four March sisters grow up and dream big.",
        "family,classic",
    ],
    [
        "Alice's Adventures in Wonderland",
        "Lewis Carroll",
        "Cozy",
        120,
        "🐇",
        "#cde8ff",
        "#a9c8f5",
        GU(11),
        "A curious girl tumbles into a topsy-turvy world.",
        "fantasy,whimsy",
    ],
    [
        "The Wind in the Willows",
        "Kenneth Grahame",
        "Cozy",
        250,
        "🦫",
        "#e0f5c9",
        "#b5e08e",
        GU(289),
        "Riverbank adventures with Mole, Ratty, Badger and Mr. Toad.",
        "cozy,animals",
    ],
].map((b, i) => ({
    id: i,
    t: b[0],
    a: b[1],
    g: b[2],
    p: b[3],
    e: b[4],
    c1: b[5],
    c2: b[6],
    l: b[7],
    d: b[8],
    tg: b[9].split(","),
    dk: ["Horror"].includes(b[2]),
}));
const ls = {
    get(k, d) {
        try {
            return JSON.parse(localStorage.getItem(k)) ?? d;
        } catch (e) {
            return d;
        }
    },
    set(k, v) {
        try {
            localStorage.setItem(k, JSON.stringify(v));
        } catch (e) {}
    },
};
let user = ls.get("pp2_user", null),
    theme = ls.get("pp2_t", "light"),
    snd = ls.get("pp2_s", true),
    prog = ls.get("pp2_prog", {}),
    cur = ls.get("pp2_cur", null),
    held = ls.get("pp2_held", [18]),
    wish = ls.get("pp2_wish", [3]);
let filter = "All",
    q = "",
    tab = "history",
    toast,
    tsec = 1500,
    tr = false;
document.documentElement.dataset.t = theme;
const save = () => {
    ls.set("pp2_user", user);
    ls.set("pp2_prog", prog);
    ls.set("pp2_cur", cur);
    ls.set("pp2_held", held);
    ls.set("pp2_wish", wish);
};
const say = (m) => {
    toast && toast.remove();
    toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = m;
    document.body.append(toast);
    setTimeout(() => toast.remove(), 2200);
};
const PAGEFILE = { home: "index", lend: "lend-trade" };
const go = (r) => {
    const [p, id] = String(r).split("/");
    location.href = (PAGEFILE[p] || p) + ".php" + (id != null ? "?id=" + id : "");
};
// ---- sound ----
let ac,
    mg,
    nodes = [],
    mt,
    mus = null,
    vol = 0.35;
const AC = () => {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    ac.resume && ac.resume();
    return ac;
};
function pop() {
    if (!snd) return;
    try {
        const a = AC(),
            t = a.currentTime,
            o = a.createOscillator(),
            g = a.createGain();
        o.frequency.setValueAtTime(650, t);
        o.frequency.exponentialRampToValueAtTime(1150, t + 0.07);
        g.gain.setValueAtTime(0.13, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.connect(g).connect(a.destination);
        o.start();
        o.stop(t + 0.16);
    } catch (e) {}
}
document.addEventListener("click", (e) => {
    if (e.target.closest("button,a,.chip,.bk,.avs div,.fmt,.brand")) pop();
});
// ---- ui helpers ----
const ART = {
    mtn: `<path d="M0 60L25 28 45 48 70 20 100 60Z" fill="#0003"/><path d="M0 60L35 40 60 56 80 38 100 60Z" fill="#0004"/><circle cx="68" cy="14" r="9" fill="#fff8"/>`,
    bl: `<path d="M0 52Q30 42 55 30T100 8" stroke="#6b4a3a" stroke-width="1.6" fill="none"/>${[
        [20, 45],
        [40, 37],
        [58, 28],
        [75, 18],
        [88, 10],
        [30, 40],
        [66, 24],
    ]
        .map(
            (p) =>
                `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#fff" opacity=".92"/><circle cx="${p[0]}" cy="${p[1]}" r="1.6" fill="#f08fb0"/>`,
        )
        .join("")}`,
    moon: `<circle cx="50" cy="28" r="15" fill="#fff9d6"/><circle cx="57" cy="24" r="13" fill="rgba(25,18,55,.92)"/>${[
        [12, 10],
        [85, 14],
        [30, 50],
        [78, 46],
        [20, 30],
    ]
        .map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="1.2" fill="#fff"/>`)
        .join("")}`,
    flo: `${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="50" cy="28" rx="7" ry="13" fill="#fff" opacity=".88" transform="rotate(${a} 50 38)"/>`).join("")}<circle cx="50" cy="38" r="6" fill="#f6b73c"/>`,
    dots: Array.from(
        { length: 24 },
        (_, i) => `<circle cx="${(i % 6) * 18 + 6}" cy="${((i / 6) | 0) * 13 + 6}" r="${2 + (i % 3)}" fill="#0002"/>`,
    ).join(""),
};
const KM = {
    Manga: "dots",
    Manhwa: "flo",
    Thriller: "moon",
    Horror: "moon",
    Historical: "mtn",
    Detective: "mtn",
    Cozy: "bl",
};
const cover = (b) =>
    `<div class="cv3 ${b.dk ? "dk" : ""}" style="background:linear-gradient(170deg,${b.c1},${b.c2})">${b.img ? `<img src="${b.img}" alt="" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:2">` : ""}<b style="font-size:min(13cqw,${((128 / Math.max(...b.t.split(" ").map((w) => w.length))) * (b.t.length > 26 ? 0.88 : 1)).toFixed(1)}cqw)">${b.t}</b><svg viewBox="0 0 100 60">${ART[KM[b.g]]}</svg><small>${b.a.toUpperCase()}</small></div>`;
const src = (b) => (b.g == "Manga" ? "MANGA Plus" : b.g == "Manhwa" ? "WEBTOON" : "Project Gutenberg");
const bk = (b) =>
    `<div class="bk" onclick="openBook(${b.id})" tabindex="0">${cover(b)}<p><span class="pill ${b.g == "Manga" || b.g == "Manhwa" ? "p" : ""}">Free · ${b.g}</span></p><p class="mini">${miniR(b.id)}</p><p class="mini">${avl(b)}</p></div>`;
const avH = () => (user.img ? `<img src="${user.img}" alt="">` : face(user.av));
function openBook(i) {
    if (!user) {
        say("Please log in to open books 🌷");
        return auth("in");
    }
    go("book/" + i);
}
function auth(m) {
    const up = m == "up";
    $("#authBox").innerHTML =
        `<h2 style="margin-top:0">${up ? "Join the garden 🌷" : "Welcome back 🌸"}</h2><p class="sub">${up ? "Create your reader account" : "Log in to your shelf"}</p>${up ? '<input id="an" placeholder="Your name">' : ""}<input id="ae" type="email" placeholder="Email"><input id="ap" type="password" placeholder="Password (6+ characters)"><button class="btn" style="width:100%" onclick="doAuth(${up})">${up ? "Create account" : "Log in"}</button><p class="sub" style="text-align:center;margin:12px 0 0;cursor:pointer" onclick="auth('${up ? "in" : "up"}')">${up ? "Already a member? Log in" : "New here? Sign up"}</p>`;
    $("#auth").classList.add("show");
}
$("#auth").onclick = (e) => {
    if (e.target.id == "auth") e.target.classList.remove("show");
};
async function doAuth(up) {
    const e = $("#ae").value.trim(), p = $("#ap").value;
    if (!/^\S+@\S+\.\S+$/.test(e)) return say("Enter a valid email");
    if (p.length < 6) return say("Password needs 6+ characters");
    try {
        const endpoint = up ? "../UserPHP/signup.php" : "../UserPHP/login.php";
        const payload = up
            ? { name: $("#an")?.value.trim() || "Reader", email: e, password: p }
            : { email: e, password: p };
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            credentials: "same-origin",
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.ok) return say(data.error || "Login failed");
        const u = data.user;
        user = {
            name: u.name,
            nick: u.nickname || u.name.split(" ")[0],
            username: (u.email || e).split("@")[0].toLowerCase(),
            email: u.email,
            role: u.role,
            av: u.role === "admin" ? "tabby" : u.role === "librarian" ? "grey" : "bunny",
            img: "",
            plan: u.plan_id ? Number(u.plan_id) - 1 : 0,
            since: 2026,
            id: u.library_id,
        };
        save();
        $("#auth").classList.remove("show");
        if (u.role === "admin" || u.role === "librarian") {
            location.href = data.redirect;
        } else {
            say("Welcome, " + user.nick + " 🌸");
            go("dashboard");
        }
    } catch (err) {
        say("Server error. Make sure Apache and MySQL are running.");
    }
}
async function logout() {
    user = null;
    ls.set("pp2_user", null);
    try { await fetch("../UserPHP/logout.php", {credentials:"same-origin"}); } catch(e) {}
    location.href = "index.php";
}
const tog = () => {
    theme = theme == "dark" ? "light" : "dark";
    document.documentElement.dataset.t = theme;
    ls.set("pp2_t", theme);
    nav();
};
const togS = () => {
    snd = !snd;
    ls.set("pp2_s", snd);
    nav();
    pop();
};
function start(i) {
    prog[i] = prog[i] || 1;
    cur = i;
    save();
    say("On your desk now 🪴");
    go("study");
}
function wl(i) {
    wish = wish.includes(i) ? wish.filter((x) => x != i) : [...wish, i];
    save();
    say(wish.includes(i) ? "Added to wishlist 💖" : "Removed");
    render(true);
}
const side = (r) => {
    const L = [
        ["dashboard", "home", "Dashboard"],
        ["browse", "search", "Browse"],
        ["study", "book", "Study Zone"],
        ["reservation", "ticket", "Reservations"],
        ["appointments", "calendar", "Appointments"],
        ["lend", "swap", "Lend & Trade"],
        ["membership", "gem", "Membership"],
        ["profile", "bear", "Profile"],
    ];
    return `<aside class="side"><div class="me"><div class="av">${avH()}</div>${user.nick}</div>${L.map((l) => `<a class="${r == l[0] || (r == "book" && l[0] == "browse") ? "on" : ""}" onclick="go('${l[0]}')">${ic(l[1], 26)} ${l[2]}${l[0] == "appointments" && user.plan < 2 ? ic("lock", 16) : ""}</a>`).join("")}</aside>`;
};
const V = {}; // each page file adds its own view:  V.pageName = () => html
function need() {
    say("Please log in first");
    auth("in");
}
const GUEST = ["home", "browse", "membership", "about"];
function render(keep) {
    let r = document.body.dataset.page || "home",
        id = new URLSearchParams(location.search).get("id");
    if (!V[r]) r = "home";
    if (!user && !GUEST.includes(r)) {
        location.replace("index.php");
        return;
    }
    if (user && r == "home") {
        // Only go to the dashboard if the server session still exists
        fetch("../config/session_user.php", { credentials: "same-origin" })
            .then((x) => x.json())
            .then((s) => {
                if (s.user) {
                    location.replace("dashboard.php");
                } else {
                    // stale browser login: clear it and show the normal home page
                    user = null;
                    ls.set("pp2_user", null);
                    render();
                }
            })
            .catch(() => {});
        return;
    }
    if (r == "book" && !B[+id]) {
        location.replace("browse.php");
        return;
    }
    nav();
    const ae = document.activeElement,
        pos = ae && ae.tagName == "INPUT" && ae.type != "range" ? ae.selectionStart : null;
    const body = V[r](+id);
    $("#app").innerHTML = user
        ? `<div class="lay">${side(r)}<section class="pane">${body}</section></div>`
        : `<div class="card" style="padding:24px 22px">${body}</div>`;
    if (pos !== null) {
        const i = $("#app input");
        i && (i.focus(), i.setSelectionRange(pos, pos));
    }
    if (!keep) scrollTo(0, 0);
}
const KEYS = [
    "sprout",
    "tabby",
    "grey",
    "pup",
    "dog",
    "bunny",
    "bunny2",
    "frog",
    "frog2",
    "bear",
    "panda",
    "cool",
    "fox",
    "chick",
    "sun",
];
const ey = (a, y) =>
    (a || [38, 62])
        .map(
            (x) =>
                `<circle cx="${x}" cy="${y || 58}" r="3.6" fill="#3a2a30"/><circle cx="${x + 1.2}" cy="${(y || 58) - 1.3}" r="1.3" fill="#fff"/>`,
        )
        .join("");
const ck = `<ellipse cx="29" cy="66" rx="6" ry="3.8" fill="#ff9fb8" opacity=".75"/><ellipse cx="71" cy="66" rx="6" ry="3.8" fill="#ff9fb8" opacity=".75"/>`,
    mo = `<path d="M44 68q6 6 12 0" fill="none" stroke="#3a2a30" stroke-width="2.4" stroke-linecap="round"/>`,
    ns = `<ellipse cx="50" cy="63" rx="3" ry="2.2" fill="#e5708f"/>`,
    ce = (c) =>
        `<path d="M22 50L27 16L48 34ZM78 50L73 16L52 34Z" fill="${c}"/><path d="M28 38L30 24L40 33ZM72 38L70 24L60 33Z" fill="#ffb3c6"/>`,
    fr = `<ellipse cx="50" cy="66" rx="31" ry="22" fill="#8fd16f"/><circle cx="34" cy="42" r="12" fill="#8fd16f"/><circle cx="66" cy="42" r="12" fill="#8fd16f"/><circle cx="34" cy="42" r="8" fill="#fff"/><circle cx="66" cy="42" r="8" fill="#fff"/><circle cx="35" cy="43" r="4.5" fill="#3a2a30"/><circle cx="67" cy="43" r="4.5" fill="#3a2a30"/><circle cx="36.5" cy="41.5" r="1.5" fill="#fff"/><circle cx="68.5" cy="41.5" r="1.5" fill="#fff"/><path d="M34 70q16 12 32 0" fill="none" stroke="#3a6a3a" stroke-width="2.6" stroke-linecap="round"/>`,
    bun = (e, h) =>
        `<ellipse cx="36" cy="22" rx="8" ry="20" fill="${e}"/><ellipse cx="64" cy="22" rx="8" ry="20" fill="${e}"/><ellipse cx="36" cy="24" rx="4" ry="13" fill="#ffc2d4"/><ellipse cx="64" cy="24" rx="4" ry="13" fill="#ffc2d4"/><ellipse cx="50" cy="62" rx="28" ry="24" fill="${h}"/>` +
        ey() +
        ck +
        ns +
        mo,
    pa = `<circle cx="26" cy="32" r="11" fill="#3a2a30"/><circle cx="74" cy="32" r="11" fill="#3a2a30"/><ellipse cx="50" cy="60" rx="29" ry="26" fill="#fff"/>`;
const FA = {
    sprout: [
        "#dff3e6",
        `<path d="M50 38q-3-15-18-13 2 14 18 13ZM50 38q3-15 18-13-2 14-18 13Z" fill="#6cc08b"/><circle cx="50" cy="62" r="27" fill="#c9eed6"/>` +
            ey() +
            ck +
            mo,
    ],
    tabby: [
        "#fde3c8",
        ce("#f2a24f") +
            `<ellipse cx="50" cy="60" rx="29" ry="25" fill="#f7b66b"/><path d="M43 38v7M50 36v8M57 38v7" stroke="#e08a3c" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="50" cy="69" rx="11" ry="7" fill="#fff4e6"/>` +
            ey() +
            ck +
            ns +
            mo,
    ],
    grey: [
        "#e3e6f4",
        ce("#98a0bb") +
            `<ellipse cx="50" cy="60" rx="29" ry="25" fill="#b6bcd2"/><ellipse cx="50" cy="69" rx="11" ry="7" fill="#f3f4fa"/>` +
            ey() +
            ck +
            ns +
            mo,
    ],
    pup: [
        "#fdebd3",
        `<ellipse cx="24" cy="58" rx="9" ry="17" fill="#c98f55"/><ellipse cx="76" cy="58" rx="9" ry="17" fill="#c98f55"/><ellipse cx="50" cy="60" rx="27" ry="25" fill="#f2c892"/><ellipse cx="50" cy="68" rx="12" ry="8" fill="#fff1de"/>` +
            ey() +
            ck +
            ns +
            mo,
    ],
    dog: [
        "#eee0d0",
        `<ellipse cx="24" cy="58" rx="9" ry="17" fill="#6e4328"/><ellipse cx="76" cy="58" rx="9" ry="17" fill="#6e4328"/><ellipse cx="50" cy="60" rx="27" ry="25" fill="#a9693f"/><ellipse cx="50" cy="68" rx="12" ry="8" fill="#d9b48a"/>` +
            ey() +
            ck +
            ns +
            mo,
    ],
    bunny: ["#fbe0ea", bun("#fff", "#fff")],
    bunny2: ["#f9e4da", bun("#f0c9ad", "#f6d8c2")],
    frog: ["#e0f2cf", fr + ck],
    frog2: ["#d6f1ee", fr.replace(/#8fd16f/g, "#7fd3c0") + ck],
    bear: [
        "#f9e5d6",
        `<circle cx="26" cy="32" r="11" fill="#a9703f"/><circle cx="74" cy="32" r="11" fill="#a9703f"/><circle cx="26" cy="32" r="5" fill="#e8b98e"/><circle cx="74" cy="32" r="5" fill="#e8b98e"/><ellipse cx="50" cy="60" rx="29" ry="26" fill="#b98050"/><ellipse cx="50" cy="68" rx="12" ry="9" fill="#ecd0aa"/>` +
            ey() +
            ck +
            `<ellipse cx="50" cy="63" rx="4" ry="3" fill="#3a2a30"/>` +
            mo,
    ],
    panda: [
        "#e3ebf7",
        pa +
            `<ellipse cx="37" cy="57" rx="8" ry="10" fill="#3a2a30" transform="rotate(20 37 57)"/><ellipse cx="63" cy="57" rx="8" ry="10" fill="#3a2a30" transform="rotate(-20 63 57)"/><circle cx="37" cy="57" r="3" fill="#fff"/><circle cx="63" cy="57" r="3" fill="#fff"/>` +
            ck +
            `<ellipse cx="50" cy="65" rx="3.5" ry="2.5" fill="#3a2a30"/>` +
            mo,
    ],
    cool: [
        "#cfeae3",
        pa +
            `<rect x="24" y="50" width="22" height="14" rx="6" fill="#222"/><rect x="54" y="50" width="22" height="14" rx="6" fill="#222"/><rect x="45" y="55" width="10" height="3" fill="#222"/>` +
            ck +
            `<ellipse cx="50" cy="68" rx="3.5" ry="2.5" fill="#3a2a30"/><path d="M45 73q5 4 10 0" fill="none" stroke="#3a2a30" stroke-width="2.2" stroke-linecap="round"/>`,
    ],
    fox: [
        "#fde7d6",
        `<path d="M20 50L24 16L46 34ZM80 50L76 16L54 34Z" fill="#e9843a"/><path d="M14 62Q50 34 86 62Q72 92 50 92Q28 92 14 62Z" fill="#f08f46"/><path d="M14 62Q40 76 50 92Q28 92 14 62ZM86 62Q60 76 50 92Q72 92 86 62Z" fill="#fff"/>` +
            ey([38, 62], 58) +
            `<ellipse cx="50" cy="80" rx="3.5" ry="2.8" fill="#3a2a30"/>`,
    ],
    chick: [
        "#fbf0bf",
        `<path d="M46 34q4-10 8 0z" fill="#f6d34a"/><circle cx="50" cy="60" r="28" fill="#fbdc55"/><ellipse cx="24" cy="62" rx="5" ry="9" fill="#f6cf3d"/><ellipse cx="76" cy="62" rx="5" ry="9" fill="#f6cf3d"/>` +
            ey() +
            ck +
            `<path d="M45 63h10l-5 6z" fill="#ff9a3c"/>`,
    ],
    sun: [
        "#dcecf8",
        [...Array(12)]
            .map(
                (_, i) =>
                    `<ellipse cx="50" cy="22" rx="7" ry="13" fill="#ffd54a" transform="rotate(${i * 30} 50 50)"/>`,
            )
            .join("") +
            `<circle cx="50" cy="50" r="22" fill="#7a4b2a"/>` +
            ey([42, 58], 50) +
            `<path d="M45 58q5 5 10 0" fill="none" stroke="#3a2a30" stroke-width="2.2" stroke-linecap="round"/>`,
    ],
};
const face = (k, s) => {
    const a = FA[k] || FA.tabby;
    return `<svg viewBox="0 0 100 100" width="${s || 100}" height="${s || 100}"><circle cx="50" cy="50" r="50" fill="${a[0]}"/>${a[1]}</svg>`;
};
let dayD = ls.get("pp3_day", { d: "", s: 0, f: [] }),
    sty = false;
const FACE = (x, y, k) =>
    `<g transform="translate(${x} ${y}) scale(${k})"><circle cx="-6" cy="0" r="2.3" fill="#5a3550"/><circle cx="6" cy="0" r="2.3" fill="#5a3550"/><circle cx="-5.4" cy="-.7" r=".8" fill="#fff"/><circle cx="6.6" cy="-.7" r=".8" fill="#fff"/><path d="M-3 4q3 3.2 6 0" fill="none" stroke="#5a3550" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="-11" cy="4" rx="3.2" ry="2" fill="#ff7fa8" opacity=".55"/><ellipse cx="11" cy="4" rx="3.2" ry="2" fill="#ff7fa8" opacity=".55"/></g>`;
const IC = {
    home: [
        `<path d="M9 28L28 12L47 28V45a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5Z" fill="#ffd1e1"/><path d="M5 29L28 9L51 29" fill="none" stroke="#ff7fa8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
        28,
        36,
    ],
    search: [
        `<circle cx="25" cy="25" r="17" fill="#d4e8ff"/><path d="M38 38L50 50" stroke="#ff9ec2" stroke-width="7" stroke-linecap="round"/>`,
        25,
        25,
    ],
    book: [
        `<rect x="5" y="13" width="23" height="34" rx="7" fill="#d9c9ff"/><rect x="28" y="13" width="23" height="34" rx="7" fill="#c3b0ff"/>`,
        28,
        30,
    ],
    ticket: [
        `<rect x="5" y="14" width="46" height="28" rx="9" fill="#ffe08a"/><path d="M38 16v24" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>`,
        24,
        28,
    ],
    swap: [
        `<circle cx="28" cy="28" r="22" fill="#c4f0df"/><path d="M15 19h22l-5-5M41 37H19l5 5" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
        28,
        29,
    ],
    gem: [`<path d="M15 11h26l11 14L28 50L5 25Z" fill="#ffb3dc"/>`, 28, 27],
    bear: [
        `<circle cx="12" cy="14" r="8" fill="#d9a273"/><circle cx="44" cy="14" r="8" fill="#d9a273"/><circle cx="28" cy="31" r="21" fill="#e8b98a"/><ellipse cx="28" cy="38" rx="9" ry="6.5" fill="#f6dcc0"/>`,
        28,
        29,
    ],
    bell: [
        `<path d="M28 7a15 15 0 0 1 15 15v10l5 7H8l5-7V22A15 15 0 0 1 28 7Z" fill="#ffe08a"/><circle cx="28" cy="48" r="5" fill="#ff9ec2"/>`,
        28,
        26,
    ],
    moon: [`<path d="M36 7a22 22 0 1 0 13 31A18 18 0 0 1 36 7Z" fill="#ffe08a"/>`, 24, 32],
    sun: [
        [0, 45, 90, 135, 180, 225, 270, 315]
            .map(
                (a) =>
                    `<path d="M28 3v6" stroke="#ffb74d" stroke-width="4" stroke-linecap="round" transform="rotate(${a} 28 28)"/>`,
            )
            .join("") + `<circle cx="28" cy="28" r="16" fill="#ffd54a"/>`,
        28,
        28,
    ],
    bird: [
        `<circle cx="26" cy="30" r="19" fill="#8fd8ff"/><path d="M44 29l9 3-9 4Z" fill="#ffb74d"/><path d="M10 34q8 12 20 6" fill="#6cc3f5"/>`,
        24,
        28,
    ],
    fire: [
        `<path d="M28 5C34 16 47 22 45 36a17 17 0 0 1-34 0C9 27 20 24 20 14c4 2 6 3 8-9Z" fill="#ff9a6b"/><path d="M28 28c5 5 9 8 8 14a8 8 0 0 1-16 0c-1-5 5-8 8-14Z" fill="#ffd27a"/>`,
        28,
        40,
    ],
    rain: [
        `<path d="M14 37a10 10 0 0 1 2-20 14 14 0 0 1 26 3 8.5 8.5 0 0 1 0 17Z" fill="#cfe0ff"/><ellipse cx="18" cy="46" rx="2.5" ry="4" fill="#7fb2ff"/><ellipse cx="28" cy="49" rx="2.5" ry="4" fill="#7fb2ff"/><ellipse cx="38" cy="46" rx="2.5" ry="4" fill="#7fb2ff"/>`,
        28,
        27,
    ],
    wave: [
        `<circle cx="28" cy="28" r="22" fill="#bfe6ff"/><path d="M8 33q10-10 20 0t20 0a22 22 0 0 1-40 0Z" fill="#8fd0ff"/>`,
        28,
        25,
    ],
    brain: [
        `<circle cx="19" cy="27" r="13" fill="#ffb8cf"/><circle cx="37" cy="27" r="13" fill="#ffb8cf"/><ellipse cx="28" cy="37" rx="17" ry="11" fill="#ffb8cf"/>`,
        28,
        32,
    ],
    phones: [
        `<path d="M9 34V28a19 19 0 0 1 38 0v6" fill="none" stroke="#ff9ec2" stroke-width="5" stroke-linecap="round"/><rect x="5" y="31" width="12" height="18" rx="6" fill="#ffb8d2"/><rect x="39" y="31" width="12" height="18" rx="6" fill="#ffb8d2"/>`,
        0,
        0,
    ],
    sprout: [
        `<path d="M28 28q-2-16-18-14 2 16 18 14ZM28 28q2-16 18-14-2 16-18 14Z" fill="#7ed39a"/><circle cx="28" cy="38" r="14" fill="#c9eed6"/>`,
        28,
        38,
    ],
    flower: [
        [0, 72, 144, 216, 288]
            .map((a) => `<circle cx="28" cy="14" r="9.5" fill="#ffb3d1" transform="rotate(${a} 28 28)"/>`)
            .join("") + `<circle cx="28" cy="28" r="10" fill="#ffe27a"/>`,
        28,
        28,
    ],
    star: [`<path d="M28 5l7 15 16 2-12 11 3 16-14-8-14 8 3-16L5 22l16-2Z" fill="#ffd54a"/>`, 28, 30],
};
const ic = (n, s) => {
    const [p, x, y] = IC[n] || IC.heart || IC.star;
    return `<svg viewBox="0 0 56 56" width="${s || 26}" height="${s || 26}" style="flex:none;vertical-align:middle"><g stroke="#fff" stroke-width="1.5" stroke-linejoin="round">${p}</g>${x ? FACE(x, y, n == "flower" || n == "star" ? 0.7 : 0.9) : ""}</svg>`;
};
$(".brand").innerHTML = ic("flower", 32) + " Petal &amp; Page";
$(".brand").style.cssText += "display:flex;align-items:center;gap:6px";
document.querySelectorAll(".fl").forEach((e) => e.remove());
["#ffb3d1", "#e2c8ff", "#ffd9a8", "#ffc2e0", "#d4c2ff", "#ffcfe6"].forEach((c, i) => {
    const s = document.createElement("span");
    s.className = "fl";
    s.innerHTML = ic("flower", 34).replace(/#ffb3d1/g, c);
    s.style.cssText = `top:${8 + i * 15}%;${i % 2 ? "left" : "right"}:${1 + i}%;animation-delay:${i}s`;
    document.body.prepend(s);
});
// ---- browse: fiction / non-fiction ----
ART.lines = `<circle cx="50" cy="24" r="15" fill="#fff6"/><path d="M18 46h64M28 52h44" stroke="#0003" stroke-width="2.4" stroke-linecap="round"/>`;
KM["Non-fiction"] = "lines";
B.forEach((b) => (b.nf = false));
[
    [
        "The Art of War",
        "Sun Tzu",
        100,
        "#ffe3b3",
        "#f0b36a",
        132,
        "Ancient strategy wisdom: win without fighting, lead with calm.",
        "strategy,philosophy",
    ],
    [
        "Meditations",
        "Marcus Aurelius",
        200,
        "#dfe8f7",
        "#a8bde3",
        2680,
        "A Roman emperor's private notes on calm, duty and resilience.",
        "stoicism,philosophy",
    ],
    [
        "Walden",
        "Henry David Thoreau",
        300,
        "#d6f0d0",
        "#8fcf8a",
        205,
        "Two years of simple living by a pond — a classic on mindful life.",
        "nature,essays",
    ],
    [
        "The Prince",
        "Niccolò Machiavelli",
        120,
        "#f7d4d4",
        "#e39a9a",
        1232,
        "A sharp, famous guide to power and politics.",
        "politics,history",
    ],
    [
        "The Autobiography of Benjamin Franklin",
        "Benjamin Franklin",
        250,
        "#fde9c0",
        "#efc46e",
        148,
        "Habits, curiosity and self-improvement from a founding father.",
        "memoir,self-improvement",
    ],
    [
        "As a Man Thinketh",
        "James Allen",
        60,
        "#f0dcff",
        "#c9a6f0",
        4507,
        "A tiny classic on how thoughts shape your life.",
        "self-help,mindset",
    ],
].forEach((x, j) =>
    B.push({
        id: 24 + j,
        t: x[0],
        a: x[1],
        g: "Non-fiction",
        p: x[2],
        c1: x[3],
        c2: x[4],
        l: GU(x[5]),
        d: x[6],
        tg: x[7].split(","),
        dk: false,
        nf: true,
    }),
);
// ---- ratings & reviews ----
const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);
let RV = ls.get("pp3_rev", [
        { b: 18, r: 5, t: "Witty, sparkling and full of heart — Elizabeth is unforgettable.", u: "Sarah", d: "Jul 14" },
        { b: 21, r: 5, t: "A cozy classic for slow Sunday afternoons.", u: "Maya", d: "Jun 30" },
        { b: 8, r: 4, t: "Spooky and atmospheric. Read it with the lights on!", u: "Alex", d: "Jun 05" },
        { b: 16, r: 5, t: "Holmes at his best — perfect for study breaks.", u: "Rohan", d: "May 22" },
        { b: 0, r: 5, t: "Epic adventure with so much heart.", u: "Ananya", d: "May 10" },
        { b: 24, r: 5, t: "Short, sharp and still wise today.", u: "Meera", d: "Apr 02" },
    ]),
    dR = 0,
    dT = "",
    dB = -1;
const sv = () => ls.set("pp3_rev", RV),
    mine = (i) => RV.find((r) => r.b == i && r.me),
    stx = (r, z) =>
        [1, 2, 3, 4, 5]
            .map(
                (n) =>
                    `<span style="color:${n <= Math.round(r) ? "#ffb53d" : "#ecd9e4"};font-size:${z || 16}px">★</span>`,
            )
            .join(""),
    avgR = (i) => {
        const a = RV.filter((r) => r.b == i);
        return a.length ? [a.reduce((s, r) => s + r.r, 0) / a.length, a.length] : [0, 0];
    };
function setR(n, i) {
    if (dB != i) {
        dT = "";
        dB = i;
    }
    dR = n;
    render(true);
}
function postRev(i) {
    const r = dB == i && dR ? dR : (mine(i) || {}).r || 0;
    if (!r) return say("Tap a star first");
    RV = RV.filter((x) => !(x.b == i && x.me));
    RV.unshift({
        b: i,
        r,
        t: dB == i ? dT.trim() : "",
        u: user.nick,
        me: true,
        d: new Date().toLocaleDateString("en", { month: "short", day: "numeric" }),
    });
    sv();
    dR = 0;
    dT = "";
    dB = -1;
    say("Thanks for your review 💖");
    render(true);
}
function editRev(i) {
    const m = mine(i);
    if (!m) return;
    dR = m.r;
    dT = m.t;
    dB = i;
    RV = RV.filter((r) => r !== m);
    sv();
    go("book/" + i);
    render(true);
}
function delRev(i) {
    RV = RV.filter((r) => !(r.b == i && r.me));
    sv();
    render(true);
}
function quick(i, n) {
    const m = mine(i);
    if (m) m.r = n;
    else RV.unshift({ b: i, r: n, t: "", u: user.nick, me: true, d: "today" });
    sv();
    say("Rated " + n + " stars");
    render(true);
}
const revHTML = (i) => {
    const [a, c] = avgR(i),
        m = mine(i),
        sh = dB == i ? dR : 0;
    return `<h2>Ratings &amp; reviews</h2><div class="card" style="margin-bottom:14px"><div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center"><div class="stat"><b>${c ? a.toFixed(1) : "—"}</b>${stx(a, 18)}<br><small class="sub">${c} rating${c == 1 ? "" : "s"}</small></div><div style="flex:1;min-width:230px"><h3>${m ? "Update your review" : "Rate & review this book"}</h3><div>${[1, 2, 3, 4, 5].map((n) => `<span onclick="setR(${n},${i})" style="cursor:pointer;font-size:32px;color:${n <= (sh || (m && dB != i ? m.r : 0)) ? "#ffb53d" : "#ecd9e4"}">★</span>`).join("")}</div><textarea rows="3" placeholder="What did you think? (optional)" oninput="dT=this.value;dB=${i}">${dB == i ? esc(dT) : ""}</textarea><button class="btn" onclick="postRev(${i})">${m ? "Update" : "Post review"}</button></div></div></div>
${
    RV.filter((r) => r.b == i)
        .map(
            (r) =>
                `<div class="card" style="margin-bottom:10px"><div class="row" style="border:0;padding:0"><b>${r.me ? "You" : esc(r.u)} <small class="sub">· ${r.d}</small></b><span>${stx(r.r)}</span></div><p style="font-size:14px;margin:6px 0;line-height:1.6">${r.t ? esc(r.t) : "<i class='sub'>Rated without a review</i>"}</p>${r.me ? `<button class="btn o" onclick="editRev(${i})">Edit</button> <button class="btn o" onclick="delRev(${i})">Delete</button>` : ""}</div>`,
        )
        .join("") || "<p class='sub'>No reviews yet — be the first!</p>"
}`;
};
// ---- reading tracker ----
let sess = ls.get("pp4_sess", null),
    LOG = ls.get("pp4_log", []),
    pSec = ls.get("pp4_psec", {}),
    tk = 0;
const sv4 = () => {
    ls.set("pp4_sess", sess);
    ls.set("pp4_log", LOG.slice(0, 150));
    ls.set("pp4_psec", pSec);
};
const mmss = (s) => {
    s = Math.max(0, s | 0);
    return s >= 3600
        ? `${(s / 3600) | 0}h ${((s % 3600) / 60) | 0}m`
        : `${(s / 60) | 0}m ${String(s % 60).padStart(2, "0")}s`;
};
const pageSec = (i) => (pSec[i] || 0) + (sess && sess.b == i ? Math.min(14400, (Date.now() - sess.ts) / 1000) : 0);
const todayPages = () =>
    LOG.filter((r) => r.d == new Date().toDateString()).reduce((s, r) => s + Math.max(0, r.to - r.from), 0);
function addLog(b, from, to, sec) {
    LOG.unshift({
        b,
        from,
        to,
        sec: Math.round(sec),
        d: new Date().toDateString(),
        t: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
    });
    sv4();
}
function setPage(i, p) {
    const old = prog[i] || 1;
    if (p != old) {
        addLog(i, old, p, pSec[i] || 0);
        pSec[i] = 0;
    }
    prog[i] = p;
    save();
    sv4();
}
function startRead(i) {
    if (!user) return;
    sess = { b: i, ts: Date.now() };
    cur = i;
    prog[i] = prog[i] || 1;
    save();
    sv4();
    say("Reading timer started — come back to log your page");
}
function askBack() {
    if (!sess || !user || $("#bp")) return;
    const b = B[sess.b],
        e = Math.min(14400, (Date.now() - sess.ts) / 1000);
    document.querySelectorAll(".qm").forEach((x) => x.remove());
    const d = document.createElement("div");
    d.className = "qm";
    d.innerHTML = `<div>${ic("book", 46)}</div><h2 style="margin:4px 0">Welcome back!</h2><p style="line-height:1.6;font-size:14px">You read <b>${esc(b.t)}</b> for <b>${mmss(e)}</b>.<br>Which page are you on now?</p><input id="bp" type="number" min="1" max="${b.p}" value="${prog[sess.b] || 1}" style="text-align:center"><button class="btn" id="bs">Save to my record</button> <button class="btn o" id="bk2">Still reading</button>`;
    document.body.append(d);
    $("#bs").onclick = () => {
        const k = sess.b,
            to = Math.min(b.p, Math.max(1, +$("#bp").value || prog[k] || 1)),
            from = prog[k] || 1;
        pSec[k] = (pSec[k] || 0) + e;
        dayD.s += Math.round(e);
        ls.set("pp3_day", dayD);
        if (to != from) {
            addLog(k, from, to, pSec[k]);
            pSec[k] = 0;
        } else addLog(k, from, from, e);
        prog[k] = to;
        sess = null;
        save();
        sv4();
        d.remove();
        say(to != from ? "Saved! You read " + (to - from) + " pages" : "Saved to your record");
        render(true);
    };
    $("#bk2").onclick = () => d.remove();
}
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && sess && Date.now() - sess.ts > 8000) askBack();
});
addEventListener("focus", () => {
    if (sess && Date.now() - sess.ts > 8000) askBack();
});
setInterval(() => {
    if (sty && cur != null) pSec[cur] = (pSec[cur] || 0) + 1;
    if (++tk % 10 == 0) sv4();
    if (cur == null) return;
    const l = $("#lt"),
        r = $("#lr");
    l && (l.textContent = "On this page: " + mmss(pageSec(cur)));
    r && (r.textContent = "Pages read today: " + todayPages());
}, 1000);
IC.heart = [`<path d="M28 49C8 35 5 22 14 14c6-5 12-2 14 4 2-6 8-9 14-4 9 8 6 21-14 35Z" fill="#ff8fb3"/>`, 28, 28];
IC.heart0 = [
    `<path d="M28 49C8 35 5 22 14 14c6-5 12-2 14 4 2-6 8-9 14-4 9 8 6 21-14 35Z" fill="#f6e9f4" stroke="#ff8fb3" stroke-width="2.5"/>`,
    28,
    28,
];
IC.lock = [
    `<path d="M19 26v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#c9a0ff" stroke-width="5" stroke-linecap="round"/><rect x="11" y="25" width="34" height="26" rx="8" fill="#ffd97a"/>`,
    28,
    38,
];
IC.calendar = [
    `<rect x="7" y="12" width="42" height="38" rx="9" fill="#ffd1e1"/><rect x="7" y="12" width="42" height="12" rx="6" fill="#ff8fb3"/><path d="M18 8v8M38 8v8" stroke="#c9a0ff" stroke-width="4" stroke-linecap="round"/>`,
    28,
    38,
];
B.forEach((b) => (b.e = ""));
GUEST.push("book");
const PL = [
    {
        n: "Basic",
        pr: "৳0",
        tag: "Free access, casual readers",
        i: "sprout",
        ph: 3,
        dg: "2",
        hold: 1,
        room: "Day pass",
        x: ["1 cozy study theme"],
        bg: "linear-gradient(135deg,#fff6bf,#ffe27a)",
        dash: "#d9a900",
        txt: "#4a3b00",
        out: "#fff3c2",
        chip: "#fff",
        cc: "#8a6a00",
    },
    {
        n: "Premium",
        pr: "৳1,200",
        tag: "Regular readers & active learners",
        i: "flower",
        ph: 8,
        dg: "10",
        hold: 5,
        room: "Full hours",
        x: ["Late-fee grace: +1 day", "2 extra study themes"],
        bg: "linear-gradient(135deg,#ffd3e8,#e0c8ff)",
        dash: "#e46fa5",
        txt: "#5a2b55",
        out: "#f9e1f2",
        chip: "#fff",
        cc: "#c0397a",
    },
    {
        n: "VIP",
        pr: "৳3,500",
        tag: "Frequent readers & advanced users",
        i: "gem",
        ph: 20,
        dg: "Unlimited",
        hold: 15,
        room: "Priority seating",
        x: ["Rare collection: by appointment", "VIP appointments page", "Exclusive Starlit study theme"],
        bg: "linear-gradient(135deg,#3b2370,#7b4fd0)",
        dash: "#ffd97a",
        txt: "#fff",
        out: "#d9cdf5",
        chip: "#ffd97a",
        cc: "#4a2c00",
    },
];
const feat = (p) => [`Physical loans: ${p.ph}`, `Hold requests: ${p.hold}`, `Reading room: ${p.room}`, ...p.x];
let RS = [],   // this reader's reservations - loaded from the database (UserPHP/reservations.php), never from the browser
    AP = ls.get("pp5_apt", []);
// turn the rows the server sends into the shape the pages use (b = position of the book in B)
function setReservations(rows) {
    RS = rows
        .map((r) => ({ ...r, b: B.findIndex((x) => (x.t ?? x[0]) === r.title) }))
        .filter((r) => r.b >= 0);
}
async function reservationsApi(body) {
    const res = await fetch("../UserPHP/reservations.php", {
        credentials: "same-origin",
        ...(body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || "Something went wrong");
    setReservations(j.data.reservations);
    return j.data;
}
// every reader page: fetch the reservations once the page scripts have loaded, then draw again
if (user) reservationsApi().then(() => render(true)).catch(() => {});
const SLOTS = ["09:00–11:00", "11:00–13:00", "14:00–16:00", "16:00–18:00"],
    APT = ["Rare collection viewing", "Librarian research consult", "Private study room"];
const iso = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    dayOpts = () =>
        [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return d;
        }),
    dl = (s) => new Date(s + "T12:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }),
    slotT = (r) => [new Date(r.date + "T" + r.slot.slice(0, 5)), new Date(r.date + "T" + r.slot.slice(6, 11))];
function resState(r) {
    if (r.done) return "done";   // picked up / expired / cancelled by the library
    if (r.mode == "queue") return "queue";
    const [s, e] = slotT(r),
        n = new Date();
    return n < s ? "up" : n <= e ? "now" : "done";
}
const active = () => RS.filter((r) => resState(r) != "done"),
    COP = (i) => {
        const b = B[i];
        if (b.g == "Manga" || b.g == "Manhwa") return null;
        const t = 3 + ((i * 7) % 5);
        return { t, a: (i * 5 + 2) % (t + 1) };
    },
    avail = (i) => {
        const c = COP(i);
        return c
            ? { t: c.t, a: Math.max(0, c.a - active().filter((r) => r.b == i && r.mode != "queue").length) }
            : null;
    },
    avl = (b) => {
        const c = avail(b.id);
        return c
            ? `<span class="cp ${c.a ? "" : "no"}">${ic("book", 14)} ${c.a} of ${c.t} copies in library</span>`
            : `<span class="cp dg">Digital only</span>`;
    },
    miniR = (i) => {
        const [a, c] = avgR(i);
        return c
            ? `<span style="color:#ffb53d">★</span> <b>${a.toFixed(1)}</b> <small class="sub">(${c})</small>`
            : `<small class="sub">No ratings yet</small>`;
    };
openBook = (i) => go("book/" + i);
// ---- notifications ----
let nOpen = false;
const notes = () => {
    if (!user) return [];
    const L = [["bell", "The Wind in the Willows is due in 2 days."]],
        a = active()[0];
    if (a)
        L.push(["ticket", B[a.b].t + ": " + (a.mode == "queue" ? "you're in the queue" : dl(a.date) + " · " + a.slot)]);
    if (wish.length) L.push(["heart", "Wishlist: " + B[wish[0]].t + " is ready to read"]);
    if (user.plan == 2 && AP[0]) L.push(["calendar", APT[AP[0].t] + " · " + dl(AP[0].date) + " " + AP[0].slot]);
    return L;
};
function togN() {
    nOpen = !nOpen;
    drawN();
}
function drawN() {
    let d = $("#np");
    if (!nOpen) {
        d && d.remove();
        return;
    }
    if (!d) {
        d = document.createElement("div");
        d.id = "np";
        d.className = "card";
        document.body.append(d);
    }
    const dk = theme == "dark";
    d.style.cssText = `position:fixed;top:64px;right:14px;z-index:45;width:min(330px,calc(100% - 28px));background:${dk ? "#2c2548" : "#fff"}`;
    d.innerHTML = `<h3 style="margin-bottom:6px">Notifications</h3>${
        user
            ? notes()
                  .map(
                      (x) =>
                          `<div class="row" style="justify-content:flex-start;gap:10px">${ic(x[0], 24)}<span style="flex:1;font-size:13px">${esc(x[1])}</span></div>`,
                  )
                  .join("") || "<p class='sub'>You're all caught up</p>"
            : "<p class='sub'>Log in to see your notifications.</p>"
    }<div class="row" style="border:0"><span style="font-size:13px">Click sounds</span><button class="btn o" onclick="togS();drawN()">${snd ? "On" : "Off"}</button></div>`;
}
document.addEventListener("click", (e) => {
    if (nOpen && !e.target.closest("#np,#bellBtn")) {
        nOpen = false;
        drawN();
    }
});
function nav() {
    const r = document.body.dataset.page || "home",
        g = [
            ["home", "Home"],
            ["browse", "Browse"],
            ["membership", "Membership"],
            ["about", "About"],
        ];
    $("#nav").innerHTML = user
        ? ""
        : g.map(([k, n]) => `<a class="${r == k ? "on" : ""}" onclick="go('${k}')">${n}</a>`).join("");
    $("#hr").innerHTML =
        `<button class="ic" id="bellBtn" onclick="togN()" aria-label="Notifications" style="position:relative">${ic("bell", 24)}${user && notes().length ? `<i style="position:absolute;top:3px;right:3px;width:10px;height:10px;border-radius:50%;background:#ff4f7b;border:2px solid #fff"></i>` : ""}</button><button class="ic" onclick="tog()" aria-label="Light or dark">${ic(theme == "dark" ? "sun" : "moon", 24)}</button>` +
        (user
            ? `<div class="av" onclick="go('profile')">${avH()}</div>`
            : `<button class="btn o" onclick="auth('in')">Log in</button><button class="btn" onclick="auth('up')">Sign up</button>`);
}
PL.forEach((p, i) => {
    p.m = [0, 150, 300][i];
    p.y = [0, 1200, 3500][i];
});
let bill = ls.get("pp6_bill", "month");
const TK = `<svg width="15" height="15" viewBox="0 0 24 24" style="flex:none"><path d="M5 12l5 5 9-10" fill="none" stroke="#e0759f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bn = (n) => "৳" + n.toLocaleString("en-US"),
    priceTxt = (p, b) => {
        const v = b == "year" ? p.y : p.m;
        return v ? `${bn(v)}<small>${b == "year" ? "/yr" : "/mo"}</small>` : "Free";
    },
    subTxt = (p, b) =>
        !p.y
            ? "No payment needed"
            : b == "year"
              ? `≈ ${bn(Math.round(p.y / 12))}/mo · save ${bn(p.m * 12 - p.y)} a year`
              : `or ${bn(p.y)}/yr`;
function setBill(b) {
    bill = b;
    ls.set("pp6_bill", b);
    render(true);
}
function buy(i) {
    if (!user) return auth("up");
    const p = PL[i],
        c = user.plan;
    $("#authBox").style.maxWidth = "440px";
    $("#authBox").innerHTML =
        `<div style="text-align:center"><h2 style="margin:0 0 2px">${i == c ? "You're on " + p.n : i > c ? "Upgrade to " + p.n : "Switch to " + p.n}</h2><p class="sub">${p.tag}</p><div class="bill" style="margin:0 0 10px"><button class="${bill == "month" ? "on" : ""}" onclick="setBill('month');buy(${i})">Monthly</button><button class="${bill == "year" ? "on" : ""}" onclick="setBill('year');buy(${i})">Yearly</button></div><div class="pcard" style="box-shadow:none;border:0;padding:0"><div class="pr">${priceTxt(p, bill)}</div><p class="sv">${subTxt(p, bill)}</p><ul>${feat(
            p,
        )
            .map((x) => `<li>${TK}${x}</li>`)
            .join(
                "",
            )}</ul></div><button class="pbtn" style="width:100%" onclick="confirmBuy(${i})">${i > c ? "Confirm purchase (demo)" : "Confirm"}</button><p class="sub" style="margin:10px 0 0;font-size:12px">Demo checkout — no real payment is taken.</p></div>`;
    $("#auth").classList.add("show");
}
function confirmBuy(i) {
    user.plan = i;
    user.bill = bill;
    save();
    $("#auth").classList.remove("show");
    say("You're now on " + PL[i].n);
    render(true);
}
const slotsFor = (d) => SLOTS.filter((s) => new Date(d + "T" + s.slice(6, 11)) > new Date());
function firstSlot() {
    for (const d of dayOpts()) {
        const s = slotsFor(iso(d));
        if (s.length) return { date: iso(d), slot: s[0] };
    }
    return { date: iso(new Date()), slot: SLOTS[0] };
}
