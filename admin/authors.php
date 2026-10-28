<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - Authors</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="authors.css">
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
                    <li><a href="authors.php" class="active">Author Database</a></li>
                    <li><a href="digital.php">Digital Publication</a></li>
                    <li><a href="fees.php">Late-fee Structure</a></li>
                    <li><a href="membership.php">Membership Tiers</a></li>
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
                    <h1>Author Database</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div class="card">
                <h3>Author Database</h3>
                <table>
                    <tr>
                        <th>Author</th>
                        <th>Genre</th>
                        <th>Titles Held</th>
                        <th>Rights Status</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                    <tr><td colspan="6">Loading…</td></tr>
                </table>
            </div>
            <div class="card">
                <h3>New Author</h3>
                <div class="row">
                    <div class="box"><label>Name</label><input placeholder="Author name"></div>
                    <div class="box"><label>Genre</label><input placeholder="Primary genre"></div>
                </div><br><button class="btn">Save Author</button>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/authors.js"></script>
</body>

</html>