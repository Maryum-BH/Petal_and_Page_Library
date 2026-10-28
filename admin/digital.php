<?php require_once __DIR__ . '/../config/auth.php'; require_login('admin'); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athenaeum - Digital</title>
    <link rel="stylesheet" href="ui.css">
    <link rel="stylesheet" href="digital.css">
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
                    <li><a href="digital.php" class="active">Digital Publication</a></li>
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
                    <h1>Digital Publication</h1>
                    <p class="desc">Simple admin page for managing the library.</p>
                </div>
                <input class="search" type="text" placeholder="Search">
            </div>
            <div class="row">
                <div class="box coral">
                    <p>Storage Used</p>
                    <h2>4.2 TB</h2>
                    <p>68% of 6.2 TB</p>
                    <div class="progress">
                        <div class="progress_bar"></div>
                    </div>
                </div>
                <div class="box cyan">
                    <p>Digital Titles</p>
                    <h2>9,410</h2>
                    <p>214 added this month</p>
                </div>
                <div class="box pink">
                    <p>Pending Processing</p>
                    <h2>37</h2>
                    <p>Need review</p>
                </div>
            </div>
            <div class="card">
                <h3>Digital Publications</h3>
                <table>
                    <tr>
                        <th>Publication</th>
                        <th>Format</th>
                        <th>Size</th>
                        <th>Status</th>
                    </tr>
                    <tr>
                        <td>Coastal Ecologies, Vol. 3</td>
                        <td>PDF</td>
                        <td>86 MB</td>
                        <td>Ready</td>
                    </tr>
                    <tr>
                        <td>The Long Monsoon</td>
                        <td>EPUB</td>
                        <td>12 MB</td>
                        <td>Ready</td>
                    </tr>
                    <tr>
                        <td>Quarterly Review - Q2</td>
                        <td>PDF</td>
                        <td>120 MB</td>
                        <td>Processing</td>
                    </tr>
                    <tr>
                        <td>Field Notes: Sundarbans</td>
                        <td>PDF</td>
                        <td>65 MB</td>
                        <td>Ready</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <script src="js/common.js"></script>
    <script src="js/digital.js"></script>
</body>

</html>