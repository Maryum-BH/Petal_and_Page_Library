<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - Membership Tiers</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="membership.css">
</head>

<body>
    <div class="container">
        <div class="left">
            <div class="logo">A</div>
            <div class="site-name">Athenaeum</div>
            <div class="admin">Library Admin</div>
            <div class="lists">
                <ul class="navlist">
                    <li><a href="index.php">Overview</a></li>
                    <li><a href="catalogue.php">Catalogue and Categories</a></li>
                    <li><a href="authors.php">Author Database</a></li>
                    <li><a href="digital.php">Digital Publication</a></li>
                    <li><a href="fees.php">Late-fee Structure</a></li>
                    <li><a href="membership.php" class="active">Membership Tiers</a></li>
                    <li><a href="metrics.php">Check-Out Metrics</a></li>
                    <li><a href="profile.php">My Profile</a></li>
                    <li><a href="../logout.php" onclick="try{localStorage.removeItem('pp2_user')}catch(e){}">Log out</a></li>
                </ul>
                <div class="userbox">
                    <p>R. Sharma</p>
                    <p>Head Librarian</p>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="top">
                <div>
                    <p class="small">Library Management System</p>
                    <h1>Membership Tiers</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div id="chooser">
                <div class="card">
                    <h3>Choose a billing period</h3>
                    <p class="desc">Select Monthly or Yearly to view and edit that set of membership tiers.</p>
                    <div class="row">
                        <div class="box pick" data-period="monthly">
                            <h3>Monthly</h3>
                            <p class="pick-info"></p>
                            <button class="btn">Open Monthly Plans</button>
                        </div>
                        <div class="box pick" data-period="yearly">
                            <h3>Yearly</h3>
                            <p class="pick-info"></p>
                            <button class="btn">Open Yearly Plans</button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="plans" hidden>
                <div class="plans-bar">
                    <button class="ui-btn ghost" id="back">&larr; Change billing period</button>
                    <h2 id="plans-title"></h2>
                </div>
                <div class="row" id="tiers"></div>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/membership.js"></script>
</body>

</html>