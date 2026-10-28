/* browse.js  –  page script for "Browse" (loads after core.js) */
V.browse = () => {
    const L = B.filter(
        (b) =>
            (filter == "All" || (filter == "Fiction" ? !b.nf : filter == "Non-fiction" ? b.nf : b.g == filter)) &&
            (b.t + b.a + b.tg).toLowerCase().includes(q.toLowerCase()),
    );
    return `<h1>Find your next read</h1><p class="sub">${B.length} free books & comics — fiction and non-fiction${user ? "" : " · log in to open"}</p><input placeholder="Search titles, authors, tags…" value="${q}" oninput="q=this.value;render(true)"><div class="chips">${["All", "Fiction", "Non-fiction", ...GEN].map((g) => `<span class="chip ${g == filter ? "on" : ""}" onclick="filter='${g}';render(true)">${g}</span>`).join("")}</div><div class="grid">${L.map(bk).join("") || "<p class='sub'>Nothing found</p>"}</div>`;
};

render();
