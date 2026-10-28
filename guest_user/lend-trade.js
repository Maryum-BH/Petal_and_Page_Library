/* lend-trade.js  –  page script for "Lend & Trade" (loads after core.js) */
V.lend = function () {
    const T = [
        ["history", "History & Fines"],
        ["swap", "Swap"],
        ["wishlist", "Wishlist"],
    ];
    let c = "";
    if (tab == "history")
        c = `<div class="g3"><div class="card"><h3>Timeline</h3>${[
            ["Wind in the Willows", "Due in 2 days", "#f2677a"],
            ["Little Women", "Returned Jul 12", "#7bc96f"],
            ["The Secret Garden", "Returned 1 day late", "#7bc96f"],
        ]
            .map(
                (r) =>
                    `<div class="row"><span><span style="color:${r[2]}">●</span> <b>${r[0]}</b><br><small class="sub">${r[1]}</small></span></div>`,
            )
            .join(
                "",
            )}</div><div class="card"><h3>Fines</h3><div class="row"><span>The Secret Garden</span><b style="color:#d9534f">৳10</b></div><div class="row"><span>Little Women</span><b>৳0</b></div><br><button class="btn" onclick="say('Preparing your statement 📄')">Download statement</button></div></div>`;
    if (tab == "swap")
        c = `<div class="card"><h3>Incoming offers</h3>${["Rebecca", "Dracula"].map((n) => `<div class="row"><span>Their copy: <b>${n}</b><br><small class="sub">for your Persuasion</small></span><span><button class="btn" onclick="this.parentNode.innerHTML='<b>Accepted ✓</b>'">Accept</button> <button class="btn o" onclick="this.parentNode.innerHTML='Declined'">Decline</button></span></div>`).join("")}</div>`;
    if (tab == "wishlist")
        c = `<div class="card">${wish.map((i) => `<div class="row"><span>${B[i].e} <b>${B[i].t}</b><br><small class="sub">${B[i].a}</small></span><span><button class="btn o" onclick="go('book/${i}')">Open</button> <button class="btn o" onclick="wl(${i})">Remove</button></span></div>`).join("") || "<p class='sub'>Tap 🤍 on any book.</p>"}</div>`;
    return `<h1>Lend &amp; Trade</h1><p class="sub">History, swaps and wishlist in one gentle view</p><div class="chips">${T.map((t) => `<span class="chip ${tab == t[0] ? "on" : ""}" onclick="tab='${t[0]}';render(true)">${t[1]}</span>`).join("")}</div>${c}`;
};
const ratingsTab = () =>
        `<div class="card"><h3>Rate your reads</h3><p class="sub">Tap the stars — no review needed.</p>${[
            3, 20, 21, 18, 16,
        ]
            .map((i) => {
                const m = mine(i);
                return `<div class="row"><span><b>${B[i].t}</b><br><small class="sub">${m ? "Your rating" : "Not rated yet"}</small></span><span>${[1, 2, 3, 4, 5].map((n) => `<span onclick="quick(${i},${n})" style="cursor:pointer;font-size:26px;color:${m && n <= m.r ? "#ffb53d" : "#ecd9e4"}">★</span>`).join("")}</span></div>`;
            })
            .join("")}</div>`,
    reviewsTab = () => {
        const L = RV.filter((r) => r.me && r.t);
        return `<div class="card"><h3>Your reviews</h3>${L.map((r) => `<div class="row"><span><b>${B[r.b].t}</b> ${stx(r.r)}<br><small class="sub">${esc(r.t)}</small></span><span><button class="btn o" onclick="editRev(${r.b})">Edit</button> <button class="btn o" onclick="delRev(${r.b})">Delete</button></span></div>`).join("") || "<p class='sub'>No reviews yet. Open any book to share your thoughts.</p>"}<br><button class="btn" onclick="go('browse')">Find a book to review</button></div>`;
    };
const ol = V.lend,
    tr2 = () =>
        `<div class="chips">${[
            ["history", "History & Fines"],
            ["swap", "Swap"],
            ["wishlist", "Wishlist"],
            ["ratings", "Ratings"],
            ["reviews", "Reviews"],
        ]
            .map(
                (t) =>
                    `<span class="chip ${tab == t[0] ? "on" : ""}" onclick="tab='${t[0]}';render(true)">${t[1]}</span>`,
            )
            .join("")}</div>`;
V.lend = () =>
    ol().replace(/<div class="chips">[\s\S]*?<\/div>/, () => tr2()) +
    (tab == "ratings" ? ratingsTab() : tab == "reviews" ? reviewsTab() : "");
const ol2 = V.lend;
V.lend = () => ol2().replace(">Wishlist</span>", ">" + ic("heart", 18) + " Wishlist</span>");

render();
