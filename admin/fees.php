<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - Fees</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="fees.css">
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
                    <li><a href="fees.php" class="active">Late-fee Structure</a></li>
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
                    <h1>Late-fee Structure</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div class="row">
                <div class="box">
                    <h3>Physical Books</h3>
                    <table>
                        <tr>
                            <th>Member</th>
                            <th>Fee / Day</th>
                            <th>Maximum</th>
                        </tr>
                        <tr>
                            <td>Basic</td>
                            <td>৳5</td>
                            <td>৳100</td>
                        </tr>
                        <tr>
                            <td>Premium</td>
                            <td>৳3</td>
                            <td>৳80</td>
                        </tr>
                        <tr>
                            <td>VIP</td>
                            <td>৳2</td>
                            <td>৳50</td>
                        </tr>
                    </table>
                </div>
                <div class="box">
                    <h3>Digital Items</h3>
                    <table>
                        <tr>
                            <th>Member</th>
                            <th>Fee / Day</th>
                            <th>Maximum</th>
                        </tr>
                        <tr>
                            <td>Basic</td>
                            <td>৳2</td>
                            <td>৳40</td>
                        </tr>
                        <tr>
                            <td>Premium</td>
                            <td>৳1</td>
                            <td>৳20</td>
                        </tr>
                        <tr>
                            <td>VIP</td>
                            <td>৳0</td>
                            <td>৳0</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="card">
                <h3>Late-Fee Notes</h3>
                <p>Grace period: 1 day for Premium members.</p>
                <p>Rare collection items may have separate rules.</p>
                <p>Fees should be checked before closing a loan.</p>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/fees.js"></script>
</body>

</html>