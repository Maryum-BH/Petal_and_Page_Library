-- Run this if you have already imported library_db and do not want to re-import it.
USE library_db;
UPDATE users SET role='admin', full_name='Himel', nickname='Himel', username='himel', email='himel@gmail.com', password_hash='$2y$12$uxuCiP9lScv3j9/JVtDcbuBaBFSpVrpAiCrsSj4r491YwWNDW7URe', account_status='active' WHERE user_id=1;
UPDATE users SET role='librarian', full_name='Maryum', nickname='Maryum', username='maryum', email='maryum@gmail.com', password_hash='$2y$12$Z8JRyMSruz8Ly97/H0LFUOWZS4dPOYo6RvWAUlPiMJeqA.Rw1sjkW', account_status='active' WHERE user_id=2;
UPDATE users SET role='reader', full_name='Faija', nickname='Faija', username='faija', email='faija@gmail.com', password_hash='$2y$12$MQA93UasuIUBmJB5Gwht3ObZm7/vsc8a63JQE2gYo0OzOT.5r5oiS', plan_id=1, account_status='active' WHERE user_id=4;
-- Ensure demo accounts are present even if a previous database import had different IDs.
INSERT INTO users (user_id,library_id,role,full_name,nickname,username,email,password_hash,plan_id,account_status,joined_on)
SELECT 1,'STF-0001','admin','Himel','Himel','himel','himel@gmail.com','$2y$12$uxuCiP9lScv3j9/JVtDcbuBaBFSpVrpAiCrsSj4r491YwWNDW7URe',NULL,'active','2022-01-12'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='himel@gmail.com');
INSERT INTO users (user_id,library_id,role,full_name,nickname,username,email,password_hash,plan_id,account_status,joined_on)
SELECT 2,'STF-0002','librarian','Maryum','Maryum','maryum','maryum@gmail.com','$2y$12$Z8JRyMSruz8Ly97/H0LFUOWZS4dPOYo6RvWAUlPiMJeqA.Rw1sjkW',NULL,'active','2023-03-01'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='maryum@gmail.com');
INSERT INTO users (user_id,library_id,role,full_name,nickname,username,email,password_hash,plan_id,account_status,joined_on)
SELECT 4,'LIB-00219','reader','Faija','Faija','faija','faija@gmail.com','$2y$12$MQA93UasuIUBmJB5Gwht3ObZm7/vsc8a63JQE2gYo0OzOT.5r5oiS',1,'active','2024-02-10'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='faija@gmail.com');
