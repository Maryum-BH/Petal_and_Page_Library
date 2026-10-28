<?php require_once __DIR__ . '/../../config/auth.php'; require_login('librarian'); ?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/5.3/assets/css/docs.css" rel="stylesheet">
    <title>Reservation</title>
    <link rel="stylesheet" href="Reservations.css">
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</head>

<body class="p-3 m-0 border-0 bd-example dashboard_page">
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

            <div class="card" style="width: 15rem;">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-body-secondary">Reserved</h6>
                    <h1 class="card-title" >&ndash;</h1>
                </div>
            </div>
        
            <div class="card" style="width: 15rem;">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-body-secondary">Picked Up Today</h6>
                    <h1 class="card-title">&ndash;</h1>
                </div>
            </div>
        
            <div class="card" style="width: 15rem;">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-body-secondary">Expiring Soon</h6>
                    <h1 class="card-title" style="color: rgb(180, 8, 8);">&ndash;</h1>
                </div>
            </div>

        </div>
        <div class="Res">
            <div class="left" style="display: flex;">
                <img src="../img/Reservations.png" alt="res_icon">
                <p class="Res_queue"><b>Reservation queue</b></p>
            </div>
            <div class="ledger-tools">
                <input type="text" placeholder="Search by Title or Reader">
                <button type="button">Search</button>
            </div>
        </div>

        <div class="browse_ledger">
            <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="Book_name">Book Name</th>
                    <th scope="col" class="reader">Reader</th>
                    <th scope="col" class="deadline">Deadline</th>
                    <th scope="col" class="status-column">Status</th>
                    <th scope="col" class="action">Action</th>
                  </tr>
                </thead>
                <tbody class="table-group-divider">
                  <tr><td colspan="5" class="text-muted py-4">Loading&hellip;</td></tr>
                </tbody>
              </table>

        </div>
       
    </div>
    <script src="../js/api.js"></script>
    <script src="../js/Reservations.js"></script>
</body>

</html>