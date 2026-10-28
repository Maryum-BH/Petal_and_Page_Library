PETAL & PAGE – how to open
==========================
1. Unzip, then open the folder in VS Code:  File > Open Folder... > petal-and-page
2. Double-click  index.html  (or right-click > Open with Chrome/Safari).
   VS Code only shows the code; the browser shows the website.
   (Optional: install the "Live Server" extension, right-click index.html > Open with Live Server.)

ALL FILES MUST STAY IN THE SAME FOLDER (no subfolders)

Every page = 1 HTML + 1 CSS + 1 JS
----------------------------------
page             html                 css                    js
Home (guest)     index.html           index.css          js/index.js
Browse           browse.html          browse.css         js/browse.js
Book details     book.html?id=0       book.css           js/book.js
Membership       membership.html      membership.css     js/membership.js
About            about.html           about.css          js/about.js
Dashboard        dashboard.html       dashboard.css      js/dashboard.js
Study Zone       study.html           study.css          js/study.js
Reservations     reservation.html     reservation.css    js/reservation.js
VIP Appointments appointments.html    appointments.css   js/appointments.js
Lend & Trade     lend-trade.html      lend-trade.css     js/lend-trade.js
Profile          profile.html         profile.css        js/profile.js

Shared by all pages:  base.css  and  core.js
(colours, header, sidebar, cards, book covers, avatars, icons, login, plans, reviews data)

Notes
- Login / plans / reservations are saved in the browser (localStorage) – a front-end demo, no server.
- Needs internet for Google Fonts and the free-book links.
