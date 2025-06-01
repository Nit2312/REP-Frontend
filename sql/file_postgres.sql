

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `raameshth_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `color_mix_entries`
--

CREATE TABLE `color_mix_entries` (
  `id` int(11) NOT NULL,
  `formulaId` int(11) NOT NULL,
  `materialWeights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`materialWeights`)),
  `colorRequirement` decimal(10,2) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `color_mix_entries`
--

INSERT INTO `color_mix_entries` (`id`, `formulaId`, `materialWeights`, `colorRequirement`, `createdAt`) VALUES
(15, 4, '[{\"materialId\":\"3\",\"quantity\":\"125\"},{\"materialId\":\"4\",\"quantity\":\"125\"}]', 0.06, '2025-05-24 15:24:16'),
(16, 5, '[{\"materialId\":\"3\",\"quantity\":\"125\"},{\"materialId\":\"5\",\"quantity\":\"126\"}]', 0.44, '2025-05-24 15:24:31');

-- --------------------------------------------------------

--
-- Table structure for table `color_mix_formulas`
--

CREATE TABLE `color_mix_formulas` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `materialCount` int(11) NOT NULL,
  `formula` text NOT NULL,
  `createdBy` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `colorWeight` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



INSERT INTO `color_mix_formulas` (`id`, `name`, `materialCount`, `formula`, `createdBy`, `createdAt`, `colorWeight`) VALUES
(4, 'Red ', 2, '{\"3\":250,\"4\":250}', 5, '2025-05-24 09:48:25', 0.15),
(5, 'Blue ', 2, '{\"3\":\"250\",\"5\":\"250\"}', 5, '2025-05-24 13:55:28', 0.40),
(6, 'Green', 2, '{\"3\":\"125\",\"4\":\"500\"}', 1, '2025-05-27 06:17:17', 0.14);

-- --------------------------------------------------------

--
-- Table structure for table `finished_goods`
--

CREATE TABLE `finished_goods` (
  `id` int(11) NOT NULL,
  `modelId` int(11) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `perfectCount` int(11) NOT NULL DEFAULT 0,
  `defectCount` int(11) NOT NULL DEFAULT 0,
  `date` date NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hourly_production_logs`
--

CREATE TABLE `hourly_production_logs` (
  `id` int(11) NOT NULL,
  `taskId` int(11) NOT NULL,
  `hour` time NOT NULL,
  `totalPieces` int(11) NOT NULL DEFAULT 0,
  `perfectPieces` int(11) NOT NULL DEFAULT 0,
  `defectPieces` int(11) NOT NULL DEFAULT 0,
  `date` date NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `defective_weight` float DEFAULT NULL,
  `wastage_weight` float DEFAULT NULL,
  `perfect_weight` float DEFAULT NULL,
  `remarks` text DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hourly_production_logs`
--

INSERT INTO `hourly_production_logs` (`id`, `taskId`, `hour`, `totalPieces`, `perfectPieces`, `defectPieces`, `date`, `createdAt`, `defective_weight`, `wastage_weight`, `perfect_weight`, `remarks`) VALUES
(37, 14, '10:00:00', 130, 120, 10, '2025-05-29', '2025-05-29 14:45:30', 10, 1, 120, 'na'),
(38, 17, '10:00:00', 440, 440, 0, '2025-05-29', '2025-05-29 15:27:05', NULL, NULL, 440, 'NA'),
(39, 16, '10:00:00', 452, 440, 12, '2025-05-29', '2025-05-29 15:32:44', 12, 5, 440, '125'),
(40, 13, '10:00:00', 59, 50, 9, '2025-05-29', '2025-05-29 15:45:44', 9, 1, 50, '1'),
(41, 17, '10:00:00', 412, 400, 12, '2025-05-29', '2025-05-29 15:52:27', 12, 1, 400, '12'),
(42, 17, '12:00:00', 402, 400, 2, '2025-05-29', '2025-05-29 16:01:48', 2, 2, 400, '2');

-- --------------------------------------------------------

--
-- Table structure for table `machines`
--

CREATE TABLE `machines` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive','maintenance') DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `machines`
--

INSERT INTO `machines` (`id`, `name`, `description`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Machine 1', 'Test machine 1', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03'),
(2, 'Machine 2', 'Test machine 2', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03');

-- --------------------------------------------------------

--
-- Table structure for table `moulds`
--

CREATE TABLE `moulds` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive','maintenance') DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `moulds`
--

INSERT INTO `moulds` (`id`, `name`, `description`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Mould 1', 'Test mould 1', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03'),
(2, 'Mould 2', 'Test mould 2', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03');

-- --------------------------------------------------------

--
-- Table structure for table `production_entries`
--

CREATE TABLE `production_entries` (
  `id` int(11) NOT NULL,
  `workerId` int(11) NOT NULL,
  `machineId` int(11) NOT NULL,
  `modelId` int(11) NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `kgProduced` decimal(10,2) NOT NULL,
  `remarks` text DEFAULT NULL,
  `date` date NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `perfectPieces` int(11) DEFAULT 0,
  `defectPieces` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_entries`
--

INSERT INTO `production_entries` (`id`, `workerId`, `machineId`, `modelId`, `startTime`, `endTime`, `kgProduced`, `remarks`, `date`, `createdAt`, `updatedAt`, `perfectPieces`, `defectPieces`) VALUES
(5, 3, 2, 2, '16:00:00', '18:00:00', 299.00, '', '2025-05-24', '2025-05-23 07:37:43', '2025-05-23 07:37:43', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `production_logs`
--

CREATE TABLE `production_logs` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `hour` int(11) NOT NULL CHECK (`hour` between 1 and 24),
  `perfect_pieces` int(11) NOT NULL DEFAULT 0,
  `defect_pieces` int(11) NOT NULL DEFAULT 0,
  `total_pieces` int(11) GENERATED ALWAYS AS (`perfect_pieces` + `defect_pieces`) STORED,
  `weight` decimal(10,2) NOT NULL,
  `remarks` text DEFAULT NULL,
  `logged_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `perhourproduction` decimal(10,2) DEFAULT NULL COMMENT 'Expected production quantity per hour'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `category`, `status`, `createdAt`, `updatedAt`, `perhourproduction`) VALUES
(1, 'T cone ', 'Primary production product1 ', 'Y cone ', 'active', '2025-05-26 12:38:21', '2025-05-29 12:09:49', 440.00),
(3, 'TFO Roll ', 'Primary production product ', 'TFO roll', 'active', '2025-05-29 11:07:27', '2025-05-29 11:07:37', 441.00),
(4, '112*152 red roll', NULL, 'TFO roll', 'active', '2025-05-29 12:11:36', '2025-05-29 12:11:36', 39.00);

-- --------------------------------------------------------

--
-- Table structure for table `raw_materials`
--

CREATE TABLE `raw_materials` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `threshold` decimal(10,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `raw_materials`
--

INSERT INTO `raw_materials` (`id`, `name`, `quantity`, `unit`, `threshold`, `description`, `createdAt`) VALUES
(3, 'M2', 1026.00, 'kg', 100.00, '', '2025-05-24 03:44:17'),
(4, 'M1', 1650.00, 'kg', 100.00, '', '2025-05-24 09:20:00'),
(5, 'm3', 1499.00, 'kg', 200.00, ' ', '2025-05-24 09:33:11');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `machine_id` int(11) NOT NULL,
  `mould_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `color_mix_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `target` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `name`, `description`, `machine_id`, `mould_id`, `product_id`, `color_mix_id`, `worker_id`, `target`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
(13, 'new12', 'na', 1, 1, 1, 4, 2, 120, 'pending', 1, '2025-05-29 06:09:16', '2025-05-29 11:52:55'),
(14, 'new123', 'na', 2, 2, 3, 5, 2, 120, 'completed', 1, '2025-05-29 06:22:27', '2025-05-29 15:25:24'),
(16, 'new2014', 'na', 1, 1, 1, 4, 3, 12000, 'in_progress', 1, '2025-05-29 14:44:23', '2025-05-29 14:44:23'),
(17, 'new 2016', 'na ', 2, 2, 3, 5, 3, 1200, 'in_progress', 2, '2025-05-29 14:47:06', '2025-05-29 14:47:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userId` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('super_admin','admin','worker') NOT NULL DEFAULT 'worker',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userId`, `name`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'SA001', 'NP', 'super_admin', '2025-05-25 06:29:03', '2025-05-25 15:21:37'),
(2, 'WK001', 'Worker 1', 'worker', '2025-05-25 06:29:03', '2025-05-25 07:16:33'),
(3, 'WK002', 'Ramesh kaka', 'worker', '2025-05-25 06:29:03', '2025-05-27 06:07:19'),
(4, 'SA002', 'KP', 'super_admin', '2025-05-27 06:07:34', '2025-05-29 14:39:29'),
(5, 'SA003', 'CUP', 'super_admin', '2025-05-29 14:31:18', '2025-05-29 14:31:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `color_mix_entries`
--
ALTER TABLE `color_mix_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `formulaId` (`formulaId`);

--
-- Indexes for table `color_mix_formulas`
--
ALTER TABLE `color_mix_formulas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_color_mix_formulas_user` (`createdBy`);

--
-- Indexes for table `finished_goods`
--
ALTER TABLE `finished_goods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modelId` (`modelId`);

--
-- Indexes for table `hourly_production_logs`
--
ALTER TABLE `hourly_production_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taskId` (`taskId`);

--
-- Indexes for table `machines`
--
ALTER TABLE `machines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `moulds`
--
ALTER TABLE `moulds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `production_entries`
--
ALTER TABLE `production_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workerId` (`workerId`),
  ADD KEY `machineId` (`machineId`),
  ADD KEY `modelId` (`modelId`);

--
-- Indexes for table `production_logs`
--
ALTER TABLE `production_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_task_hour` (`task_id`,`hour`,`created_at`),
  ADD KEY `logged_by` (`logged_by`),
  ADD KEY `idx_task` (`task_id`),
  ADD KEY `idx_hour` (`hour`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `raw_materials`
--
ALTER TABLE `raw_materials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `color_mix_id` (`color_mix_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_worker` (`worker_id`),
  ADD KEY `idx_machine` (`machine_id`),
  ADD KEY `idx_mould` (`mould_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `color_mix_entries`
--
ALTER TABLE `color_mix_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `color_mix_formulas`
--
ALTER TABLE `color_mix_formulas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `finished_goods`
--
ALTER TABLE `finished_goods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hourly_production_logs`
--
ALTER TABLE `hourly_production_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `machines`
--
ALTER TABLE `machines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `moulds`
--
ALTER TABLE `moulds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `production_entries`
--
ALTER TABLE `production_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `production_logs`
--
ALTER TABLE `production_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `raw_materials`
--
ALTER TABLE `raw_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `color_mix_entries`
--
ALTER TABLE `color_mix_entries`
  ADD CONSTRAINT `color_mix_entries_ibfk_1` FOREIGN KEY (`formulaId`) REFERENCES `color_mix_formulas` (`id`);

--
-- Constraints for table `color_mix_formulas`
--
ALTER TABLE `color_mix_formulas`
  ADD CONSTRAINT `fk_color_mix_formulas_user` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `finished_goods`
--
ALTER TABLE `finished_goods`
  ADD CONSTRAINT `finished_goods_ibfk_1` FOREIGN KEY (`modelId`) REFERENCES `product_models` (`id`);

--
-- Constraints for table `hourly_production_logs`
--
ALTER TABLE `hourly_production_logs`
  ADD CONSTRAINT `hourly_production_logs_ibfk_1` FOREIGN KEY (`taskId`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_entries`
--
ALTER TABLE `production_entries`
  ADD CONSTRAINT `production_entries_ibfk_1` FOREIGN KEY (`workerId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `production_entries_ibfk_2` FOREIGN KEY (`machineId`) REFERENCES `machines` (`id`),
  ADD CONSTRAINT `production_entries_ibfk_3` FOREIGN KEY (`modelId`) REFERENCES `product_models` (`id`);

--
-- Constraints for table `production_logs`
--
ALTER TABLE `production_logs`
  ADD CONSTRAINT `production_logs_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `production_logs_ibfk_2` FOREIGN KEY (`logged_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`),
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`mould_id`) REFERENCES `moulds` (`id`),
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`color_mix_id`) REFERENCES `color_mix_formulas` (`id`),
  ADD CONSTRAINT `tasks_ibfk_5` FOREIGN KEY (`worker_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tasks_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;