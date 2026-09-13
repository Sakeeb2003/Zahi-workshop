-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 13, 2026 at 12:33 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `carpenter_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `unit` varchar(50) DEFAULT 'pcs',
  `price` decimal(10,2) DEFAULT 0.00,
  `status` enum('in_stock','needs_purchase') DEFAULT 'in_stock',
  `purchased_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `item_name`, `quantity`, `unit`, `price`, `status`, `purchased_date`, `created_at`, `updated_at`) VALUES
(1, 'Plywood (18mm)', 10, 'sheets', 0.00, 'in_stock', NULL, '2026-09-13 08:44:21', '2026-09-13 08:44:21'),
(2, 'Screws (2 inch)', 500, 'pcs', 0.00, 'in_stock', NULL, '2026-09-13 08:44:21', '2026-09-13 08:44:21'),
(3, 'Wood Glue', 2, 'bottles', 0.00, 'needs_purchase', NULL, '2026-09-13 08:44:21', '2026-09-13 08:44:21'),
(4, 'Teak Wood', 5, 'cft', 2000.00, 'in_stock', NULL, '2026-09-13 08:44:21', '2026-09-13 09:12:10'),
(5, 'gum', 0, 'bottles', 6000.00, 'in_stock', '2026-09-03', '2026-09-13 09:10:32', '2026-09-13 09:43:57');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `invoice_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('unpaid','paid') DEFAULT 'unpaid',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_type` enum('full','advance') DEFAULT 'full',
  `advance_amount` decimal(10,2) DEFAULT 0.00,
  `balance_due` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `order_id`, `invoice_date`, `amount`, `status`, `created_at`, `payment_type`, `advance_amount`, `balance_due`) VALUES
(1, 2, '2026-09-10', 25000.00, 'paid', '2026-09-13 08:44:21', 'full', 0.00, 0.00),
(2, 1, '2026-09-13', 15000.00, 'unpaid', '2026-09-13 10:28:28', 'full', 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','finished') DEFAULT 'pending',
  `order_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_name`, `description`, `total_amount`, `status`, `order_date`, `created_at`, `updated_at`) VALUES
(1, 'John Doe', 'Custom Wardrobe', 15000.00, 'finished', '2026-09-01', '2026-09-13 08:44:21', '2026-09-13 10:28:18'),
(2, 'Alice Smith', 'Dining Table', 25000.00, 'finished', '2026-09-05', '2026-09-13 08:44:21', '2026-09-13 08:44:21');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_log`
--

CREATE TABLE `purchase_log` (
  `id` int(11) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit` varchar(50) DEFAULT 'pcs',
  `price_per_unit` decimal(10,2) DEFAULT 0.00,
  `total_cost` decimal(10,2) DEFAULT 0.00,
  `purchased_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_log`
--

INSERT INTO `purchase_log` (`id`, `item_name`, `quantity`, `unit`, `price_per_unit`, `total_cost`, `purchased_date`, `notes`, `created_at`) VALUES
(1, 'gum', 10, 'pcs', 6000.00, 60000.00, '2026-09-13', 'kalethin store', '2026-09-13 09:41:20');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purchase_log`
--
ALTER TABLE `purchase_log`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `purchase_log`
--
ALTER TABLE `purchase_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
