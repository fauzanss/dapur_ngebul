USE dapur_ngebul;

ALTER TABLE orders
  ADD COLUMN customer_name VARCHAR(100) NULL AFTER cashier,
  MODIFY COLUMN status VARCHAR(50) DEFAULT 'PENDING';


