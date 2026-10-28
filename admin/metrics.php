<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - Metrics</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="metrics.css">
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
                    <li><a href="metrics.php" class="active">Check-Out Metrics</a></li>
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
                    <h1>Check-Out Metrics</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div class="row">
                <div class="box blue" data-kpi="peak_hour">
                    <p>Peak Check-Out Hour</p>
                    <h2>&ndash;</h2>
                    <p>&nbsp;</p>
                </div>
                <div class="box cyan" data-kpi="busiest_category">
                    <p>Busiest Category</p>
                    <h2>&ndash;</h2>
                    <p>&nbsp;</p>
                </div>
                <div class="box pink" data-kpi="storage">
                    <p>Digital Storage Used</p>
                    <h2>&ndash;</h2>
                    <p>&nbsp;</p>
                </div>
            </div>
            <div class="card">
                <h3>Check-Outs by Hour of Day</h3>
                <div class="barbox" id="hourBars"></div>
                <div class="times">
                
                    <span>6a</span>
                    <span>7a</span>
                    <span>8a</span>
                    <span>9a</span>
                    <span>10a</span>
                    <span>11a</span>
                    <span>12p</span>
                    <span>1p</span>
                    <span>2p</span>
                    <span>3p</span>
                    <span>4p</span>
                    <span>5p</span>
                    <span>6p</span>
                    <span>7p</span>
                    <span>8p</span>
                    <span>9p</span>
                    <span>10p</span>
                    <span>11p</span>
                
                </div>
            </div>
            <div class="row">
                <div class="box">
                    <h3>Weekly Digital Session Load</h3>
                    <div class="barbox" id="weekBars"></div>
                    <div class="days">
                       <span>Mon</span>
                       <span>Tue</span>
                       <span>Wed</span>
                       <span>Thu</span>
                       <span>Fri</span>
                       <span>Sat</span>
                       <span>Sun</span>      
                    </div>
                </div>
                <div class="box">
                    <h3>High-Demand Resources</h3>
                    <table id="demandTable">
                        <tr>
                            <th>Title</th>
                            <th>Waitlist</th>
                            <th>Avg Wait</th>
                        </tr>
                        <tr class="loading-row"><td colspan="3">Loading&hellip;</td></tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/metrics.js"></script>
</body>

</html>