<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <title>Petal &amp; Page — About</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="base.css">
    <link rel="stylesheet" href="about.css">
</head>

<body data-page="about">
    <!-- Floating flowers -->
    <span class="fl" style="top:12%;left:2%">🌸</span>
    <span class="fl" style="top:42%;right:2%;animation-delay:2s">🌷</span>
    <span class="fl" style="top:78%;left:5%;animation-delay:4s">🌼</span>
    <span class="fl" style="top:18%;right:10%;animation-delay:1s">🦋</span>

    <header>
        <!-- Brand -->
        <div class="brand" onclick="go(user?'dashboard':'home')">📖 Petal &amp; Page</div>
        <!-- Menu links (filled by core.js) -->
        <nav id="nav"></nav>
        <!-- Header buttons (filled by core.js) -->
        <div id="hr" style="display:flex;gap:8px;align-items:center"></div>
    </header>

    <!-- Page content (filled by about.js) -->
    <main id="app"></main>

    <!-- Login / sign up / reserve popup -->
    <div class="modal" id="auth">
        <div class="card" id="authBox"></div>
    </div>

    <script src="core.js"></script>
    <script src="about.js"></script>
</body>

</html>
