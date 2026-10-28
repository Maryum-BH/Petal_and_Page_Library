<?php require_once __DIR__ . '/../../config/auth.php'; require_login('librarian'); ?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/5.3/assets/css/docs.css" rel="stylesheet">
    <title>Dashboard</title>
    <link rel="stylesheet" href="Fines.css">
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</head>

<body class="p-3 m-0 border-0 bd-example m-0 border-0 dashboard_page">
    <div class="container">
        <nav class="navbar my-navbar">
            <div class="container-fluid">
                <a class="navbar-brand d-flex align-items-center gap-2" href="Dashboard.php">
                    <img class="image" src="../img/library_icon_a.png" alt="Library Logo" width="60" height="50">
                    <p class="Library"><b>Library</b></p>
                </a>
                <div class="d-flex align-items-center gap-3">
                    <!-- MM -->
                    <div class="dropdown">
                        <button class="navbar-toggler bt_style" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <b>MM</b>
                        </button>

                        <ul class="dropdown-menu dropdown-menu-end nav-menu">
                            <li><a class="dropdown-item" href="../../logout.php">
                                <img src="../img/Logout.png" alt="">
                                Logout</a></li>
                        </ul>
                    </div>
                    <!-- Hamburger -->
                    <div class="dropdown">
                        <button class="navbar-toggler bt_style" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="navbar-toggler-icon"></span>
                        </button>

                        <ul class="dropdown-menu dropdown-menu-end nav-menu">
                            <li><a class="dropdown-item" href="Dashboard.php">
                                <img src="../img/dashboard-square.png" alt="">
                                Dashboard</a></li>
                            <li><a class="dropdown-item" href="Inventory.php">
                                <img src="../img/Inventory.png" alt="">
                                Inventory</a></li>
                            <li><a class="dropdown-item" href="Reservations.php">
                                <img src="../img/Reservations.png" alt="">
                                Reservations</a></li>
                            <li><a class="dropdown-item" href="Checkout.php">
                                <img src="../img/Checkout.png" alt="">
                                Checkout</a></li>
                            <li><a class="dropdown-item" href="Return.php">
                                <img src="../img/Return.png" alt="">
                                Returns</a></li>
                            <li><a class="dropdown-item" href="Fines.php">
                                <img src="../img/Fines.png" alt="">
                                Fines</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
        <div class="separator"></div>
    
        <div class="d-flex gap-4">

            <div class="card" style="width: 18rem; background-color: rgba(245, 0, 0, 0.084);">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-body-secondary">Total Fines</h6>
                    <h1 class="card-title" style="color: rgb(207, 13, 13);" >&ndash;</h1>
                </div>
            </div>
        
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-body-secondary">Borrowers With Fines</h6>
                    <h1 class="card-title">&ndash;</h1>
                </div>
            </div>
        
            <div class="card" style="width: 18rem; background-color: rgba(22, 235, 22, 0.163);">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-body-secondary">Cleared This Week</h6>
                    <h1 class="card-title" style="color: green;">&ndash;</h1>
                </div>
            </div>

        </div>
        <div class="Finess">
            <div class="left" style="display: flex;">
                <img src="../img/Fines.png" alt="Fine_icon">
                <p class="Fine_ledger"><b>Fines ledger</b></p>
            </div>
            <div class="ledger-tools">
                <input type="text" placeholder="Search by Borrower">
            
                <button type="button">
                    <img src="../img/download.png" alt="download">
                    Download PDF
                </button>
            </div>
        </div>

        <div class="browse_ledger">
            <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="borrower">Borrower</th>
                    <th scope="col" class="book">Book</th>
                    <th scope="col" class="days">Days late</th>
                    <th scope="col" class="fine">Fine</th>
                    <th scope="col" class="status-column">Status</th>
                    <th scope="col" class="action">Action</th>
                  </tr>
                </thead>
                <tbody class="table-group-divider">
                  <tr><td colspan="6" class="text-muted py-4">Loading&hellip;</td></tr>
                </tbody>
              </table>

        </div>
       
    </div>
    <script src="../js/api.js"></script>
    <script src="../js/Fines.js"></script>
</body>

</html>