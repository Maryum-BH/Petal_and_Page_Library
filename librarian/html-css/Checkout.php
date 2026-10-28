<?php require_once __DIR__ . '/../../config/auth.php'; require_login('librarian'); ?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://getbootstrap.com/docs/5.3/assets/css/docs.css" rel="stylesheet">
    <title>Manual Checkout</title>
    <link rel="stylesheet" href="Checkout.css">
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

        <div class="Checkout">
            <img src="../img/Checkout.png" alt="Checkout_icon">
            <p><b>Manual Checkout</b></p>
        </div>

        <div class="checkout-body">
            <!-- Column 1: Find the book -->
            <div class="checkout-col">
                <p class="step-label">1. Find the book</p>
                <input type="text" class="checkout-input" id="bookSearch" placeholder="Search by Title or ID or Author">

                <div class="book-result">
                    <div class="book-cover">
                        <img src="../img/book-03.png" alt="book">
                    </div>
                    <div class="book-info">
                        <h5><b>Shadow Slave</b></h5>
                        <p>By Guiltythree</p>
                        <p class="book-meta">Shelf D-03<br>3 copies available</p>
                    </div>
                </div>
            </div>

            <!-- Column 2: Borrower details -->
            <div class="checkout-col">
                <p class="step-label">2. Borrower Details</p>

                <p class="field-label">Library ID</p>
                <input type="text" class="checkout-input" id="libraryId" placeholder="e.g. LIB-00824">

                <p class="field-label">Borrower Name</p>
                <input type="text" class="checkout-input" id="borrowerName" placeholder="Auto-fills once ID is found">

                <div class="confirm-banner">
                    <span class="check">&#10003;</span>
                    <span>Faija Ahmed Mim &nbsp;---&nbsp; Standard Tier</span>
                </div>
            </div>
        </div>

        <div class="loan-separator"></div>

        <div class="loan-details">
            <p class="step-label">3. Loan Details</p>
            <div class="loan-row">
                <div class="loan-field">
                    <p class="field-label">Date Borrowed</p>
                    <div class="date-input-wrap">
                        <input type="text" class="checkout-input" id="dateBorrowed" value="27/07/2026">
                        <img src="../img/calendar-01.png" alt="calendar">
                    </div>
                </div>
                <div class="loan-field">
                    <p class="field-label">Due Date</p>
                    <div class="date-input-wrap">
                        <input type="text" class="checkout-input" id="dueDate" value="08/08/2026">
                        <img src="../img/calendar-01.png" alt="calendar">
                    </div>
                </div>
                <button type="button" class="confirm-btn">Confirm Checkout</button>
            </div>
            <p class="loan-note">Due date auto-calculates from the borrower's tier — editable if needed</p>
        </div>

    </div>
    <script src="../js/api.js"></script>
    <script src="../js/Checkout.js"></script>
</body>

</html>
