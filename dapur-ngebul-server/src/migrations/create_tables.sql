CREATE DATABASE IF NOT EXISTS dapur_ngebul;
USE dapur_ngebul;

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_uuid VARCHAR(36) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'PENDING',
  cashier VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  name VARCHAR(255),
  price DECIMAL(10,2),
  quantity INT DEFAULT 1,
  note TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS sales_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  date DATE,
  total DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS printer_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO menu_items (sku, name, description, price, category)
SELECT * FROM (SELECT 'DNB-001' as sku, 'Seblak Original' as name, 'Seblak pedas original' as description, 15000.00 as price, 'Seblak' as category) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE sku='DNB-001') LIMIT 1;
INSERT INTO menu_items (sku, name, description, price, category)
SELECT * FROM (SELECT 'DNB-002', 'Seblak Keju', 'Seblak dengan topping keju', 18000.00, 'Seblak') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE sku='DNB-002') LIMIT 1;
INSERT INTO menu_items (sku, name, description, price, category)
SELECT * FROM (SELECT 'DNB-003', 'Bakso Goreng', 'Bakso kriuk', 12000.00, 'Cemilan') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE sku='DNB-003') LIMIT 1;
INSERT INTO menu_items (sku, name, description, price, category)
SELECT * FROM (SELECT 'DNB-004', 'Es Teh Manis', 'Es teh gula aren', 7000.00, 'Minuman') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE sku='DNB-004') LIMIT 1;
