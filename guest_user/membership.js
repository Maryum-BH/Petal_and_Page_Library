/* membership.js  –  page script for "Membership" (loads after core.js) */
V.membership = () => `<h1>Choose your membership</h1><p class="sub">Pick the plan that fits your reading pace</p>
<div class="bill" role="group" aria-label="Billing period"><button class="${bill == "month" ? "on" : ""}" onclick="setBill('month')">Monthly</button><button class="${bill == "year" ? "on" : ""}" onclick="setBill('year')">Yearly</button></div>
<div class="pgrid">${PL.map((p, i) => {
    const c = user && user.plan == i,
        hl = c || (!user && i == 1);
    return `<div class="pcard ${hl ? "hl" : ""}">${!user && i == 1 ? `<span class="ptag">Most popular</span>` : ""}<h3>${p.n}</h3><p class="tg">${p.tag}</p><div class="pr">${priceTxt(p, bill)}</div><p class="sv">${subTxt(p, bill)}</p><ul>${feat(
        p,
    )
        .map((x) => `<li>${TK}${x}</li>`)
        .join(
            "",
        )}</ul><button class="pbtn ${c ? "cur" : ""}" onclick="${c ? "say('This is your current plan')" : `buy(${i})`}">${c ? "Current plan" : user ? "Choose " + p.n : "Sign up to join"}</button></div>`;
}).join("")}</div>`;

render();
