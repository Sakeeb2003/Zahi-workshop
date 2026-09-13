CREATE DATABASE IF NOT EXISTS carpenter_db;
USE carpenter_db;

CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pcs',
    price DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('in_stock', 'needs_purchase') DEFAULT 'in_stock',
    purchased_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('pending', 'finished') DEFAULT 'pending',
    order_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    invoice_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert dummy data for testing
INSERT INTO inventory (item_name, quantity, unit, status) VALUES 
('Plywood (18mm)', 10, 'sheets', 'in_stock'),
('Screws (2 inch)', 500, 'pcs', 'in_stock'),
('Wood Glue', 2, 'bottles', 'needs_purchase'),
('Teak Wood', 5, 'cft', 'in_stock');

INSERT INTO orders (customer_name, description, total_amount, status, order_date) VALUES 
('John Doe', 'Custom Wardrobe', 15000.00, 'pending', '2026-09-01'),
('Alice Smith', 'Dining Table', 25000.00, 'finished', '2026-09-05');

INSERT INTO invoices (order_id, invoice_date, amount, status) VALUES 
(2, '2026-09-10', 25000.00, 'paid');
