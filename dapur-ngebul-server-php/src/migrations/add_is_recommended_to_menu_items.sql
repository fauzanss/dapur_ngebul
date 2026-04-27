ALTER TABLE menu_items
ADD COLUMN is_recommended TINYINT(1) NOT NULL DEFAULT 0 AFTER available;
