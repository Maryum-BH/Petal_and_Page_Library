<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - My Profile</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="profile.css">
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
                    <li><a href="membership.php">Membership Tiers</a></li>
                    <li><a href="metrics.php">Check-Out Metrics</a></li>
                    <li><a href="profile.php" class="active">My Profile</a></li>
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
                    <h1>My Profile</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div class="row">
                <div class="box profile-card">
                    <div class="avatar" id="avatar">RS</div>
                    <h2 id="p-name"></h2>
                    <p id="p-role"></p>
                    <p class="muted" id="p-joined"></p>
                </div>
                <div class="box wide">
                    <h3>Personal Details</h3>
                    <div class="grid">
                        <div><label>Full name</label><input id="f-name"></div>
                        <div><label>Role</label><input id="f-role"></div>
                        <div><label>Email</label><input id="f-email" type="email"></div>
                        <div><label>Phone</label><input id="f-phone"></div>
                    </div><br>
                    <button id="save-profile">Save Changes</button>
                </div>
            </div>
            <div class="row">
                <div class="box">
                    <h3>Change Password</h3>
                    <label>Current password</label><input id="pw-old" type="password">
                    <label>New password (min 8 characters)</label><input id="pw-new" type="password">
                    <label>Confirm new password</label><input id="pw-conf" type="password"><br><br>
                    <button id="save-pw">Update Password</button>
                </div>
                <div class="box wide">
                    <h3>My Recent Activity</h3>
                    <table id="my-activity"></table>
                </div>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/profile.js"></script>
</body>

</html>