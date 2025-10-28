-- Seed menu based on Dapur Ngebul image menu
-- Run after create_tables.sql

USE dapur_ngebul;

INSERT INTO menu_items (sku, name, description, price, category, available)
VALUES
-- Nasi & Ayam
('DNB-RICE-001', 'Nasi Dadar Crispy + Sambal', NULL, 14000.00, 'Nasi', TRUE),
('DNB-RICE-002', 'Nasi Bakar (Cumi/Ayam/Tongkol)', 'Satu varian per hari', 13000.00, 'Nasi', TRUE),
('DNB-CHICK-001', 'Ayam Bakar', NULL, 17000.00, 'Ayam', TRUE),
('DNB-CHICK-001-N', 'Ayam Bakar + Nasi', NULL, 22000.00, 'Paket Ayam', TRUE),
('DNB-CHICK-002', 'Ayam Penyet', NULL, 17000.00, 'Ayam', TRUE),
('DNB-CHICK-002-N', 'Ayam Penyet + Nasi', NULL, 22000.00, 'Paket Ayam', TRUE),
('DNB-CHICK-003', 'Ayam Geprek', NULL, 16000.00, 'Ayam', TRUE),
('DNB-CHICK-003-N', 'Ayam Geprek + Nasi', NULL, 21000.00, 'Paket Ayam', TRUE),
('DNB-CHICK-004', 'Spicy Chicken', NULL, 20000.00, 'Ayam', TRUE),
('DNB-CHICK-004-N', 'Spicy Chicken + Nasi', NULL, 25000.00, 'Paket Ayam', TRUE),
('DNB-CHICK-005', 'Spicy Wings (3pcs)', NULL, 15000.00, 'Ayam', TRUE),
('DNB-CHICK-005-N', 'Spicy Wings (3pcs) + Nasi', NULL, 20000.00, 'Paket Ayam', TRUE),

-- Indomie Jumbo
('DNB-MIE-001', 'Indomie Goreng Jumbo + Sambal', NULL, 10000.00, 'Mie', TRUE),
('DNB-MIE-002', 'Indomie Goreng Jumbo + Ayam Geprek', NULL, 21000.00, 'Mie', TRUE),
('DNB-MIE-003', 'Indomie Goreng Jumbo + Dadar & Sambal', NULL, 16000.00, 'Mie', TRUE),
('DNB-MIE-004', 'Indomie Goreng Jumbo + Ceplok & Sambal', NULL, 16000.00, 'Mie', TRUE),

-- Menu Pendamping / Sampingan
('DNB-SIDE-001', 'Terong Penyet', NULL, 7000.00, 'Pendamping', TRUE),
('DNB-SIDE-002', 'Tahu/Tempe Penyet', NULL, 7000.00, 'Pendamping', TRUE),
('DNB-SIDE-003', 'Telur Dadar/Ceplok', NULL, 7000.00, 'Pendamping', TRUE),
('DNB-SIDE-004', 'Dadar Crispy', NULL, 10000.00, 'Pendamping', TRUE),
('DNB-SIDE-005', 'Tahu Goreng', NULL, 2000.00, 'Gorengan', TRUE),
('DNB-SIDE-006', 'Tempe Goreng', NULL, 2000.00, 'Gorengan', TRUE),
('DNB-SIDE-007', 'Extra Sambal', NULL, 3000.00, 'Tambahan', TRUE),

-- Minuman (Kopi Baba & Teh)
('DNB-DRINK-001', 'Ice Kopi Gula Aren', NULL, 12000.00, 'Minuman', TRUE),
('DNB-DRINK-002', 'Ice Butterscotch Latte', NULL, 15000.00, 'Minuman', TRUE),
('DNB-DRINK-003', 'Ice Coffee Caramel Latte', NULL, 15000.00, 'Minuman', TRUE),
('DNB-DRINK-004', 'Ice Green Milktea', NULL, 15000.00, 'Minuman', TRUE),
('DNB-DRINK-005', 'Teh Manis (Hangat/Es)', NULL, 7000.00, 'Minuman', TRUE),
('DNB-DRINK-006', 'Teh Tawar (Hangat/Es)', NULL, 5000.00, 'Minuman', TRUE)
;


