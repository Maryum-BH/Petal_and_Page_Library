<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - Overview</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="index.css">
</head>

<body>
    <div class="container">
        <div class="left">
            <div class="logo">A</div>
            <div class="site-name">Athenaeum</div>
            <div class="admin">Library Admin</div>
            <div class="lists">
                <ul class="navlist">
                    <li><a href="index.php" class="active">Overview</a></li>
                    <li><a href="catalogue.php">Catalogue and Categories</a></li>
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
                    <h1>System Overview</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div class="row">
                <div class="box coral" data-kpi="active_readers">
                    <p>Active Readers Today</p>
                    <h2>&ndash;</h2>
                    <p>&nbsp;</p>
                </div>
                <div class="box cyan" data-kpi="checkouts_month">
                    <p>Check-Outs This Month</p>
                    <h2>&ndash;</h2>
                    <p>&nbsp;</p>
                </div>
                <div class="box pink" data-kpi="overdue">
                    <p>Overdue Items</p>
                    <h2>&ndash;</h2>
                    <p>&nbsp;</p>
                </div>
                <div class="box yellow" data-kpi="digital_sessions">
                    <p>Digital Sessions</p>
                    <h2>&ndash;</h2>
                    <p>&nbsp;</p>
                </div>
            </div>
            <div class="row">
                <div class="box">
                    <h3>Circulation, last 14 days</h3>
                    <div class="barbox" id="circBars"></div>
                   
                    <div class="dates" id="circDates"></div>
                </div>
                <div class="box">
                    <h3>Demand by Category</h3>
                    <div id="catList"><p>Loading&hellip;</p></div>
                </div>
            </div>
            <div class="card">
                <h3>Recent Staff Activity</h3>
                <table id="activityTable">
                    <tr>
                        <th>Action</th>
                        <th>Item</th>
                        <th>By</th>
                        <th>When</th>
                    </tr>
                    <tr class="loading-row"><td colspan="4">Loading&hellip;</td></tr>
                </table>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/index.js"></script>
</body>

</html>