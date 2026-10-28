<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - Catalogue</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="catalogue.css">
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
                    <li><a href="catalogue.php" class="active">Catalogue and Categories</a></li>
                    <li><a href="authors.php">Author Database</a></li>
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
                    <h1>Catalogue and Categories</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div class="row">
                <div class="box">
                    <h3>Active Categories</h3>
                    <ul class="simple"><li>Loading…</li></ul>
                </div>
                <div class="box">
                    <h3>Add a Category</h3>
                    <label>Category name</label>
                    <input placeholder="e.g. Graphic Novels">
                    <label>Parent classification</label>
                    <select><option value="">None</option></select><br><br>
                    <button>Add Category</button>
                </div>
            </div>
            <div class="card">
                <h3>Catalogue Detail</h3>
                <table>
                    <tr>
                        <th>Category</th>
                        <th>Titles</th>
                        <th>Physical</th>
                        <th>Digital</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    <tr><td colspan="6">Loading…</td></tr>
                </table>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/catalogue.js"></script>
</body>

</html>