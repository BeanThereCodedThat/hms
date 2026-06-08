-- DMS Database Initialization
-- Tables are created automatically by Hibernate (ddl-auto=update)
-- This file runs only once on first startup

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Grant permissions
GRANT ALL PRIVILEGES ON dms_db.* TO 'dmsuser'@'%';
FLUSH PRIVILEGES;
