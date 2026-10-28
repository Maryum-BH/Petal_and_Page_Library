<?php require_once __DIR__ . '/../../config/auth.php'; require_login('librarian'); ?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/5.3/assets/css/docs.css" rel="stylesheet">
    <title>Inventory</title>
    <link rel="stylesheet" href="Inventory.css">
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

        <div class="inv">
            <img src="../img/Inventory.png" alt="inv_icon">
            <p class="a"><b>Inventory</b></p>
        </div>

        <div class="filter">
            <input type="text" placeholder="Search Title or ID or Author">

            <div class="dropdown">
                <button class="filter-btn" type="button" data-bs-toggle="dropdown">
                    All Categories
                </button>
                <ul class="dropdown-menu filter-menu">
                    <li><a class="dropdown-item" href="#">All Categories</a></li>
                    <li><a class="dropdown-item" href="#">Programming</a></li>
                    <li><a class="dropdown-item" href="#">Mathematics</a></li>
                    <li><a class="dropdown-item" href="#">Science</a></li>
                    <li><a class="dropdown-item" href="#">Fiction</a></li>
                </ul>
            </div>

            <div class="dropdown">
                <button class="filter-btn" type="button" data-bs-toggle="dropdown">
                    All Status
                </button>
                <ul class="dropdown-menu filter-menu">
                    <li><a class="dropdown-item" href="#">All Status</a></li>
                    <li><a class="dropdown-item" href="#">Available</a></li>
                    <li><a class="dropdown-item" href="#">Low stock</a></li>
                    <li><a class="dropdown-item" href="#">Out of stock</a></li>
                </ul>
            </div>
        </div>

        <div class="browse_ledger">
            <table class="table">
                <thead>
                  <tr>
                    <th scope="col" class="book-id">Book ID</th>
                    <th scope="col" class="book-name">Book Name</th>
                    <th scope="col" class="author">Author</th>
                    <th scope="col" class="copies-col">Available</th>
                    <th scope="col" class="shelf-col">Shelf</th>
                    <th scope="col" class="status-col">Status</th>
                  </tr>
                </thead>
                <tbody class="table-group-divider">
                  <tr><td colspan="6" class="text-muted py-4">Loading&hellip;</td></tr>
                </tbody>
              </table>
        </div>

        <p class="inv-note">Changes to copies or shelf save automatically</p>

    </div>
    <script src="../js/api.js"></script>
    <script src="../js/Inventory.js"></script>
</body>

</html>
