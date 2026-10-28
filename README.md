# Library Management System — Final PHP Project

This project combines the supplied Admin, Guest + Reader, and Librarian parts with one MySQL database and role-based login.

## Folder layout

- `admin/` — Admin pages and their CSS/JS frontend assets
- `AdminPHP/` — Admin backend endpoint(s)
- `guest_user/` — Guest and Reader pages and their CSS/JS frontend assets
- `UserPHP/` — Shared login, signup, and logout backend endpoints
- `librarian/` — Librarian files kept in their existing structure (`html-css/`, `js/`, `php/`, `img/`)
- `config/` — shared database connection and session/role helpers
- `database.sql` — full database schema, sample data, and fixed demo account password hashes
- `fix_demo_accounts.sql` — small repair script for an already-imported database

Some frontend pages use `.php` rather than `.html` because they need server-side session and role checks. Their CSS and JavaScript remain alongside the pages; the login/signup/logout and admin reset backend logic is in the separate `UserPHP/` and `AdminPHP/` folders.

## Demo accounts

| Role | Email | Password | Redirect destination |
|---|---|---|---|
| Admin | `himel@gmail.com` | `565656` | Admin dashboard |
| Librarian | `maryum@gmail.com` | `123456` | Librarian dashboard |
| Reader | `faija@gmail.com` | `123456` | Reader dashboard |

New registrations are created with the `reader` role only.

## Fresh installation in XAMPP

1. Extract this folder into `C:\xampp\htdocs\library_management_system_final\`.
2. Start **Apache** and **MySQL** in XAMPP.
3. Open phpMyAdmin and import `database.sql`.
4. Visit `http://localhost/library_management_system_final/`.
5. Open the login modal from the Guest page and use one of the demo accounts above.

`database.sql` recreates the `library_db` database, so importing it replaces an existing database of the same name. Back up any data you need first.

## If you already imported the old database

Do **not** re-import `database.sql` if you need to preserve existing data. Instead, select/import `fix_demo_accounts.sql` in phpMyAdmin. It repairs the three demo account roles, active status, email addresses, and password hashes.

## Database connection

Default XAMPP settings are configured in `config/db.php` and `librarian/php/db.php`:
- Host: `localhost`
- Database: `library_db`
- Username: `root`
- Password: empty

Update both files if your MySQL credentials differ.

## Authentication details

- Login accepts JSON requests from the supplied frontend and regular form POSTs.
- Email matching is case-insensitive and ignores accidental surrounding spaces.
- Passwords use PHP's `password_hash()` / `password_verify()` format.
- Admin, Librarian, and Reader pages have server-side role checks.
- The Guest page is the public entry point.
