/* ============================================================================
   LIBRARY MANAGEMENT SYSTEM  -  ONE DATABASE FOR ALL THREE PARTS
   ----------------------------------------------------------------------------
   Admin pages ("Athenaeum")  +  Librarian pages  +  Guest / Reader pages ("Petal & Page")

   Engine : MySQL 8.0.16+  or  MariaDB 10.5+   (XAMPP / WAMP / phpMyAdmin all work)
   Charset: utf8mb4  (needed for the Taka sign and the en-dash in time slots)

   HOW TO USE
     1. Import this whole file once (phpMyAdmin > Import, or:  mysql -u root -p < library_db.sql)
        It drops and recreates the database `library_db`, then loads the demo data.
     2. The backend connects to `library_db`. Pages read from the VIEWS (v_*) where one exists.
     3. ADMIN ONLY - reset demo data any time:   CALL sp_reset_demo_data(<admin user_id>);
        Any non-admin id is rejected with an error.

   DEMO LOGINS  (redirect is decided by users.role)
     role        email                          password
     admin       himel@gmail.com                565656          -> Admin pages
     librarian   maryum@gmail.com              123456          -> Librarian pages
     reader      faija@gmail.com               123456          (Basic) -> Reader pages
     reader      sarah@petalpage.lib            Reader@123      (Premium)
     reader      ananya@petalpage.lib           Reader@123      (VIP: appointments unlocked)
     (all other readers also use Reader@123)

   PASSWORD FORMAT: pbkdf2_sha256$iterations$salt$base64(hash)  (Django-style, SHA-256, 260000 rounds)
     PHP : base64_encode(hash_pbkdf2('sha256', $pw, $salt, $iter, 32, true))
     Node: crypto.pbkdf2Sync(pw, salt, iter, 32, 'sha256').toString('base64')
     Python: base64.b64encode(hashlib.pbkdf2_hmac('sha256', pw.encode(), salt.encode(), iter))
   Never store plain passwords. Use the same format (or switch to bcrypt) when users sign up.

   WHO MAY CHANGE WHAT  (see table `permissions`, enforce it in the backend)
     Admin     : master data (categories, authors, titles, digital publications, tiers, late-fee rules,
                 users, settings) + RESET of demo data. Read-only on day-to-day circulation.
     Librarian : daily circulation (checkout, return, reservations, fines) + inventory (copies, shelf).
                 Cannot edit master data or reset anything.
     Reader    : own reservations, appointments, wishlist, reviews, reading log, profile.
     Guest     : read-only on books / categories / authors / membership plans (no login, no DB write).

   KEY DESIGN RULES (what keeps the three parts consistent)
     * ONE `users` table (admin / librarian / reader) - the same Library ID (LIB-xxxxx) is used by the
       Librarian lookup, the Reader member card and every fine / loan / reservation.
     * ONE `books` table. Physical copies live in `book_copies`, digital files / free links in
       `digital_editions`. Guest Browse, Librarian Inventory and Admin Catalogue all read the same rows.
     * Availability, overdue, stock status, titles-held, category counts are DERIVED by views, never typed
       in twice, so they cannot drift apart between pages.
     * Late fees: ONE rule table (`late_fee_rules` + `membership_plans.late_fee_grace_days`) used by the
       Admin calculator, the Librarian return page and the Reader fines (see fn_late_fee / v_active_loans).
     * All money is BDT (৳).
   ============================================================================ */

SET NAMES utf8mb4;
DROP DATABASE IF EXISTS library_db;
CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- 1. MEMBERSHIP (edited by Admin -> Membership Tiers / Late-fee Structure)
-- ---------------------------------------------------------------------------
CREATE TABLE membership_plans (
  plan_id               TINYINT UNSIGNED NOT NULL,
  name                  VARCHAR(30)  NOT NULL,
  tagline               VARCHAR(120) NOT NULL,
  physical_loan_limit   SMALLINT UNSIGNED NOT NULL,
  digital_loan_limit    SMALLINT UNSIGNED NULL,
  hold_limit            SMALLINT UNSIGNED NOT NULL,
  reading_room_access   VARCHAR(60)  NOT NULL,
  loan_period_days      SMALLINT UNSIGNED NOT NULL,
  digital_loan_days     SMALLINT UNSIGNED NOT NULL,
  late_fee_grace_days   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  vip_appointments      BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (plan_id),
  UNIQUE KEY uq_plan_name (name)
) ENGINE=InnoDB COMMENT='Basic / Premium / VIP. plan_id order = rank. NULL digital_loan_limit = unlimited';

CREATE TABLE plan_prices (
  plan_id         TINYINT UNSIGNED NOT NULL,
  billing_period  ENUM('monthly','yearly') NOT NULL,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0,
  note            VARCHAR(80) NULL,
  PRIMARY KEY (plan_id, billing_period),
  CONSTRAINT fk_pp_plan FOREIGN KEY (plan_id) REFERENCES membership_plans (plan_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE plan_features (
  feature_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_id       TINYINT UNSIGNED NOT NULL,
  sort_order    TINYINT UNSIGNED NOT NULL,
  feature_text  VARCHAR(120) NOT NULL,
  PRIMARY KEY (feature_id),
  UNIQUE KEY uq_plan_feature_order (plan_id, sort_order),
  CONSTRAINT fk_pf_plan FOREIGN KEY (plan_id) REFERENCES membership_plans (plan_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Bullet list shown on the Membership pages (admin edits one feature per line)';

CREATE TABLE study_themes (
  theme_key     VARCHAR(20) NOT NULL,
  name          VARCHAR(60) NOT NULL,
  min_plan_id   TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (theme_key),
  CONSTRAINT fk_st_plan FOREIGN KEY (min_plan_id) REFERENCES membership_plans (plan_id)
) ENGINE=InnoDB;

CREATE TABLE late_fee_rules (
  rule_id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_id      TINYINT UNSIGNED NOT NULL,
  item_type    ENUM('physical','digital') NOT NULL,
  fee_per_day  DECIMAL(8,2) NOT NULL,
  max_fee      DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (rule_id),
  UNIQUE KEY uq_fee_rule (plan_id, item_type),
  CONSTRAINT fk_lf_plan FOREIGN KEY (plan_id) REFERENCES membership_plans (plan_id) ON DELETE CASCADE,
  CONSTRAINT ck_lf_nonneg CHECK (fee_per_day >= 0 AND max_fee >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 2. USERS  (ONE table for admin, librarian and reader -> role decides the redirect)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  user_id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  library_id       VARCHAR(20)  NOT NULL,
  role             ENUM('admin','librarian','reader') NOT NULL DEFAULT 'reader',
  full_name        VARCHAR(100) NOT NULL,
  nickname         VARCHAR(40)  NOT NULL,
  username         VARCHAR(40)  NOT NULL,
  email            VARCHAR(150) NOT NULL,
  phone            VARCHAR(30)  NULL,
  password_hash    VARCHAR(255) NOT NULL,
  job_title        VARCHAR(60)  NULL,
  avatar_key       VARCHAR(20)  NOT NULL DEFAULT 'tabby',
  avatar_url       VARCHAR(255) NULL,
  plan_id          TINYINT UNSIGNED NULL,
  billing_period   ENUM('monthly','yearly') NULL,
  plan_expires_on  DATE NULL,
  account_status   ENUM('active','suspended','closed') NOT NULL DEFAULT 'active',
  joined_on        DATE NOT NULL,
  last_login_at    DATETIME NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_library_id (library_id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_role (role),
  CONSTRAINT fk_users_plan FOREIGN KEY (plan_id) REFERENCES membership_plans (plan_id),
  CONSTRAINT ck_reader_has_plan CHECK (role <> 'reader' OR plan_id IS NOT NULL)
) ENGINE=InnoDB COMMENT='Login = email + password_hash; role = admin | librarian | reader';

CREATE TABLE membership_purchases (
  purchase_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  plan_id         TINYINT UNSIGNED NOT NULL,
  billing_period  ENUM('monthly','yearly') NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  payment_method  VARCHAR(30) NOT NULL DEFAULT 'demo',
  purchased_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (purchase_id),
  KEY ix_mp_user (user_id),
  CONSTRAINT fk_mpu_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_mpu_plan FOREIGN KEY (plan_id) REFERENCES membership_plans (plan_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- 3. CATALOGUE  (one master list of titles; physical copies + digital editions hang off it)
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  category_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                VARCHAR(80) NOT NULL,
  parent_category_id  INT UNSIGNED NULL,
  is_active           BOOLEAN NOT NULL DEFAULT 1,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name (name),
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_category_id) REFERENCES categories (category_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Up to 3 levels (e.g. Fiction > Graphic Novels > Manga)';

CREATE TABLE authors (
  author_id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,
  primary_genre  VARCHAR(60)  NOT NULL,
  rights_status  ENUM('Cleared','Pending Review','Public Domain') NOT NULL DEFAULT 'Pending Review',
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (author_id),
  UNIQUE KEY uq_author_name (name)
) ENGINE=InnoDB COMMENT='Titles Held is NOT stored - see v_author_stats';

CREATE TABLE books (
  book_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_code       VARCHAR(20)  NOT NULL,
  title           VARCHAR(200) NOT NULL,
  category_id     INT UNSIGNED NOT NULL,
  description     TEXT NULL,
  page_count      INT UNSIGNED NULL,
  language        VARCHAR(30) NOT NULL DEFAULT 'English',
  access_level    ENUM('standard','rare') NOT NULL DEFAULT 'standard',
  cover_color_1   CHAR(7) NOT NULL DEFAULT '#ffd6e4',
  cover_color_2   CHAR(7) NOT NULL DEFAULT '#f7a1c4',
  cover_image_url VARCHAR(255) NULL,
  is_active       BOOLEAN NOT NULL DEFAULT 1,
  created_by      INT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (book_id),
  UNIQUE KEY uq_book_code (book_code),
  KEY ix_books_title (title),
  KEY ix_books_category (category_id),
  CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories (category_id),
  CONSTRAINT fk_books_creator FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='A title. Physical copies -> book_copies, digital versions -> digital_editions';

CREATE TABLE book_authors (
  book_id    INT UNSIGNED NOT NULL,
  author_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (book_id, author_id),
  KEY ix_ba_author (author_id),
  CONSTRAINT fk_ba_book   FOREIGN KEY (book_id)   REFERENCES books (book_id)     ON DELETE CASCADE,
  CONSTRAINT fk_ba_author FOREIGN KEY (author_id) REFERENCES authors (author_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE book_tags (
  book_id  INT UNSIGNED NOT NULL,
  tag      VARCHAR(40)  NOT NULL,
  PRIMARY KEY (book_id, tag),
  CONSTRAINT fk_bt_book FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE book_copies (
  copy_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id         INT UNSIGNED NOT NULL,
  copy_no         SMALLINT UNSIGNED NOT NULL,
  barcode         VARCHAR(40) NOT NULL,
  shelf_location  VARCHAR(20) NOT NULL,
  book_condition  ENUM('excellent','good','damaged') NOT NULL DEFAULT 'good',
  status          ENUM('in_service','lost','damaged','withdrawn') NOT NULL DEFAULT 'in_service',
  acquired_on     DATE NULL,
  PRIMARY KEY (copy_id),
  UNIQUE KEY uq_copy_barcode (barcode),
  UNIQUE KEY uq_copy_no (book_id, copy_no),
  KEY ix_copy_shelf (shelf_location),
  CONSTRAINT fk_copy_book FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Physical copies. On-loan / reserved is DERIVED from loans + reservations (no duplicate flag)';

CREATE TABLE digital_editions (
  edition_id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id                  INT UNSIGNED NOT NULL,
  format                   ENUM('PDF','EPUB','MP3','MOBI','WEB') NOT NULL,
  hosting                  ENUM('hosted','external') NOT NULL DEFAULT 'hosted',
  file_size_mb             DECIMAL(8,1) NULL,
  status                   ENUM('Processing','Ready') NOT NULL DEFAULT 'Processing',
  file_path                VARCHAR(255) NULL,
  external_url             VARCHAR(500) NULL,
  source_name              VARCHAR(60)  NULL,
  max_concurrent_licenses  INT UNSIGNED NULL,
  uploaded_by              INT UNSIGNED NULL,
  uploaded_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (edition_id),
  UNIQUE KEY uq_edition (book_id, format),
  CONSTRAINT fk_de_book     FOREIGN KEY (book_id)     REFERENCES books (book_id) ON DELETE CASCADE,
  CONSTRAINT fk_de_uploader FOREIGN KEY (uploaded_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='hosted = file stored by the library (Admin > Digital Publication); external = free link (Gutenberg / MANGA Plus / WEBTOON)';

-- ---------------------------------------------------------------------------
-- 4. READER PREFERENCES
-- ---------------------------------------------------------------------------
CREATE TABLE user_preferences (
  user_id          INT UNSIGNED NOT NULL,
  ui_theme         ENUM('light','dark') NOT NULL DEFAULT 'light',
  click_sound      BOOLEAN NOT NULL DEFAULT 1,
  study_theme_key  VARCHAR(20) NOT NULL DEFAULT 'pink',
  current_book_id  INT UNSIGNED NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_up_user  FOREIGN KEY (user_id)         REFERENCES users (user_id)         ON DELETE CASCADE,
  CONSTRAINT fk_up_theme FOREIGN KEY (study_theme_key) REFERENCES study_themes (theme_key),
  CONSTRAINT fk_up_book  FOREIGN KEY (current_book_id) REFERENCES books (book_id)         ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE time_slots (
  slot_id     TINYINT UNSIGNED NOT NULL,
  label       VARCHAR(20) NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  PRIMARY KEY (slot_id)
) ENGINE=InnoDB COMMENT='Fixed slots used by reservations and VIP appointments';

-- ---------------------------------------------------------------------------
-- 5. CIRCULATION  (written by Librarian + Reader, read by everyone)
-- ---------------------------------------------------------------------------
CREATE TABLE reservations (
  reservation_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  book_id         INT UNSIGNED NOT NULL,
  copy_id         INT UNSIGNED NULL,
  edition_id      INT UNSIGNED NULL,
  mode            ENUM('read_in_library','borrow_pickup','queue') NOT NULL,
  status          ENUM('reserved','queued','picked_up','expired','shelved','cancelled','completed') NOT NULL DEFAULT 'reserved',
  slot_date       DATE NULL,
  slot_id         TINYINT UNSIGNED NULL,
  desk_label      VARCHAR(30) NULL,
  queue_position  SMALLINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at      DATETIME NULL,
  picked_up_at    DATETIME NULL,
  handled_by      INT UNSIGNED NULL,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reservation_id),
  KEY ix_res_user (user_id),
  KEY ix_res_book_status (book_id, status),
  KEY ix_res_expires (expires_at),
  CONSTRAINT fk_res_user    FOREIGN KEY (user_id)    REFERENCES users (user_id),
  CONSTRAINT fk_res_book    FOREIGN KEY (book_id)    REFERENCES books (book_id),
  CONSTRAINT fk_res_copy    FOREIGN KEY (copy_id)    REFERENCES book_copies (copy_id) ON DELETE SET NULL,
  CONSTRAINT fk_res_edition FOREIGN KEY (edition_id) REFERENCES digital_editions (edition_id) ON DELETE SET NULL,
  CONSTRAINT fk_res_slot    FOREIGN KEY (slot_id)    REFERENCES time_slots (slot_id),
  CONSTRAINT fk_res_handler FOREIGN KEY (handled_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='mode queue = hold request / waitlist. An overdue "reserved" row is shown as expired by v_reservation_queue';

CREATE TABLE loans (
  loan_id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             INT UNSIGNED NOT NULL,
  copy_id             INT UNSIGNED NULL,
  edition_id          INT UNSIGNED NULL,
  reservation_id      INT UNSIGNED NULL,
  borrowed_at         DATETIME NOT NULL,
  due_on              DATE NOT NULL,
  returned_at         DATETIME NULL,
  returned_condition  ENUM('excellent','good','damaged') NULL,
  status              ENUM('active','returned','lost') NOT NULL DEFAULT 'active',
  issued_by           INT UNSIGNED NULL,
  received_by         INT UNSIGNED NULL,
  notes               VARCHAR(255) NULL,
  loan_type           VARCHAR(8) GENERATED ALWAYS AS (CASE WHEN copy_id IS NOT NULL THEN 'physical' ELSE 'digital' END) VIRTUAL,
  active_copy_key     INT UNSIGNED GENERATED ALWAYS AS (CASE WHEN status = 'active' AND returned_at IS NULL THEN copy_id END) VIRTUAL,
  PRIMARY KEY (loan_id),
  UNIQUE KEY uq_one_active_loan_per_copy (active_copy_key),
  KEY ix_loans_user (user_id),
  KEY ix_loans_due (due_on),
  KEY ix_loans_borrowed (borrowed_at),
  CONSTRAINT fk_loan_user    FOREIGN KEY (user_id)        REFERENCES users (user_id),
  CONSTRAINT fk_loan_copy    FOREIGN KEY (copy_id)        REFERENCES book_copies (copy_id),
  CONSTRAINT fk_loan_edition FOREIGN KEY (edition_id)     REFERENCES digital_editions (edition_id),
  CONSTRAINT fk_loan_res     FOREIGN KEY (reservation_id) REFERENCES reservations (reservation_id) ON DELETE SET NULL,
  CONSTRAINT fk_loan_issuer  FOREIGN KEY (issued_by)      REFERENCES users (user_id) ON DELETE SET NULL,
  CONSTRAINT fk_loan_recv    FOREIGN KEY (received_by)    REFERENCES users (user_id) ON DELETE SET NULL,
  CONSTRAINT ck_loan_one_item CHECK ((copy_id IS NOT NULL AND edition_id IS NULL) OR (copy_id IS NULL AND edition_id IS NOT NULL))
) ENGINE=InnoDB COMMENT='Physical (copy_id) or digital (edition_id) loan. A copy can have only ONE active loan (unique key)';

CREATE TABLE fines (
  fine_id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  loan_id      INT UNSIGNED NOT NULL,
  user_id      INT UNSIGNED NOT NULL,
  days_late    SMALLINT UNSIGNED NOT NULL,
  amount       DECIMAL(8,2) NOT NULL,
  status       ENUM('unpaid','cleared','waived') NOT NULL DEFAULT 'unpaid',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_by  INT UNSIGNED NULL,
  resolved_at  DATETIME NULL,
  note         VARCHAR(255) NULL,
  PRIMARY KEY (fine_id),
  UNIQUE KEY uq_fine_loan (loan_id),
  KEY ix_fines_user (user_id),
  CONSTRAINT fk_fine_loan FOREIGN KEY (loan_id)     REFERENCES loans (loan_id),
  CONSTRAINT fk_fine_user FOREIGN KEY (user_id)     REFERENCES users (user_id),
  CONSTRAINT fk_fine_by   FOREIGN KEY (resolved_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='All amounts in BDT (৳). cleared = paid at desk, waived = librarian waived';

CREATE TABLE appointment_types (
  type_id      TINYINT UNSIGNED NOT NULL,
  name         VARCHAR(60) NOT NULL,
  description  VARCHAR(160) NULL,
  PRIMARY KEY (type_id),
  UNIQUE KEY uq_apt_type (name)
) ENGINE=InnoDB;

CREATE TABLE appointments (
  appointment_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id           INT UNSIGNED NOT NULL,
  type_id           TINYINT UNSIGNED NOT NULL,
  appointment_date  DATE NOT NULL,
  slot_id           TINYINT UNSIGNED NOT NULL,
  note              VARCHAR(255) NULL,
  status            ENUM('booked','completed','cancelled') NOT NULL DEFAULT 'booked',
  handled_by        INT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (appointment_id),
  KEY ix_apt_user (user_id),
  KEY ix_apt_date (appointment_date),
  CONSTRAINT fk_apt_user    FOREIGN KEY (user_id)    REFERENCES users (user_id),
  CONSTRAINT fk_apt_type    FOREIGN KEY (type_id)    REFERENCES appointment_types (type_id),
  CONSTRAINT fk_apt_slot    FOREIGN KEY (slot_id)    REFERENCES time_slots (slot_id),
  CONSTRAINT fk_apt_handler FOREIGN KEY (handled_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='VIP-only (membership_plans.vip_appointments = 1)';

-- ---------------------------------------------------------------------------
-- 6. READER ACTIVITY
-- ---------------------------------------------------------------------------
CREATE TABLE reading_progress (
  user_id       INT UNSIGNED NOT NULL,
  book_id       INT UNSIGNED NOT NULL,
  current_page  INT UNSIGNED NOT NULL DEFAULT 1,
  status        ENUM('reading','finished') NOT NULL DEFAULT 'reading',
  started_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id),
  CONSTRAINT fk_rp_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_book FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Study Zone desk: books on the reader''s desk and the page they are on';

CREATE TABLE reading_sessions (
  session_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  book_id      INT UNSIGNED NOT NULL,
  edition_id   INT UNSIGNED NULL,
  page_from    INT UNSIGNED NOT NULL,
  page_to      INT UNSIGNED NOT NULL,
  seconds      INT UNSIGNED NOT NULL DEFAULT 0,
  started_at   DATETIME NOT NULL,
  PRIMARY KEY (session_id),
  KEY ix_rs_user (user_id, started_at),
  KEY ix_rs_started (started_at),
  CONSTRAINT fk_rs_user    FOREIGN KEY (user_id)    REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_rs_book    FOREIGN KEY (book_id)    REFERENCES books (book_id) ON DELETE CASCADE,
  CONSTRAINT fk_rs_edition FOREIGN KEY (edition_id) REFERENCES digital_editions (edition_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Reading log. Feeds reader history AND admin metrics (digital sessions, active readers)';

CREATE TABLE study_daily (
  user_id        INT UNSIGNED NOT NULL,
  study_date     DATE NOT NULL,
  focus_seconds  INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, study_date),
  CONSTRAINT fk_sd_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Study Zone daily focus timer (30 min / 1 h ... 6 h milestones are computed by the app)';

CREATE TABLE wishlists (
  user_id   INT UNSIGNED NOT NULL,
  book_id   INT UNSIGNED NOT NULL,
  added_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, book_id),
  CONSTRAINT fk_wl_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_wl_book FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reviews (
  review_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  book_id      INT UNSIGNED NOT NULL,
  user_id      INT UNSIGNED NOT NULL,
  rating       TINYINT UNSIGNED NOT NULL,
  review_text  TEXT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  UNIQUE KEY uq_one_review_per_user (book_id, user_id),
  CONSTRAINT fk_rev_book FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT ck_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE swap_offers (
  offer_id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  from_user_id     INT UNSIGNED NOT NULL,
  to_user_id       INT UNSIGNED NOT NULL,
  offered_title    VARCHAR(200) NOT NULL,
  requested_title  VARCHAR(200) NOT NULL,
  status           ENUM('pending','accepted','declined','cancelled') NOT NULL DEFAULT 'pending',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at     DATETIME NULL,
  PRIMARY KEY (offer_id),
  KEY ix_swap_to (to_user_id, status),
  CONSTRAINT fk_sw_from FOREIGN KEY (from_user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT fk_sw_to   FOREIGN KEY (to_user_id)   REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Lend & Trade: readers swapping their own personal copies (titles are free text)';

-- ---------------------------------------------------------------------------
-- 7. SYSTEM
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  notification_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          INT UNSIGNED NULL,
  audience         ENUM('user','librarian','admin') NOT NULL DEFAULT 'user',
  type             ENUM('due_soon','reservation','wishlist','appointment','stock','fine','system') NOT NULL DEFAULT 'system',
  message          VARCHAR(255) NOT NULL,
  link_url         VARCHAR(255) NULL,
  is_read          BOOLEAN NOT NULL DEFAULT 0,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY ix_notif_user (user_id, is_read),
  KEY ix_notif_audience (audience, is_read),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='user_id set = personal. user_id NULL + audience = broadcast to all librarians / admins';

CREATE TABLE activity_log (
  activity_id  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NULL,
  actor_name   VARCHAR(100) NOT NULL,
  action       VARCHAR(80)  NOT NULL,
  item         VARCHAR(200) NOT NULL,
  entity_type  VARCHAR(30)  NULL,
  entity_id    INT UNSIGNED NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id),
  KEY ix_act_created (created_at),
  KEY ix_act_user (user_id),
  CONSTRAINT fk_act_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Audit trail. Admin Overview shows admin rows, Librarian Dashboard shows librarian rows';

CREATE TABLE system_settings (
  setting_key    VARCHAR(60)  NOT NULL,
  setting_value  VARCHAR(255) NOT NULL,
  description    VARCHAR(200) NULL,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB;

CREATE TABLE permissions (
  role        ENUM('admin','librarian','reader') NOT NULL,
  resource    VARCHAR(40) NOT NULL,
  can_view    BOOLEAN NOT NULL DEFAULT 0,
  can_create  BOOLEAN NOT NULL DEFAULT 0,
  can_edit    BOOLEAN NOT NULL DEFAULT 0,
  can_delete  BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (role, resource)
) ENGINE=InnoDB COMMENT='Permission matrix the backend should enforce on every API call';


-- Live availability of every title (physical copies minus loans minus live reservations)
CREATE VIEW v_book_availability AS
SELECT b.book_id,
       COALESCE(c.total_copies, 0)  AS total_copies,
       COALESCE(l.on_loan, 0)       AS on_loan,
       COALESCE(r.reserved, 0)      AS reserved_now,
       GREATEST(COALESCE(c.total_copies, 0) - COALESCE(l.on_loan, 0) - COALESCE(r.reserved, 0), 0) AS available_copies,
       COALESCE(d.ready_editions, 0) AS digital_editions
FROM books b
LEFT JOIN (SELECT book_id, COUNT(*) AS total_copies
             FROM book_copies WHERE status = 'in_service' GROUP BY book_id) c ON c.book_id = b.book_id
LEFT JOIN (SELECT bc.book_id, COUNT(*) AS on_loan
             FROM loans ln JOIN book_copies bc ON bc.copy_id = ln.copy_id
            WHERE ln.status = 'active' AND ln.returned_at IS NULL GROUP BY bc.book_id) l ON l.book_id = b.book_id
LEFT JOIN (SELECT book_id, COUNT(*) AS reserved
             FROM reservations
            WHERE status = 'reserved' AND mode <> 'queue' AND (expires_at IS NULL OR expires_at > NOW())
            GROUP BY book_id) r ON r.book_id = b.book_id
LEFT JOIN (SELECT book_id, COUNT(*) AS ready_editions
             FROM digital_editions WHERE status = 'Ready' GROUP BY book_id) d ON d.book_id = b.book_id;

CREATE VIEW v_category_closure AS
SELECT category_id AS ancestor_id, category_id AS descendant_id FROM categories
UNION ALL
SELECT parent_category_id, category_id FROM categories WHERE parent_category_id IS NOT NULL
UNION ALL
SELECT p.parent_category_id, c.category_id
  FROM categories c JOIN categories p ON p.category_id = c.parent_category_id
 WHERE p.parent_category_id IS NOT NULL;

-- ONE catalogue feed for: Guest Browse, Reader book page, Librarian search, Admin catalogue
CREATE VIEW v_book_catalog AS
SELECT b.book_id, b.book_code, b.title, b.description, b.page_count, b.access_level, b.is_active,
       b.cover_color_1, b.cover_color_2, b.cover_image_url,
       c.category_id, c.name AS category,
       COALESCE(gp.name, p.name, c.name) AS root_category,
       au.author_names,
       av.total_copies, av.available_copies, av.digital_editions,
       CASE WHEN av.total_copies > 0 AND av.digital_editions > 0 THEN 'physical+digital'
            WHEN av.total_copies > 0 THEN 'physical_only'
            WHEN av.digital_editions > 0 THEN 'digital_only'
            ELSE 'unavailable' END AS availability_type,
       COALESCE(rt.avg_rating, 0) AS avg_rating,
       COALESCE(rt.rating_count, 0) AS rating_count
FROM books b
JOIN categories c ON c.category_id = b.category_id
LEFT JOIN categories p  ON p.category_id  = c.parent_category_id
LEFT JOIN categories gp ON gp.category_id = p.parent_category_id
LEFT JOIN v_book_availability av ON av.book_id = b.book_id
LEFT JOIN (SELECT ba.book_id, GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ', ') AS author_names
             FROM book_authors ba JOIN authors a ON a.author_id = ba.author_id GROUP BY ba.book_id) au ON au.book_id = b.book_id
LEFT JOIN (SELECT book_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS rating_count
             FROM reviews GROUP BY book_id) rt ON rt.book_id = b.book_id;

-- Librarian > Inventory  (Copies = available now; status uses setting low_stock_threshold)
CREATE VIEW v_inventory AS
SELECT b.book_id, b.book_code AS `Book ID`, b.title AS `Book Name`, cat.author_names AS `Author`,
       cat.category,
       sh.shelves AS `Shelf`,
       av.available_copies AS `Copies`, av.total_copies, av.on_loan, av.reserved_now,
       CASE WHEN av.available_copies = 0 THEN 'Out of stock'
            WHEN av.available_copies <= (SELECT CAST(setting_value AS UNSIGNED) FROM system_settings WHERE setting_key = 'low_stock_threshold') THEN 'Low stock'
            ELSE 'Available' END AS `Status`
FROM books b
JOIN v_book_availability av ON av.book_id = b.book_id AND av.total_copies > 0
JOIN v_book_catalog cat ON cat.book_id = b.book_id
LEFT JOIN (SELECT book_id, GROUP_CONCAT(DISTINCT shelf_location ORDER BY shelf_location SEPARATOR ', ') AS shelves
             FROM book_copies WHERE status = 'in_service' GROUP BY book_id) sh ON sh.book_id = b.book_id
WHERE b.is_active = 1;

-- Admin > Catalogue Detail (titles roll up from sub-categories)
CREATE VIEW v_category_stats AS
SELECT c.category_id, c.name AS category, p.name AS parent_category, c.is_active,
       COUNT(b.book_id) AS titles,
       COALESCE(SUM(CASE WHEN av.total_copies > 0 THEN 1 ELSE 0 END), 0)      AS physical_titles,
       COALESCE(SUM(CASE WHEN av.digital_editions > 0 THEN 1 ELSE 0 END), 0)  AS digital_titles
FROM categories c
LEFT JOIN categories p ON p.category_id = c.parent_category_id
LEFT JOIN v_category_closure cl ON cl.ancestor_id = c.category_id
LEFT JOIN books b ON b.category_id = cl.descendant_id AND b.is_active = 1
LEFT JOIN v_book_availability av ON av.book_id = b.book_id
GROUP BY c.category_id, c.name, p.name, c.is_active;

-- Admin > Author Database
CREATE VIEW v_author_stats AS
SELECT a.author_id, a.name, a.primary_genre, a.rights_status, a.updated_at,
       COUNT(ba.book_id) AS titles_held
FROM authors a
LEFT JOIN book_authors ba ON ba.author_id = a.author_id
GROUP BY a.author_id, a.name, a.primary_genre, a.rights_status, a.updated_at;

-- Admin > Digital Publication (files the library hosts itself)
CREATE VIEW v_digital_publications AS
SELECT d.edition_id, b.book_id, b.title AS publication, d.format, d.file_size_mb, d.status,
       d.max_concurrent_licenses, d.uploaded_at, u.full_name AS uploaded_by
FROM digital_editions d
JOIN books b ON b.book_id = d.book_id
LEFT JOIN users u ON u.user_id = d.uploaded_by
WHERE d.hosting = 'hosted';

CREATE VIEW v_loan_detail AS
SELECT l.loan_id, l.user_id, l.loan_type, l.copy_id, l.edition_id,
       b.book_id, b.title, l.borrowed_at, l.due_on, l.returned_at, l.status, l.returned_condition,
       l.issued_by, l.received_by,
       DATEDIFF(COALESCE(DATE(l.returned_at), CURDATE()), l.due_on) AS days_past_due
FROM loans l
LEFT JOIN book_copies bc ON bc.copy_id = l.copy_id
LEFT JOIN digital_editions de ON de.edition_id = l.edition_id
JOIN books b ON b.book_id = COALESCE(bc.book_id, de.book_id);

-- Librarian > Return page + Admin overdue counts. projected_fee = fee if returned today
CREATE VIEW v_active_loans AS
SELECT ld.loan_id, u.user_id, u.library_id, u.full_name AS borrower, mp.name AS plan,
       ld.loan_type, ld.book_id, ld.title, ld.borrowed_at, ld.due_on,
       GREATEST(ld.days_past_due, 0) AS days_overdue,
       CASE WHEN ld.days_past_due > 0 THEN 1 ELSE 0 END AS is_overdue,
       COALESCE(LEAST(GREATEST(ld.days_past_due - mp.late_fee_grace_days, 0) * r.fee_per_day, r.max_fee), 0) AS projected_fee
FROM v_loan_detail ld
JOIN users u ON u.user_id = ld.user_id
JOIN membership_plans mp ON mp.plan_id = u.plan_id
LEFT JOIN late_fee_rules r ON r.plan_id = u.plan_id AND r.item_type = ld.loan_type
WHERE ld.status = 'active' AND ld.returned_at IS NULL;

-- Librarian > Fines ledger / Reader > History & Fines
CREATE VIEW v_fines_ledger AS
SELECT f.fine_id, u.user_id, u.library_id, u.full_name AS borrower, ld.title AS book,
       ld.loan_type, f.days_late, f.amount, f.status, f.created_at, f.resolved_at
FROM fines f
JOIN users u ON u.user_id = f.user_id
JOIN v_loan_detail ld ON ld.loan_id = f.loan_id;

-- Librarian > Reservations queue (expired is computed even if the status was not updated yet)
CREATE VIEW v_reservation_queue AS
SELECT r.reservation_id, u.user_id, u.library_id, u.full_name AS reader, b.book_id, b.title AS book,
       r.mode, r.status AS stored_status,
       CASE WHEN r.status = 'reserved' AND r.expires_at IS NOT NULL AND r.expires_at < NOW()
            THEN 'expired' ELSE r.status END AS status,
       r.slot_date, ts.label AS slot, r.desk_label, r.queue_position, r.created_at, r.expires_at, r.picked_up_at
FROM reservations r
JOIN users u ON u.user_id = r.user_id
JOIN books b ON b.book_id = r.book_id
LEFT JOIN time_slots ts ON ts.slot_id = r.slot_id;

-- Reader: how much of the plan allowance is used
CREATE VIEW v_user_limits AS
SELECT u.user_id, u.library_id, u.full_name, mp.name AS plan,
       mp.physical_loan_limit,
       (SELECT COUNT(*) FROM loans l WHERE l.user_id = u.user_id AND l.copy_id IS NOT NULL
           AND l.status = 'active' AND l.returned_at IS NULL)
       + (SELECT COUNT(*) FROM reservations r WHERE r.user_id = u.user_id AND r.mode <> 'queue'
           AND r.status = 'reserved' AND (r.expires_at IS NULL OR r.expires_at > NOW())) AS physical_used,
       mp.hold_limit,
       (SELECT COUNT(*) FROM reservations r WHERE r.user_id = u.user_id AND r.status = 'queued') AS holds_used,
       COALESCE((SELECT SUM(f.amount) FROM fines f WHERE f.user_id = u.user_id AND f.status = 'unpaid'), 0) AS unpaid_fines
FROM users u
JOIN membership_plans mp ON mp.plan_id = u.plan_id
WHERE u.role = 'reader';

-- Admin > Check-Out Metrics: High-Demand Resources
CREATE VIEW v_high_demand AS
SELECT b.book_id, b.title, COUNT(*) AS waitlist,
       ROUND(AVG(DATEDIFF(NOW(), r.created_at)), 0) AS avg_wait_days
FROM reservations r
JOIN books b ON b.book_id = r.book_id
WHERE r.status = 'queued'
GROUP BY b.book_id, b.title;

-- Admin > Check-Out Metrics: Check-outs by hour of day
CREATE VIEW v_hourly_checkouts AS
SELECT HOUR(borrowed_at) AS hour_of_day, COUNT(*) AS checkouts
FROM loans
GROUP BY HOUR(borrowed_at);

-- Admin > Overview: circulation, last 14 days (days with no activity are simply absent)
CREATE VIEW v_daily_circulation AS
SELECT DATE(borrowed_at) AS checkout_date, COUNT(*) AS checkouts
FROM loans
WHERE borrowed_at >= CURDATE() - INTERVAL 13 DAY
GROUP BY DATE(borrowed_at);

-- Admin > Check-Out Metrics: Weekly digital session load (1 = Sunday ... 7 = Saturday)
CREATE VIEW v_weekly_digital_load AS
SELECT DAYOFWEEK(started_at) AS day_of_week, COUNT(*) AS sessions, SUM(seconds) AS total_seconds
FROM reading_sessions
WHERE edition_id IS NOT NULL
GROUP BY DAYOFWEEK(started_at);

-- Admin > Overview: Demand by Category
CREATE VIEW v_category_demand AS
SELECT cat.root_category AS category, COUNT(*) AS checkouts,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM loans), 1) AS percent_of_total
FROM loans l
JOIN v_loan_detail ld ON ld.loan_id = l.loan_id
JOIN v_book_catalog cat ON cat.book_id = ld.book_id
GROUP BY cat.root_category;

CREATE VIEW v_admin_overview AS
SELECT
  (SELECT COUNT(DISTINCT user_id) FROM reading_sessions WHERE DATE(started_at) = CURDATE())                      AS active_readers_today,
  (SELECT COUNT(*) FROM loans WHERE YEAR(borrowed_at) = YEAR(CURDATE()) AND MONTH(borrowed_at) = MONTH(CURDATE())) AS checkouts_this_month,
  (SELECT COUNT(*) FROM v_active_loans WHERE is_overdue = 1)                                                     AS overdue_items,
  (SELECT COUNT(*) FROM reading_sessions WHERE edition_id IS NOT NULL AND DATE(started_at) = CURDATE())          AS digital_sessions_today,
  (SELECT COUNT(*) FROM digital_editions WHERE hosting = 'hosted')                                               AS digital_titles,
  (SELECT COUNT(*) FROM digital_editions WHERE hosting = 'hosted' AND status = 'Processing')                     AS pending_processing,
  (SELECT COALESCE(SUM(file_size_mb), 0) FROM digital_editions WHERE hosting = 'hosted')                         AS storage_used_mb,
  (SELECT CAST(setting_value AS UNSIGNED) FROM system_settings WHERE setting_key = 'digital_storage_capacity_mb') AS storage_capacity_mb;

CREATE VIEW v_librarian_dashboard AS
SELECT
  (SELECT COUNT(*) FROM book_copies WHERE status = 'in_service')                                              AS books_in_library,
  (SELECT COUNT(*) FROM reservations WHERE mode <> 'queue' AND DATE(created_at) = CURDATE())                  AS reserved_today,
  (SELECT COUNT(*) FROM loans WHERE DATE(returned_at) = CURDATE())                                            AS returns_today,
  (SELECT COUNT(*) FROM v_active_loans WHERE is_overdue = 1 AND loan_type = 'physical')                       AS overdue_books;

-- Membership pages (Admin tiers editor, Guest/Reader Membership page): plan + both prices
CREATE VIEW v_membership_tiers AS
SELECT mp.plan_id, mp.name, mp.tagline, mp.physical_loan_limit, mp.digital_loan_limit, mp.hold_limit,
       mp.reading_room_access, mp.loan_period_days, mp.digital_loan_days, mp.late_fee_grace_days, mp.vip_appointments,
       pm.price AS monthly_price, pm.note AS monthly_note,
       py.price AS yearly_price,  py.note AS yearly_note
FROM membership_plans mp
LEFT JOIN plan_prices pm ON pm.plan_id = mp.plan_id AND pm.billing_period = 'monthly'
LEFT JOIN plan_prices py ON py.plan_id = mp.plan_id AND py.billing_period = 'yearly';


-- ---------------------------------------------------------------------------
-- FUNCTION: late fee for a plan / item type / days late (grace days + daily rate + cap)
--   SELECT fn_late_fee(2, 'physical', 5);   -- Premium, 5 days late -> (5-1)*3 = 12.00
-- ---------------------------------------------------------------------------
DELIMITER $$
CREATE FUNCTION fn_late_fee(p_plan_id TINYINT UNSIGNED, p_item_type VARCHAR(8), p_days_late INT)
RETURNS DECIMAL(8,2)
READS SQL DATA
BEGIN
  DECLARE v_fee DECIMAL(8,2);
  DECLARE v_max DECIMAL(8,2);
  DECLARE v_grace INT;
  DECLARE v_chargeable INT;
  SELECT r.fee_per_day, r.max_fee, mp.late_fee_grace_days
    INTO v_fee, v_max, v_grace
    FROM late_fee_rules r
    JOIN membership_plans mp ON mp.plan_id = r.plan_id
   WHERE r.plan_id = p_plan_id AND r.item_type = p_item_type
   LIMIT 1;
  IF v_fee IS NULL THEN
    RETURN 0;
  END IF;
  SET v_chargeable = GREATEST(p_days_late - v_grace, 0);
  RETURN LEAST(v_chargeable * v_fee, v_max);
END$$

-- ---------------------------------------------------------------------------
-- PROCEDURE: loads (or reloads) ALL demo data. Called by the import and by the reset.
-- ---------------------------------------------------------------------------
CREATE PROCEDURE sp_seed_demo_data()
BEGIN
  INSERT INTO membership_plans (plan_id, name, tagline, physical_loan_limit, digital_loan_limit, hold_limit, reading_room_access, loan_period_days, digital_loan_days, late_fee_grace_days, vip_appointments) VALUES
    (1, 'Basic', 'Free access, casual readers', 3, 2, 1, 'Day pass', 12, 7, 0, 0),
    (2, 'Premium', 'Regular readers & active learners', 8, 10, 5, 'Full hours', 14, 14, 1, 0),
    (3, 'VIP', 'Frequent readers & advanced users', 20, NULL, 15, 'Priority seating', 21, 21, 0, 1);

  INSERT INTO plan_prices (plan_id, billing_period, price, note) VALUES
    (1, 'monthly', 0, 'No payment needed'),
    (1, 'yearly', 0, 'No payment needed'),
    (2, 'monthly', 150, 'or ৳1,200/yr'),
    (2, 'yearly', 1200, 'or ৳150/mo'),
    (3, 'monthly', 300, 'or ৳3,500/yr'),
    (3, 'yearly', 3500, 'or ৳300/mo');

  INSERT INTO plan_features (plan_id, sort_order, feature_text) VALUES
    (1, 1, 'Physical loans: 3'),
    (1, 2, 'Hold requests: 1'),
    (1, 3, 'Reading room: Day pass'),
    (1, 4, '1 cozy study theme'),
    (2, 1, 'Physical loans: 8'),
    (2, 2, 'Hold requests: 5'),
    (2, 3, 'Reading room: Full hours'),
    (2, 4, 'Late-fee grace: +1 day'),
    (2, 5, '2 extra study themes'),
    (3, 1, 'Physical loans: 20'),
    (3, 2, 'Hold requests: 15'),
    (3, 3, 'Reading room: Priority seating'),
    (3, 4, 'Rare collection: by appointment'),
    (3, 5, 'VIP appointments page'),
    (3, 6, 'Exclusive Starlit study theme');

  INSERT INTO study_themes (theme_key, name, min_plan_id) VALUES
    ('pink', 'Pink blossom', 1),
    ('cream', 'Cream kawaii', 2),
    ('window', 'Sunny window', 2),
    ('eve', 'Cozy evening', 3),
    ('star', 'Starlit library', 3);

  INSERT INTO late_fee_rules (plan_id, item_type, fee_per_day, max_fee) VALUES
    (1, 'physical', 5, 100),
    (2, 'physical', 3, 80),
    (3, 'physical', 2, 50),
    (1, 'digital', 2, 40),
    (2, 'digital', 1, 20),
    (3, 'digital', 0, 0);

  INSERT INTO users (user_id, library_id, role, full_name, nickname, username, email, phone, password_hash, job_title, avatar_key, avatar_url, plan_id, billing_period, plan_expires_on, account_status, joined_on, last_login_at) VALUES
    (1, 'STF-0001', 'admin', 'Himel', 'Himel', 'himel', 'himel@gmail.com', '+880 1700-000000', '$2y$12$uxuCiP9lScv3j9/JVtDcbuBaBFSpVrpAiCrsSj4r491YwWNDW7URe', 'System Admin', 'tabby', NULL, NULL, NULL, NULL, 'active', '2022-01-12', NOW() - INTERVAL 37 MINUTE),
    (2, 'STF-0002', 'librarian', 'Maryum', 'Maryum', 'maryum', 'maryum@gmail.com', '+880 1700-000002', '$2y$12$Z8JRyMSruz8Ly97/H0LFUOWZS4dPOYo6RvWAUlPiMJeqA.Rw1sjkW', 'Librarian', 'grey', NULL, NULL, NULL, NULL, 'active', '2023-03-01', NOW() - INTERVAL 74 MINUTE),
    (3, 'STF-0003', 'librarian', 'M. Alam', 'Alam', 'malam', 'm.alam@athenaeum.lib', '+880 1700-000003', 'pbkdf2_sha256$260000$lib0003salt$kwDMfgxlQqihfMlP1bMf97W7rHEtTiYdoBzSd5gWB18=', 'Digital Librarian', 'fox', NULL, NULL, NULL, NULL, 'active', '2023-06-15', NOW() - INTERVAL 111 MINUTE),
    (4, 'LIB-00219', 'reader', 'Faija', 'Faija', 'faija', 'faija@gmail.com', '+880 1711-000219', '$2y$12$MQA93UasuIUBmJB5Gwht3ObZm7/vsc8a63JQE2gYo0OzOT.5r5oiS', NULL, 'bunny', NULL, 1, NULL, NULL, 'active', '2024-02-10', NOW() - INTERVAL 148 MINUTE),
    (5, 'LIB-00215', 'reader', 'Sarah Rahman', 'Sarah', 'sarah', 'sarah@petalpage.lib', '+880 1711-000215', 'pbkdf2_sha256$260000$lib0005salt$V8xvpq7GyMtVkeS+xivOdtJ7N1cRS0pnLUbBsYI+W0Y=', NULL, 'frog', NULL, 2, 'monthly', CURDATE() + INTERVAL 18 DAY, 'active', '2023-09-05', NOW() - INTERVAL 185 MINUTE),
    (6, 'LIB-00113', 'reader', 'Asma Akter', 'Asma', 'asma', 'asma@petalpage.lib', '+880 1711-000113', 'pbkdf2_sha256$260000$lib0006salt$bS5I5LbpTHk3uDMYVsoNND/2Uq+QtmSSCMEUqvlgLRU=', NULL, 'bear', NULL, 1, NULL, NULL, 'active', '2025-01-20', NOW() - INTERVAL 222 MINUTE),
    (7, 'LIB-00140', 'reader', 'Ananya Das', 'Ananya', 'ananya', 'ananya@petalpage.lib', '+880 1711-000140', 'pbkdf2_sha256$260000$lib0007salt$ULU7rO/mJqEJXWzFfP2pDcYDk2gw4DAVuExqom1S4i0=', NULL, 'panda', NULL, 3, 'yearly', CURDATE() + INTERVAL 210 DAY, 'active', '2022-11-02', NOW() - INTERVAL 259 MINUTE),
    (8, 'LIB-00152', 'reader', 'Maya Chowdhury', 'Maya', 'maya', 'maya@petalpage.lib', '+880 1711-000152', 'pbkdf2_sha256$260000$lib0008salt$lgkIOMrVo79fGpncm9k1HS5aryezFG+EXqiUVlubZag=', NULL, 'sprout', NULL, 2, 'monthly', CURDATE() + INTERVAL 9 DAY, 'active', '2024-06-18', NOW() - INTERVAL 296 MINUTE),
    (9, 'LIB-00161', 'reader', 'Alex Gomes', 'Alex', 'alex', 'alex@petalpage.lib', '+880 1711-000161', 'pbkdf2_sha256$260000$lib0009salt$ogVSy2yY8oSTkBxKbZ+NIgHq0hn1qFN/1FAtJ9x3m3c=', NULL, 'dog', NULL, 1, NULL, NULL, 'active', '2025-03-03', NOW() - INTERVAL 333 MINUTE),
    (10, 'LIB-00177', 'reader', 'Rohan Mehta', 'Rohan', 'rohan', 'rohan@petalpage.lib', '+880 1711-000177', 'pbkdf2_sha256$260000$lib0010salt$ElQwrdO9i+h17clwCmrL6xaXtZOf0jVeQBxJzKyDSE4=', NULL, 'cool', NULL, 2, 'yearly', CURDATE() + INTERVAL 120 DAY, 'active', '2023-12-12', NOW() - INTERVAL 370 MINUTE),
    (11, 'LIB-00188', 'reader', 'Meera Nair', 'Meera', 'meera', 'meera@petalpage.lib', '+880 1711-000188', 'pbkdf2_sha256$260000$lib0011salt$CV+j1CRm40SwKmrcoQCw+2DsPHA4EE+D0KyKkPSFP3Q=', NULL, 'chick', NULL, 1, NULL, NULL, 'active', '2025-05-09', NOW() - INTERVAL 407 MINUTE),
    (12, 'LIB-00124', 'reader', 'Guiltythree', 'Guilty', 'guiltythree', 'guiltythree@petalpage.lib', '+880 1711-000124', 'pbkdf2_sha256$260000$lib0012salt$zXQiFnDZ3OnkxVDaaWkIVjyBqPKyOB368iE2qw1qIl0=', NULL, 'pup', NULL, 1, NULL, NULL, 'active', '2024-10-30', NOW() - INTERVAL 444 MINUTE);

  INSERT INTO membership_purchases (user_id, plan_id, billing_period, amount, purchased_at) VALUES
    (5, 2, 'monthly', 150, NOW() - INTERVAL 12 DAY),
    (7, 3, 'yearly', 3500, NOW() - INTERVAL 155 DAY),
    (8, 2, 'monthly', 150, NOW() - INTERVAL 21 DAY),
    (10, 2, 'yearly', 1200, NOW() - INTERVAL 245 DAY);

  INSERT INTO categories (category_id, name, parent_category_id, is_active) VALUES
    (1, 'Fiction', NULL, 1),
    (2, 'Non-Fiction', NULL, 1),
    (3, 'Science & Technology', NULL, 1),
    (4, 'Children''s', NULL, 1),
    (5, 'Reference', NULL, 1),
    (6, 'Periodicals', NULL, 1),
    (7, 'Rare & Special Collections', NULL, 1),
    (8, 'Digital-Only Releases', NULL, 1),
    (9, 'Graphic Novels', 1, 1),
    (10, 'Manga', 9, 1),
    (11, 'Manhwa', 9, 1),
    (12, 'Thriller', 1, 1),
    (13, 'Horror', 1, 1),
    (14, 'Historical', 1, 1),
    (15, 'Detective', 1, 1),
    (16, 'Cozy', 1, 1),
    (17, 'Programming', 3, 1),
    (18, 'Mathematics', 3, 1),
    (19, 'Science', 3, 1);

  INSERT INTO authors (author_id, name, primary_genre, rights_status, updated_at) VALUES
    (1, 'Amara Okafor', 'Literary Fiction', 'Cleared', '2026-07-14 10:00:00'),
    (2, 'Hiroshi Tanaka', 'Science & Tech', 'Cleared', '2026-07-02 10:00:00'),
    (3, 'Elena Marchetti', 'History', 'Pending Review', '2026-06-28 10:00:00'),
    (4, 'Deshi Rahman', 'Poetry', 'Cleared', '2026-06-21 10:00:00'),
    (5, 'Margaret Fell', 'Rare & Special', 'Public Domain', '2026-05-10 10:00:00'),
    (6, 'Eiichiro Oda', 'Manga', 'Cleared', NOW() - INTERVAL 30 DAY),
    (7, 'Tatsuya Endo', 'Manga', 'Cleared', NOW() - INTERVAL 30 DAY),
    (8, 'Yukinobu Tatsu', 'Manga', 'Cleared', NOW() - INTERVAL 30 DAY),
    (9, 'SIU', 'Manhwa', 'Cleared', NOW() - INTERVAL 30 DAY),
    (10, 'Rachel Smythe', 'Manhwa', 'Cleared', NOW() - INTERVAL 30 DAY),
    (11, 'Yaongyi', 'Manhwa', 'Cleared', NOW() - INTERVAL 30 DAY),
    (12, 'John Buchan', 'Thriller', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (13, 'Wilkie Collins', 'Thriller', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (14, 'Bram Stoker', 'Horror', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (15, 'Mary Shelley', 'Horror', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (16, 'R. L. Stevenson', 'Horror', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (17, 'Henry James', 'Horror', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (18, 'Charles Dickens', 'Historical', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (19, 'Alexandre Dumas', 'Historical', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (20, 'Walter Scott', 'Historical', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (21, 'Arthur Conan Doyle', 'Detective', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (22, 'Jane Austen', 'Cozy', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (23, 'L. M. Montgomery', 'Cozy', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (24, 'Frances H. Burnett', 'Cozy', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (25, 'Louisa May Alcott', 'Cozy', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (26, 'Lewis Carroll', 'Cozy', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (27, 'Kenneth Grahame', 'Cozy', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (28, 'Sun Tzu', 'Non-fiction', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (29, 'Marcus Aurelius', 'Non-fiction', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (30, 'Henry David Thoreau', 'Non-fiction', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (31, 'Niccolò Machiavelli', 'Non-fiction', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (32, 'Benjamin Franklin', 'Non-fiction', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (33, 'James Allen', 'Non-fiction', 'Public Domain', NOW() - INTERVAL 30 DAY),
    (34, 'Robert C. Martin', 'Programming', 'Cleared', NOW() - INTERVAL 30 DAY),
    (35, 'Paulo Coelho', 'Fiction', 'Cleared', NOW() - INTERVAL 30 DAY),
    (36, 'Guiltythree', 'Fiction', 'Cleared', NOW() - INTERVAL 30 DAY),
    (37, 'Leigh Bardugo', 'Fiction', 'Cleared', NOW() - INTERVAL 30 DAY),
    (38, 'Nadia Rahman', 'Programming', 'Cleared', NOW() - INTERVAL 30 DAY),
    (39, 'Tariq Hasan', 'Programming', 'Cleared', NOW() - INTERVAL 30 DAY),
    (40, 'Sabrina Chowdhury', 'Programming', 'Cleared', NOW() - INTERVAL 30 DAY),
    (41, 'Imran Hossain', 'Science', 'Cleared', NOW() - INTERVAL 30 DAY),
    (42, 'Lena Fischer', 'Programming', 'Cleared', NOW() - INTERVAL 30 DAY);

  INSERT INTO books (book_id, book_code, title, category_id, description, page_count, access_level, cover_color_1, cover_color_2, created_by) VALUES
    (1, 'BK-3001', 'One Piece', 10, 'Luffy and his Straw Hat crew sail the Grand Line in search of the legendary treasure One Piece.', 1100, 'standard', '#ffd36b', '#ff8a5c', 1),
    (2, 'BK-3002', 'Spy x Family', 10, 'A spy, an assassin and a telepath pose as a family — and hide it from each other.', 140, 'standard', '#ffd6e4', '#f7a1c4', 1),
    (3, 'BK-3003', 'Dandadan', 10, 'Ghosts, aliens and a wild high-school romance collide in this supernatural hit.', 180, 'standard', '#c8f0ff', '#ff9ecb', 1),
    (4, 'BK-3004', 'Tower of God', 11, 'Bam climbs a mysterious tower to follow the girl he loves. Free chapters on WEBTOON.', 600, 'standard', '#c9c5ff', '#8fb6ff', 1),
    (5, 'BK-3005', 'Lore Olympus', 11, 'A modern, glittering retelling of Hades and Persephone.', 250, 'standard', '#f5c6ff', '#ffa6c9', 1),
    (6, 'BK-3006', 'True Beauty', 11, 'A girl who masters makeup hides her bare-faced self at a new school.', 300, 'standard', '#ffd0e2', '#ffb0a8', 1),
    (7, 'BK-3007', 'The Thirty-Nine Steps', 12, 'Richard Hannay is hunted across Scotland after a spy dies in his flat.', 160, 'standard', '#d7e0ea', '#8aa0b8', 1),
    (8, 'BK-3008', 'The Woman in White', 12, 'A midnight encounter on a lonely road launches a tangled Victorian conspiracy.', 600, 'standard', '#eeeaf6', '#b9b0d8', 1),
    (9, 'BK-3009', 'Dracula', 13, 'Count Dracula travels from Transylvania to England, and a band of friends fights back.', 450, 'standard', '#5a1f35', '#2a0f1d', 1),
    (10, 'BK-3010', 'Frankenstein', 13, 'A scientist''s creature turns against its creator in the original sci-fi horror.', 280, 'standard', '#334a4a', '#1b2a2a', 1),
    (11, 'BK-3011', 'Strange Case of Dr Jekyll and Mr Hyde', 13, 'A respectable doctor and a monstrous alter ego share one body.', 90, 'standard', '#4a3a66', '#241a3a', 1),
    (12, 'BK-3012', 'The Turn of the Screw', 13, 'A governess fears the children in her care are haunted.', 120, 'standard', '#3b3b55', '#1d1d30', 1),
    (13, 'BK-3013', 'A Tale of Two Cities', 14, 'Love and sacrifice between London and Paris during the French Revolution.', 400, 'standard', '#ffd9c2', '#e89b7a', 1),
    (14, 'BK-3014', 'The Three Musketeers', 14, 'D''Artagnan joins three swordsmen in 17th-century France: all for one!', 700, 'standard', '#c8dcff', '#7ea3e6', 1),
    (15, 'BK-3015', 'Ivanhoe', 14, 'Knights, tournaments and Robin Hood in medieval England.', 500, 'standard', '#d6ecc9', '#93c47d', 1),
    (16, 'BK-3016', 'The Hound of the Baskervilles', 15, 'Sherlock Holmes investigates a spectral hound on the foggy moors.', 250, 'standard', '#c9d4c0', '#7d9a78', 1),
    (17, 'BK-3017', 'The Adventures of Sherlock Holmes', 15, 'Twelve classic cases from Baker Street.', 300, 'standard', '#ffe3a3', '#e7b955', 1),
    (18, 'BK-3018', 'The Moonstone', 15, 'A cursed diamond vanishes — considered the first detective novel in English.', 520, 'standard', '#e4dcff', '#a99be8', 1),
    (19, 'BK-3019', 'Pride and Prejudice', 16, 'Witty Elizabeth Bennet meets proud Mr. Darcy.', 320, 'standard', '#fbc9d9', '#f19bb8', 1),
    (20, 'BK-3020', 'Anne of Green Gables', 16, 'A spirited orphan wins every heart in Avonlea.', 340, 'standard', '#ffd6c2', '#f7a98a', 1),
    (21, 'BK-3021', 'The Secret Garden', 16, 'A lonely girl discovers a hidden garden that heals.', 270, 'standard', '#c8f0dd', '#8fdcb8', 1),
    (22, 'BK-3022', 'Little Women', 16, 'Four March sisters grow up and dream big.', 500, 'standard', '#e6d6fa', '#c9aef0', 1),
    (23, 'BK-3023', 'Alice''s Adventures in Wonderland', 16, 'A curious girl tumbles into a topsy-turvy world.', 120, 'standard', '#cde8ff', '#a9c8f5', 1),
    (24, 'BK-3024', 'The Wind in the Willows', 16, 'Riverbank adventures with Mole, Ratty, Badger and Mr. Toad.', 250, 'standard', '#e0f5c9', '#b5e08e', 1),
    (25, 'BK-3025', 'The Art of War', 2, 'Ancient strategy wisdom: win without fighting, lead with calm.', 100, 'standard', '#ffe3b3', '#f0b36a', 1),
    (26, 'BK-3026', 'Meditations', 2, 'A Roman emperor''s private notes on calm, duty and resilience.', 200, 'standard', '#dfe8f7', '#a8bde3', 1),
    (27, 'BK-3027', 'Walden', 2, 'Two years of simple living by a pond — a classic on mindful life.', 300, 'standard', '#d6f0d0', '#8fcf8a', 1),
    (28, 'BK-3028', 'The Prince', 2, 'A sharp, famous guide to power and politics.', 120, 'standard', '#f7d4d4', '#e39a9a', 1),
    (29, 'BK-3029', 'The Autobiography of Benjamin Franklin', 2, 'Habits, curiosity and self-improvement from a founding father.', 250, 'standard', '#fde9c0', '#efc46e', 1),
    (30, 'BK-3030', 'As a Man Thinketh', 2, 'A tiny classic on how thoughts shape your life.', 60, 'standard', '#f0dcff', '#c9a6f0', 1),
    (31, 'BK-1042', 'Clean Code', 17, 'A handbook of agile software craftsmanship.', 464, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (32, 'BK-1043', 'The Alchemist', 1, 'A shepherd boy follows his dream across the desert.', 208, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (33, 'BK-1044', 'Shadow Slave', 1, 'A web-novel epic about a boy bound to a mysterious shadow.', 1000, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (34, 'BK-0579', 'Six of Crows', 1, 'Six outcasts attempt an impossible heist.', 465, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (35, 'BK-1045', 'AI Basics', 17, 'A friendly introduction to artificial intelligence.', 280, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (36, 'BK-1046', 'C Programming', 17, 'Learn C from the ground up.', 350, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (37, 'BK-1047', 'Java Programming', 17, 'Object-oriented programming with Java.', 420, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (38, 'BK-1048', 'Fundamental Calculus', 18, 'Limits, derivatives and integrals explained clearly.', 380, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (39, 'BK-1049', 'Biology II', 19, 'Cell biology, genetics and evolution.', 510, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (40, 'BK-1050', 'Coding For Beginners', 17, 'Your first steps into code.', 260, 'standard', '#cfe0ff', '#8fb6ff', 1),
    (41, 'BK-4001', 'Coastal Ecologies, Vol. 3', 19, 'Field studies of coastal ecosystems.', 320, 'standard', '#c8f0dd', '#8fdcb8', 1),
    (42, 'BK-4002', 'The Long Monsoon', 1, 'A literary novel set through one endless monsoon.', 290, 'standard', '#c8dcff', '#7ea3e6', 1),
    (43, 'BK-4003', 'Quarterly Review - Q2', 6, 'The library''s quarterly review, second quarter.', 96, 'standard', '#ffe3a3', '#e7b955', 1),
    (44, 'BK-4004', 'Field Notes: Sundarbans', 2, 'Notes and verses from the Sundarbans.', 180, 'standard', '#d6f0d0', '#8fcf8a', 1),
    (45, 'BK-5001', 'The Medici Ledgers', 2, 'Banking and power in Renaissance Florence.', 340, 'standard', '#fde9c0', '#efc46e', 1),
    (46, 'BK-5002', 'Women''s Speaking Justified', 7, 'A 17th-century pamphlet. Viewing by appointment only.', 60, 'rare', '#f0dcff', '#c9a6f0', 1),
    (47, 'BK-5003', 'Songs of the Delta', 1, 'A collection of poems from the river delta.', 96, 'standard', '#d6f1ee', '#7fd3c0', 1);

  INSERT INTO book_authors (book_id, author_id) VALUES
    (1, 6),
    (2, 7),
    (3, 8),
    (4, 9),
    (5, 10),
    (6, 11),
    (7, 12),
    (8, 13),
    (9, 14),
    (10, 15),
    (11, 16),
    (12, 17),
    (13, 18),
    (14, 19),
    (15, 20),
    (16, 21),
    (17, 21),
    (18, 13),
    (19, 22),
    (20, 23),
    (21, 24),
    (22, 25),
    (23, 26),
    (24, 27),
    (25, 28),
    (26, 29),
    (27, 30),
    (28, 31),
    (29, 32),
    (30, 33),
    (31, 34),
    (32, 35),
    (33, 36),
    (34, 37),
    (35, 38),
    (36, 39),
    (37, 40),
    (38, 2),
    (39, 41),
    (40, 42),
    (41, 2),
    (42, 1),
    (44, 4),
    (45, 3),
    (46, 5),
    (47, 4);

  INSERT INTO book_tags (book_id, tag) VALUES
    (1, 'shonen'),
    (1, 'adventure'),
    (2, 'comedy'),
    (2, 'action'),
    (3, 'supernatural'),
    (3, 'action'),
    (4, 'fantasy'),
    (4, 'webtoon'),
    (5, 'romance'),
    (5, 'myth'),
    (6, 'romance'),
    (6, 'school'),
    (7, 'spy'),
    (7, 'chase'),
    (8, 'suspense'),
    (8, 'victorian'),
    (9, 'vampire'),
    (9, 'gothic'),
    (10, 'gothic'),
    (10, 'classic'),
    (11, 'gothic'),
    (11, 'short'),
    (12, 'ghost'),
    (12, 'gothic'),
    (13, 'revolution'),
    (13, 'classic'),
    (14, 'adventure'),
    (14, 'france'),
    (15, 'medieval'),
    (15, 'romance'),
    (16, 'sherlock'),
    (16, 'mystery'),
    (17, 'sherlock'),
    (17, 'short stories'),
    (18, 'mystery'),
    (18, 'victorian'),
    (19, 'romance'),
    (19, 'classic'),
    (20, 'cozy'),
    (20, 'coming-of-age'),
    (21, 'garden'),
    (21, 'children'),
    (22, 'family'),
    (22, 'classic'),
    (23, 'fantasy'),
    (23, 'whimsy'),
    (24, 'cozy'),
    (24, 'animals'),
    (25, 'strategy'),
    (25, 'philosophy'),
    (26, 'stoicism'),
    (26, 'philosophy'),
    (27, 'nature'),
    (27, 'essays'),
    (28, 'politics'),
    (28, 'history'),
    (29, 'memoir'),
    (29, 'self-improvement'),
    (30, 'self-help'),
    (30, 'mindset'),
    (31, 'programming'),
    (31, 'software'),
    (32, 'fable'),
    (32, 'journey'),
    (33, 'fantasy'),
    (33, 'web novel'),
    (34, 'fantasy'),
    (34, 'heist'),
    (35, 'ai'),
    (35, 'beginner'),
    (36, 'c'),
    (36, 'programming'),
    (37, 'java'),
    (37, 'programming'),
    (38, 'calculus'),
    (38, 'maths'),
    (39, 'biology'),
    (39, 'textbook'),
    (40, 'coding'),
    (40, 'beginner'),
    (41, 'ecology'),
    (41, 'journal'),
    (42, 'literary'),
    (42, 'novel'),
    (43, 'periodical'),
    (44, 'nature'),
    (44, 'notes'),
    (45, 'history'),
    (45, 'renaissance'),
    (46, 'rare'),
    (46, '17th century'),
    (47, 'poetry');

  INSERT INTO book_copies (copy_id, book_id, copy_no, barcode, shelf_location, book_condition, status, acquired_on) VALUES
    (1, 7, 1, 'CP-BK-3007-01', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (2, 7, 2, 'CP-BK-3007-02', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (3, 7, 3, 'CP-BK-3007-03', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (4, 7, 4, 'CP-BK-3007-04', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (5, 7, 5, 'CP-BK-3007-05', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (6, 8, 1, 'CP-BK-3008-01', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (7, 8, 2, 'CP-BK-3008-02', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (8, 8, 3, 'CP-BK-3008-03', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (9, 8, 4, 'CP-BK-3008-04', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (10, 8, 5, 'CP-BK-3008-05', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (11, 8, 6, 'CP-BK-3008-06', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (12, 8, 7, 'CP-BK-3008-07', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (13, 9, 1, 'CP-BK-3009-01', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (14, 9, 2, 'CP-BK-3009-02', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (15, 9, 3, 'CP-BK-3009-03', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (16, 9, 4, 'CP-BK-3009-04', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (17, 10, 1, 'CP-BK-3010-01', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (18, 10, 2, 'CP-BK-3010-02', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (19, 10, 3, 'CP-BK-3010-03', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (20, 10, 4, 'CP-BK-3010-04', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (21, 10, 5, 'CP-BK-3010-05', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (22, 10, 6, 'CP-BK-3010-06', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (23, 11, 1, 'CP-BK-3011-01', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (24, 11, 2, 'CP-BK-3011-02', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (25, 11, 3, 'CP-BK-3011-03', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (26, 12, 1, 'CP-BK-3012-01', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (27, 12, 2, 'CP-BK-3012-02', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (28, 12, 3, 'CP-BK-3012-03', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (29, 12, 4, 'CP-BK-3012-04', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (30, 12, 5, 'CP-BK-3012-05', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (31, 13, 1, 'CP-BK-3013-01', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (32, 13, 2, 'CP-BK-3013-02', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (33, 13, 3, 'CP-BK-3013-03', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (34, 13, 4, 'CP-BK-3013-04', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (35, 13, 5, 'CP-BK-3013-05', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (36, 13, 6, 'CP-BK-3013-06', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (37, 13, 7, 'CP-BK-3013-07', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (38, 14, 1, 'CP-BK-3014-01', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (39, 14, 2, 'CP-BK-3014-02', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (40, 14, 3, 'CP-BK-3014-03', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (41, 14, 4, 'CP-BK-3014-04', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (42, 15, 1, 'CP-BK-3015-01', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (43, 15, 2, 'CP-BK-3015-02', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (44, 15, 3, 'CP-BK-3015-03', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (45, 15, 4, 'CP-BK-3015-04', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (46, 15, 5, 'CP-BK-3015-05', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (47, 15, 6, 'CP-BK-3015-06', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (48, 16, 1, 'CP-BK-3016-01', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (49, 16, 2, 'CP-BK-3016-02', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (50, 16, 3, 'CP-BK-3016-03', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (51, 17, 1, 'CP-BK-3017-01', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (52, 17, 2, 'CP-BK-3017-02', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (53, 17, 3, 'CP-BK-3017-03', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (54, 17, 4, 'CP-BK-3017-04', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (55, 17, 5, 'CP-BK-3017-05', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (56, 18, 1, 'CP-BK-3018-01', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (57, 18, 2, 'CP-BK-3018-02', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (58, 18, 3, 'CP-BK-3018-03', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (59, 18, 4, 'CP-BK-3018-04', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (60, 18, 5, 'CP-BK-3018-05', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (61, 18, 6, 'CP-BK-3018-06', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (62, 18, 7, 'CP-BK-3018-07', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (63, 19, 1, 'CP-BK-3019-01', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (64, 19, 2, 'CP-BK-3019-02', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (65, 19, 3, 'CP-BK-3019-03', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (66, 19, 4, 'CP-BK-3019-04', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (67, 20, 1, 'CP-BK-3020-01', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (68, 20, 2, 'CP-BK-3020-02', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (69, 20, 3, 'CP-BK-3020-03', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (70, 20, 4, 'CP-BK-3020-04', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (71, 20, 5, 'CP-BK-3020-05', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (72, 20, 6, 'CP-BK-3020-06', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (73, 21, 1, 'CP-BK-3021-01', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (74, 21, 2, 'CP-BK-3021-02', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (75, 21, 3, 'CP-BK-3021-03', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (76, 22, 1, 'CP-BK-3022-01', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (77, 22, 2, 'CP-BK-3022-02', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (78, 22, 3, 'CP-BK-3022-03', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (79, 22, 4, 'CP-BK-3022-04', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (80, 22, 5, 'CP-BK-3022-05', 'B-13', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (81, 23, 1, 'CP-BK-3023-01', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (82, 23, 2, 'CP-BK-3023-02', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (83, 23, 3, 'CP-BK-3023-03', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (84, 23, 4, 'CP-BK-3023-04', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (85, 23, 5, 'CP-BK-3023-05', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (86, 23, 6, 'CP-BK-3023-06', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (87, 23, 7, 'CP-BK-3023-07', 'B-14', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (88, 24, 1, 'CP-BK-3024-01', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (89, 24, 2, 'CP-BK-3024-02', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (90, 24, 3, 'CP-BK-3024-03', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (91, 24, 4, 'CP-BK-3024-04', 'B-15', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (92, 25, 1, 'CP-BK-3025-01', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (93, 25, 2, 'CP-BK-3025-02', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (94, 25, 3, 'CP-BK-3025-03', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (95, 25, 4, 'CP-BK-3025-04', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (96, 25, 5, 'CP-BK-3025-05', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (97, 25, 6, 'CP-BK-3025-06', 'B-16', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (98, 26, 1, 'CP-BK-3026-01', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (99, 26, 2, 'CP-BK-3026-02', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (100, 26, 3, 'CP-BK-3026-03', 'B-17', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (101, 27, 1, 'CP-BK-3027-01', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (102, 27, 2, 'CP-BK-3027-02', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (103, 27, 3, 'CP-BK-3027-03', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (104, 27, 4, 'CP-BK-3027-04', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (105, 27, 5, 'CP-BK-3027-05', 'B-18', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (106, 28, 1, 'CP-BK-3028-01', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (107, 28, 2, 'CP-BK-3028-02', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (108, 28, 3, 'CP-BK-3028-03', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (109, 28, 4, 'CP-BK-3028-04', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (110, 28, 5, 'CP-BK-3028-05', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (111, 28, 6, 'CP-BK-3028-06', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (112, 28, 7, 'CP-BK-3028-07', 'B-10', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (113, 29, 1, 'CP-BK-3029-01', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (114, 29, 2, 'CP-BK-3029-02', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (115, 29, 3, 'CP-BK-3029-03', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (116, 29, 4, 'CP-BK-3029-04', 'B-11', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (117, 30, 1, 'CP-BK-3030-01', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (118, 30, 2, 'CP-BK-3030-02', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (119, 30, 3, 'CP-BK-3030-03', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (120, 30, 4, 'CP-BK-3030-04', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (121, 30, 5, 'CP-BK-3030-05', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (122, 30, 6, 'CP-BK-3030-06', 'B-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (123, 31, 1, 'CP-BK-1042-01', 'A-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (124, 31, 2, 'CP-BK-1042-02', 'A-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (125, 31, 3, 'CP-BK-1042-03', 'A-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (126, 31, 4, 'CP-BK-1042-04', 'A-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (127, 31, 5, 'CP-BK-1042-05', 'A-12', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (128, 32, 1, 'CP-BK-1043-01', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (129, 32, 2, 'CP-BK-1043-02', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (130, 32, 3, 'CP-BK-1043-03', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (131, 32, 4, 'CP-BK-1043-04', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (132, 32, 5, 'CP-BK-1043-05', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (133, 32, 6, 'CP-BK-1043-06', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (134, 32, 7, 'CP-BK-1043-07', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (135, 32, 8, 'CP-BK-1043-08', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (136, 32, 9, 'CP-BK-1043-09', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (137, 32, 10, 'CP-BK-1043-10', 'C-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (138, 33, 1, 'CP-BK-1044-01', 'E-09', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (139, 33, 2, 'CP-BK-1044-02', 'E-09', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (140, 33, 3, 'CP-BK-1044-03', 'E-09', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (141, 34, 1, 'CP-BK-0579-01', 'B-06', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (142, 34, 2, 'CP-BK-0579-02', 'B-06', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (143, 34, 3, 'CP-BK-0579-03', 'B-06', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (144, 35, 1, 'CP-BK-1045-01', 'D-04', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (145, 35, 2, 'CP-BK-1045-02', 'D-04', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (146, 35, 3, 'CP-BK-1045-03', 'D-04', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (147, 36, 1, 'CP-BK-1046-01', 'D-05', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (148, 36, 2, 'CP-BK-1046-02', 'D-05', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (149, 36, 3, 'CP-BK-1046-03', 'D-05', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (150, 37, 1, 'CP-BK-1047-01', 'D-06', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (151, 37, 2, 'CP-BK-1047-02', 'D-06', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (152, 37, 3, 'CP-BK-1047-03', 'D-06', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (153, 38, 1, 'CP-BK-1048-01', 'C-05', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (154, 38, 2, 'CP-BK-1048-02', 'C-05', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (155, 39, 1, 'CP-BK-1049-01', 'F-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (156, 39, 2, 'CP-BK-1049-02', 'F-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (157, 39, 3, 'CP-BK-1049-03', 'F-02', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (158, 40, 1, 'CP-BK-1050-01', 'B-08', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (159, 40, 2, 'CP-BK-1050-02', 'B-08', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (160, 45, 1, 'CP-BK-5001-01', 'G-01', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (161, 45, 2, 'CP-BK-5001-02', 'G-01', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (162, 46, 1, 'CP-BK-5002-01', 'RARE-01', 'excellent', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (163, 47, 1, 'CP-BK-5003-01', 'G-03', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY),
    (164, 47, 2, 'CP-BK-5003-02', 'G-03', 'good', 'in_service', CURDATE() - INTERVAL 400 DAY);

  INSERT INTO digital_editions (edition_id, book_id, format, hosting, file_size_mb, status, file_path, external_url, source_name, max_concurrent_licenses, uploaded_by, uploaded_at) VALUES
    (1, 1, 'WEB', 'external', NULL, 'Ready', NULL, 'https://mangaplus.shueisha.co.jp/', 'MANGA Plus', NULL, 1, NOW() - INTERVAL 300 DAY),
    (2, 2, 'WEB', 'external', NULL, 'Ready', NULL, 'https://mangaplus.shueisha.co.jp/', 'MANGA Plus', NULL, 1, NOW() - INTERVAL 300 DAY),
    (3, 3, 'WEB', 'external', NULL, 'Ready', NULL, 'https://mangaplus.shueisha.co.jp/', 'MANGA Plus', NULL, 1, NOW() - INTERVAL 300 DAY),
    (4, 4, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.webtoons.com/en/', 'WEBTOON', NULL, 1, NOW() - INTERVAL 300 DAY),
    (5, 5, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.webtoons.com/en/', 'WEBTOON', NULL, 1, NOW() - INTERVAL 300 DAY),
    (6, 6, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.webtoons.com/en/', 'WEBTOON', NULL, 1, NOW() - INTERVAL 300 DAY),
    (7, 7, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/558', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (8, 8, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/583', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (9, 9, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/345', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (10, 10, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/84', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (11, 11, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/43', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (12, 12, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/209', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (13, 13, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/98', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (14, 14, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/1257', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (15, 15, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/82', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (16, 16, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/2852', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (17, 17, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/1661', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (18, 18, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/155', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (19, 19, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/1342', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (20, 20, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/45', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (21, 21, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/113', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (22, 22, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/514', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (23, 23, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/11', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (24, 24, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/289', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (25, 25, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/132', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (26, 26, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/2680', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (27, 27, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/205', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (28, 28, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/1232', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (29, 29, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/148', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (30, 30, 'WEB', 'external', NULL, 'Ready', NULL, 'https://www.gutenberg.org/ebooks/4507', 'Project Gutenberg', NULL, 1, NOW() - INTERVAL 300 DAY),
    (31, 41, 'PDF', 'hosted', 86, 'Ready', '/storage/digital/31.pdf', NULL, 'Library', 5, 3, NOW() - INTERVAL 1 DAY - INTERVAL 3 HOUR),
    (32, 42, 'EPUB', 'hosted', 12, 'Ready', '/storage/digital/32.epub', NULL, 'Library', 5, 3, NOW() - INTERVAL 40 DAY),
    (33, 43, 'PDF', 'hosted', 120, 'Processing', '/storage/digital/33.pdf', NULL, 'Library', 3, 3, NOW() - INTERVAL 2 DAY),
    (34, 44, 'PDF', 'hosted', 65, 'Ready', '/storage/digital/34.pdf', NULL, 'Library', NULL, 3, NOW() - INTERVAL 60 DAY);

  INSERT INTO time_slots (slot_id, label, start_time, end_time) VALUES
    (1, '09:00–11:00', '09:00:00', '11:00:00'),
    (2, '11:00–13:00', '11:00:00', '13:00:00'),
    (3, '14:00–16:00', '14:00:00', '16:00:00'),
    (4, '16:00–18:00', '16:00:00', '18:00:00');

  INSERT INTO appointment_types (type_id, name, description) VALUES
    (1, 'Rare collection viewing', 'See items from the Rare & Special Collections'),
    (2, 'Librarian research consult', 'One-to-one research help from a librarian'),
    (3, 'Private study room', 'A quiet private room');

  INSERT INTO user_preferences (user_id, ui_theme, click_sound, study_theme_key, current_book_id) VALUES
    (4, 'light', 1, 'pink', 21),
    (5, 'light', 1, 'pink', NULL),
    (6, 'light', 1, 'pink', NULL),
    (7, 'dark', 1, 'star', 1),
    (8, 'light', 1, 'pink', NULL),
    (9, 'light', 1, 'pink', NULL),
    (10, 'light', 1, 'pink', NULL),
    (11, 'light', 1, 'pink', NULL),
    (12, 'light', 1, 'pink', NULL);

  INSERT INTO reservations (reservation_id, user_id, book_id, copy_id, edition_id, mode, status, slot_date, slot_id, desk_label, queue_position, created_at, expires_at, picked_up_at, handled_by) VALUES
    (1, 5, 35, 144, NULL, 'borrow_pickup', 'reserved', CURDATE(), 4, 'Desk 2', NULL, NOW() - INTERVAL 5 HOUR, NOW() + INTERVAL 1 HOUR + INTERVAL 40 MINUTE, NULL, 2),
    (2, 6, 36, 147, NULL, 'borrow_pickup', 'reserved', CURDATE() + INTERVAL 1 DAY, 1, 'Desk 2', NULL, NOW() - INTERVAL 3 HOUR, NOW() + INTERVAL 20 HOUR, NULL, 2),
    (3, 4, 32, 128, NULL, 'borrow_pickup', 'expired', CURDATE(), 1, 'Desk 2', NULL, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 49 MINUTE, NULL, 2),
    (4, 5, 35, 146, NULL, 'borrow_pickup', 'expired', CURDATE(), 1, 'Desk 2', NULL, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 2 HOUR - INTERVAL 3 MINUTE, NULL, 2),
    (5, 12, 33, 138, NULL, 'borrow_pickup', 'picked_up', CURDATE() - INTERVAL 2 DAY, 2, 'Desk 2', NULL, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 47 HOUR, NOW() - INTERVAL 2 DAY, 2),
    (6, 7, 19, 63, NULL, 'read_in_library', 'reserved', CURDATE() + INTERVAL 1 DAY, 3, 'Priority seat P2', NULL, NOW() - INTERVAL 8 HOUR, NOW() + INTERVAL 30 HOUR, NULL, NULL),
    (7, 8, 10, 17, NULL, 'read_in_library', 'reserved', CURDATE() + INTERVAL 2 DAY, 2, 'Desk 5', NULL, NOW() - INTERVAL 2 HOUR, NOW() + INTERVAL 2 DAY + INTERVAL 2 HOUR, NULL, NULL),
    (8, 5, 41, NULL, 31, 'queue', 'queued', NULL, NULL, NULL, 1, NOW() - INTERVAL 6 DAY, NULL, NULL, NULL),
    (9, 8, 41, NULL, 31, 'queue', 'queued', NULL, NULL, NULL, 2, NOW() - INTERVAL 4 DAY, NULL, NULL, NULL),
    (10, 9, 41, NULL, 31, 'queue', 'queued', NULL, NULL, NULL, 3, NOW() - INTERVAL 2 DAY, NULL, NULL, NULL),
    (11, 10, 42, NULL, 32, 'queue', 'queued', NULL, NULL, NULL, 1, NOW() - INTERVAL 3 DAY, NULL, NULL, NULL),
    (12, 6, 42, NULL, 32, 'queue', 'queued', NULL, NULL, NULL, 2, NOW() - INTERVAL 1 DAY, NULL, NULL, NULL),
    (13, 12, 34, NULL, NULL, 'queue', 'queued', NULL, NULL, NULL, 1, NOW() - INTERVAL 2 DAY, NULL, NULL, NULL),
    (14, 4, 34, NULL, NULL, 'queue', 'queued', NULL, NULL, NULL, 2, NOW() - INTERVAL 1 DAY, NULL, NULL, NULL);

  INSERT INTO loans (loan_id, user_id, copy_id, edition_id, reservation_id, borrowed_at, due_on, returned_at, returned_condition, status, issued_by, received_by, notes) VALUES
    (1, 4, 88, NULL, NULL, NOW() - INTERVAL 10 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 2 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (2, 4, 76, NULL, NULL, NOW() - INTERVAL 35 DAY - INTERVAL 1 HOUR, CURDATE() - INTERVAL 23 DAY, NOW() - INTERVAL 25 DAY, 'good', 'returned', 2, 2, NULL),
    (3, 4, 73, NULL, NULL, NOW() - INTERVAL 30 DAY - INTERVAL 1 HOUR, CURDATE() - INTERVAL 18 DAY, NOW() - INTERVAL 16 DAY, 'good', 'returned', 2, 2, NULL),
    (4, 4, 155, NULL, NULL, NOW() - INTERVAL 22 DAY - INTERVAL 1 HOUR, CURDATE() - INTERVAL 10 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (5, 4, 129, NULL, NULL, NOW() - INTERVAL 40 DAY - INTERVAL 1 HOUR, CURDATE() - INTERVAL 28 DAY, NOW() - INTERVAL 21 DAY, 'good', 'returned', 2, 2, NULL),
    (6, 5, 145, NULL, NULL, NOW() - INTERVAL 27 DAY - INTERVAL 1 HOUR, CURDATE() - INTERVAL 13 DAY, NOW() - INTERVAL 8 DAY, 'good', 'returned', 2, 2, NULL),
    (7, 6, 148, NULL, NULL, NOW() - INTERVAL 30 DAY - INTERVAL 1 HOUR, CURDATE() - INTERVAL 18 DAY, NOW() - INTERVAL 16 DAY, 'good', 'returned', 2, 2, NULL),
    (8, 6, 150, NULL, NULL, NOW() - INTERVAL 10 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 2 DAY, NOW() - INTERVAL 1 HOUR, 'good', 'returned', 2, 2, NULL),
    (9, 7, 123, NULL, NULL, NOW() - INTERVAL 5 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 16 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (10, 10, 13, NULL, NULL, NOW() - INTERVAL 3 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 11 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (11, 12, 138, NULL, 5, NOW() - INTERVAL 2 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 10 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (12, 9, 141, NULL, NULL, NOW() - INTERVAL 6 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 6 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (13, 11, 142, NULL, NULL, NOW() - INTERVAL 9 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 3 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (14, 10, 143, NULL, NULL, NOW() - INTERVAL 4 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 10 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (15, 8, 158, NULL, NULL, NOW() - INTERVAL 7 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 7 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (16, 9, 159, NULL, NULL, NOW() - INTERVAL 5 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 7 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (17, 7, NULL, 31, NULL, NOW() - INTERVAL 3 DAY - INTERVAL 1 HOUR, CURDATE() + INTERVAL 11 DAY, NULL, NULL, 'active', 2, NULL, NULL),
    (18, 5, NULL, 32, NULL, NOW() - INTERVAL 30 DAY - INTERVAL 1 HOUR, CURDATE() - INTERVAL 16 DAY, NOW() - INTERVAL 12 DAY, NULL, 'returned', 3, 3, NULL);

  INSERT INTO fines (fine_id, loan_id, user_id, days_late, amount, status, created_at, resolved_by, resolved_at, note) VALUES
    (1, 3, 4, 2, 10, 'unpaid', NOW() - INTERVAL 16 DAY, NULL, NULL, 'Late return'),
    (2, 5, 4, 7, 35, 'unpaid', NOW() - INTERVAL 21 DAY, NULL, NULL, 'Late return'),
    (3, 6, 5, 5, 12, 'unpaid', NOW() - INTERVAL 8 DAY, NULL, NULL, 'Late return (1 grace day applied)'),
    (4, 7, 6, 2, 10, 'cleared', NOW() - INTERVAL 16 DAY, 2, NOW() - INTERVAL 5 DAY, 'Paid at desk'),
    (5, 18, 5, 4, 3, 'cleared', NOW() - INTERVAL 12 DAY, 3, NOW() - INTERVAL 10 DAY, 'Paid at desk');

  INSERT INTO appointments (user_id, type_id, appointment_date, slot_id, note, status, handled_by) VALUES
    (7, 1, CURDATE() + INTERVAL 2 DAY, 3, 'Women''s Speaking Justified', 'booked', 2),
    (7, 3, CURDATE() + INTERVAL 5 DAY, 1, 'Exam preparation', 'booked', NULL),
    (7, 2, CURDATE() - INTERVAL 10 DAY, 2, 'Thesis sources', 'completed', 2);

  INSERT INTO reading_progress (user_id, book_id, current_page, status, started_at) VALUES
    (4, 21, 120, 'reading', NOW() - INTERVAL 9 DAY),
    (4, 19, 45, 'reading', NOW() - INTERVAL 5 DAY),
    (4, 23, 120, 'finished', NOW() - INTERVAL 30 DAY),
    (7, 1, 300, 'reading', NOW() - INTERVAL 20 DAY),
    (10, 9, 150, 'reading', NOW() - INTERVAL 3 DAY),
    (5, 19, 320, 'finished', NOW() - INTERVAL 45 DAY);

  INSERT INTO reading_sessions (user_id, book_id, edition_id, page_from, page_to, seconds, started_at) VALUES
    (4, 21, NULL, 100, 120, 1500, NOW() - INTERVAL 1 DAY - INTERVAL 2 HOUR),
    (4, 19, NULL, 30, 45, 900, NOW() - INTERVAL 3 DAY),
    (4, 21, NULL, 120, 120, 1860, NOW() - INTERVAL 3 HOUR),
    (7, 41, 31, 1, 40, 2700, NOW() - INTERVAL 2 HOUR),
    (7, 1, NULL, 280, 300, 1200, NOW() - INTERVAL 5 HOUR),
    (10, 9, NULL, 120, 150, 1800, NOW() - INTERVAL 4 HOUR),
    (5, 42, 32, 10, 52, 3000, NOW() - INTERVAL 1 HOUR),
    (8, 44, 34, 1, 22, 1500, NOW() - INTERVAL 6 HOUR),
    (7, 41, 31, 40, 75, 2400, NOW() - INTERVAL 2 DAY),
    (5, 42, 32, 1, 10, 900, NOW() - INTERVAL 4 DAY),
    (9, 44, 34, 1, 15, 1100, NOW() - INTERVAL 5 DAY);

  INSERT INTO study_daily (user_id, study_date, focus_seconds) VALUES
    (4, CURDATE(), 1860),
    (4, CURDATE() - INTERVAL 1 DAY, 5400),
    (7, CURDATE(), 3900),
    (7, CURDATE() - INTERVAL 1 DAY, 7200);

  INSERT INTO wishlists (user_id, book_id) VALUES
    (4, 4),
    (7, 16);

  INSERT INTO reviews (book_id, user_id, rating, review_text, created_at) VALUES
    (19, 5, 5, 'Witty, sparkling and full of heart — Elizabeth is unforgettable.', '2026-07-14 12:00:00'),
    (22, 8, 5, 'A cozy classic for slow Sunday afternoons.', '2026-06-30 12:00:00'),
    (9, 9, 4, 'Spooky and atmospheric. Read it with the lights on!', '2026-06-05 12:00:00'),
    (17, 10, 5, 'Holmes at his best — perfect for study breaks.', '2026-05-22 12:00:00'),
    (1, 7, 5, 'Epic adventure with so much heart.', '2026-05-10 12:00:00'),
    (25, 11, 5, 'Short, sharp and still wise today.', '2026-04-02 12:00:00');

  INSERT INTO swap_offers (from_user_id, to_user_id, offered_title, requested_title, status, created_at) VALUES
    (9, 4, 'Rebecca', 'Persuasion', 'pending', NOW() - INTERVAL 2 DAY),
    (11, 4, 'Dracula', 'Persuasion', 'pending', NOW() - INTERVAL 1 DAY);

  INSERT INTO notifications (user_id, audience, type, message, link_url, is_read, created_at) VALUES
    (4, 'user', 'due_soon', 'The Wind in the Willows is due in 2 days.', '/book/24', 0, NOW() - INTERVAL 6 HOUR),
    (4, 'user', 'reservation', 'Six of Crows: you''re in the queue (position 2).', '/reservation', 0, NOW() - INTERVAL 2 HOUR),
    (4, 'user', 'wishlist', 'Wishlist: Tower of God is ready to read', '/book/4', 0, NOW() - INTERVAL 1 HOUR),
    (4, 'user', 'fine', 'You have unpaid fines of ৳45.', '/lend', 0, NOW() - INTERVAL 1 DAY),
    (7, 'user', 'appointment', 'Rare collection viewing is booked.', '/appointments', 0, NOW() - INTERVAL 1 DAY),
    (NULL, 'librarian', 'stock', 'Coding For Beginners is out of stock at shelf B-08', NULL, 0, NOW() - INTERVAL 1 HOUR),
    (NULL, 'librarian', 'reservation', 'Reservations are about to expire (see Reservations page)', NULL, 0, NOW() - INTERVAL 30 MINUTE),
    (NULL, 'librarian', 'due_soon', 'Returns are due today (see Returns page)', NULL, 0, NOW() - INTERVAL 4 HOUR),
    (NULL, 'admin', 'system', 'Quarterly Review - Q2 is still processing.', NULL, 0, NOW() - INTERVAL 2 DAY);

  INSERT INTO activity_log (user_id, actor_name, action, item, entity_type, entity_id, created_at) VALUES
    (1, 'R. Sharma', 'Added category', 'Graphic Novels', 'category', 9, NOW() - INTERVAL 5 HOUR),
    (1, 'R. Sharma', 'Updated late-fee rule', 'Premium - Digital', 'late_fee_rule', 5, NOW() - INTERVAL 1 DAY - INTERVAL 15 HOUR),
    (3, 'M. Alam', 'Uploaded publication', 'Coastal Ecologies, Vol. 3', 'digital_edition', 31, NOW() - INTERVAL 1 DAY - INTERVAL 3 HOUR),
    (2, 'Mahir Mahmud', 'Reservation approved', 'Faija', 'reservation', 3, NOW() - INTERVAL 50 MINUTE),
    (2, 'Mahir Mahmud', 'Book returned', 'Java Programming returned by Asma', 'loan', 8, NOW() - INTERVAL 1 HOUR),
    (2, 'Mahir Mahmud', 'Shelf location updated', 'Fundamental Calculus to C-05', 'book', 38, NOW() - INTERVAL 3 HOUR);

  INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('library_name', 'Athenaeum', 'Name shown in Admin and Librarian pages'),
    ('public_site_name', 'Petal & Page', 'Name shown on the Guest and Reader pages'),
    ('currency_code', 'BDT', 'All money columns are in this currency'),
    ('currency_symbol', '৳', 'Symbol to display'),
    ('low_stock_threshold', '2', 'Available copies at or below this number = Low stock'),
    ('reservation_hold_hours', '24', 'Hours a reserved copy is held for pick-up'),
    ('digital_storage_capacity_mb', '6500000', 'Digital storage capacity (about 6.2 TB)'),
    ('demo_mode', '1', '1 = demo data loaded; only Admin may reset it');

  INSERT INTO permissions (role, resource, can_view, can_create, can_edit, can_delete) VALUES
    ('admin', 'users', 1, 1, 1, 1),
    ('admin', 'categories', 1, 1, 1, 1),
    ('admin', 'authors', 1, 1, 1, 1),
    ('admin', 'books', 1, 1, 1, 1),
    ('admin', 'book_copies', 1, 1, 1, 1),
    ('admin', 'digital_editions', 1, 1, 1, 1),
    ('admin', 'membership_plans', 1, 1, 1, 1),
    ('admin', 'late_fee_rules', 1, 1, 1, 1),
    ('admin', 'system_settings', 1, 1, 1, 1),
    ('admin', 'reports', 1, 1, 1, 1),
    ('admin', 'demo_data', 1, 1, 1, 1),
    ('admin', 'activity_log', 1, 1, 1, 1),
    ('admin', 'loans', 1, 0, 0, 0),
    ('admin', 'reservations', 1, 0, 0, 0),
    ('admin', 'fines', 1, 0, 0, 0),
    ('admin', 'appointments', 1, 0, 0, 0),
    ('admin', 'notifications', 1, 0, 0, 0),
    ('admin', 'reviews', 1, 0, 0, 0),
    ('admin', 'reading_sessions', 1, 0, 0, 0),
    ('admin', 'wishlists', 1, 0, 0, 0),
    ('librarian', 'books', 1, 0, 0, 0),
    ('librarian', 'categories', 1, 0, 0, 0),
    ('librarian', 'authors', 1, 0, 0, 0),
    ('librarian', 'book_copies', 1, 1, 1, 0),
    ('librarian', 'digital_editions', 1, 0, 0, 0),
    ('librarian', 'users', 1, 0, 0, 0),
    ('librarian', 'loans', 1, 1, 1, 0),
    ('librarian', 'reservations', 1, 1, 1, 0),
    ('librarian', 'fines', 1, 0, 1, 0),
    ('librarian', 'appointments', 1, 0, 1, 0),
    ('librarian', 'notifications', 1, 0, 1, 0),
    ('librarian', 'activity_log', 1, 1, 0, 0),
    ('librarian', 'membership_plans', 1, 0, 0, 0),
    ('librarian', 'late_fee_rules', 1, 0, 0, 0),
    ('librarian', 'demo_data', 0, 0, 0, 0),
    ('reader', 'books', 1, 0, 0, 0),
    ('reader', 'categories', 1, 0, 0, 0),
    ('reader', 'authors', 1, 0, 0, 0),
    ('reader', 'digital_editions', 1, 0, 0, 0),
    ('reader', 'membership_plans', 1, 0, 0, 0),
    ('reader', 'reservations', 1, 1, 1, 1),
    ('reader', 'appointments', 1, 1, 1, 1),
    ('reader', 'wishlists', 1, 1, 0, 1),
    ('reader', 'reviews', 1, 1, 1, 1),
    ('reader', 'reading_sessions', 1, 1, 0, 0),
    ('reader', 'notifications', 1, 0, 1, 0),
    ('reader', 'loans', 1, 0, 0, 0),
    ('reader', 'fines', 1, 0, 0, 0),
    ('reader', 'demo_data', 0, 0, 0, 0);
END$$

-- ---------------------------------------------------------------------------
-- PROCEDURE: ADMIN-ONLY reset. Wipes every table and reloads the original demo data.
--   CALL sp_reset_demo_data(1);     -- 1 = user_id of an active admin
-- ---------------------------------------------------------------------------
CREATE PROCEDURE sp_reset_demo_data(IN p_admin_id INT UNSIGNED)
BEGIN
  DECLARE v_is_admin INT DEFAULT 0;

  SELECT COUNT(*) INTO v_is_admin
    FROM users
   WHERE user_id = p_admin_id AND role = 'admin' AND account_status = 'active';

  IF v_is_admin = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only an active Admin can reset the demo data.';
  END IF;

  SET FOREIGN_KEY_CHECKS = 0;
  TRUNCATE TABLE permissions;
  TRUNCATE TABLE system_settings;
  TRUNCATE TABLE activity_log;
  TRUNCATE TABLE notifications;
  TRUNCATE TABLE swap_offers;
  TRUNCATE TABLE reviews;
  TRUNCATE TABLE wishlists;
  TRUNCATE TABLE study_daily;
  TRUNCATE TABLE reading_sessions;
  TRUNCATE TABLE reading_progress;
  TRUNCATE TABLE appointments;
  TRUNCATE TABLE appointment_types;
  TRUNCATE TABLE fines;
  TRUNCATE TABLE loans;
  TRUNCATE TABLE reservations;
  TRUNCATE TABLE time_slots;
  TRUNCATE TABLE user_preferences;
  TRUNCATE TABLE digital_editions;
  TRUNCATE TABLE book_copies;
  TRUNCATE TABLE book_tags;
  TRUNCATE TABLE book_authors;
  TRUNCATE TABLE books;
  TRUNCATE TABLE authors;
  TRUNCATE TABLE categories;
  TRUNCATE TABLE membership_purchases;
  TRUNCATE TABLE users;
  TRUNCATE TABLE late_fee_rules;
  TRUNCATE TABLE study_themes;
  TRUNCATE TABLE plan_features;
  TRUNCATE TABLE plan_prices;
  TRUNCATE TABLE membership_plans;
  SET FOREIGN_KEY_CHECKS = 1;

  CALL sp_seed_demo_data();

  INSERT INTO activity_log (user_id, actor_name, action, item, entity_type)
  SELECT user_id, full_name, 'Reset demo data', 'All tables restored to the original demo data', 'system'
    FROM users WHERE user_id = p_admin_id;
END$$
DELIMITER ;


-- ---------------------------------------------------------------------------
-- Load the demo data now
-- ---------------------------------------------------------------------------
CALL sp_seed_demo_data();


/* ----------------------------------------------------------------------------
   OPTIONAL (recommended for production, uncomment and change the passwords):
   separate database accounts so the database itself enforces the roles.

   CREATE USER 'lib_guest'@'localhost'     IDENTIFIED BY 'change_me_1';
   GRANT SELECT ON library_db.v_book_catalog      TO 'lib_guest'@'localhost';
   GRANT SELECT ON library_db.v_membership_tiers  TO 'lib_guest'@'localhost';
   GRANT SELECT ON library_db.categories          TO 'lib_guest'@'localhost';

   CREATE USER 'lib_app'@'localhost'       IDENTIFIED BY 'change_me_2';   -- used by the backend
   GRANT SELECT, INSERT, UPDATE, DELETE ON library_db.* TO 'lib_app'@'localhost';

   CREATE USER 'lib_admin'@'localhost'     IDENTIFIED BY 'change_me_3';   -- only for the Admin reset
   GRANT EXECUTE ON PROCEDURE library_db.sp_reset_demo_data TO 'lib_admin'@'localhost';
   ---------------------------------------------------------------------------- */
