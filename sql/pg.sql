-- PostgreSQL does not use SET SQL_MODE, START TRANSACTION, or MySQL session variables in this way.
-- Remove MySQL-specific commands and comments.

-- Table structure for table color_mix_entries
CREATE TABLE color_mix_entries (
  id SERIAL PRIMARY KEY,
  formula_id INTEGER NOT NULL,
  material_weights JSONB DEFAULT NULL,
  color_requirement NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dumping data for table color_mix_entries
INSERT INTO color_mix_entries (id, formula_id, material_weights, color_requirement, created_at) VALUES
(15, 4, '[{"materialId":"3","quantity":"125"},{"materialId":"4","quantity":"125"}]', 0.06, '2025-05-24 15:24:16'),
(16, 5, '[{"materialId":"3","quantity":"125"},{"materialId":"5","quantity":"126"}]', 0.44, '2025-05-24 15:24:31');

-- Table structure for table color_mix_formulas
CREATE TABLE color_mix_formulas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  material_count INTEGER NOT NULL,
  formula TEXT NOT NULL,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  color_weight NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

INSERT INTO color_mix_formulas (id, name, material_count, formula, created_by, created_at, color_weight) VALUES
(4, 'Red ', 2, '{"3":250,"4":250}', 5, '2025-05-24 09:48:25', 0.15),
(5, 'Blue ', 2, '{"3":"250","5":"250"}', 5, '2025-05-24 13:55:28', 0.40),
(6, 'Green', 2, '{"3":"125","4":"500"}', 1, '2025-05-27 06:17:17', 0.14);

-- Table structure for table finished_goods
CREATE TABLE finished_goods (
  id SERIAL PRIMARY KEY,
  model_id INTEGER NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  perfect_count INTEGER NOT NULL DEFAULT 0,
  defect_count INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table hourly_production_logs
CREATE TABLE hourly_production_logs (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  hour TIME NOT NULL,
  total_pieces INTEGER NOT NULL DEFAULT 0,
  perfect_pieces INTEGER NOT NULL DEFAULT 0,
  defect_pieces INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  defective_weight FLOAT DEFAULT NULL,
  wastage_weight FLOAT DEFAULT NULL,
  perfect_weight FLOAT DEFAULT NULL,
  remarks TEXT DEFAULT ''
);

INSERT INTO hourly_production_logs (id, task_id, hour, total_pieces, perfect_pieces, defect_pieces, date, created_at, defective_weight, wastage_weight, perfect_weight, remarks) VALUES
(37, 14, '10:00:00', 130, 120, 10, '2025-05-29', '2025-05-29 14:45:30', 10, 1, 120, 'na'),
(38, 17, '10:00:00', 440, 440, 0, '2025-05-29', '2025-05-29 15:27:05', NULL, NULL, 440, 'NA'),
(39, 16, '10:00:00', 452, 440, 12, '2025-05-29', '2025-05-29 15:32:44', 12, 5, 440, '125'),
(40, 13, '10:00:00', 59, 50, 9, '2025-05-29', '2025-05-29 15:45:44', 9, 1, 50, '1'),
(41, 17, '10:00:00', 412, 400, 12, '2025-05-29', '2025-05-29 15:52:27', 12, 1, 400, '12'),
(42, 17, '12:00:00', 402, 400, 2, '2025-05-29', '2025-05-29 16:01:48', 2, 2, 400, '2');

-- Table structure for table machines
CREATE TABLE machines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO machines (id, name, description, status, created_at, updated_at) VALUES
(1, 'Machine 1', 'Test machine 1', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03'),
(2, 'Machine 2', 'Test machine 2', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03');

-- Table structure for table moulds
CREATE TABLE moulds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO moulds (id, name, description, status, created_at, updated_at) VALUES
(1, 'Mould 1', 'Test mould 1', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03'),
(2, 'Mould 2', 'Test mould 2', 'active', '2025-05-25 06:29:03', '2025-05-25 06:29:03');

-- Table structure for table production_entries
CREATE TABLE production_entries (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER NOT NULL,
  machine_id INTEGER NOT NULL,
  model_id INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  kg_produced NUMERIC(10,2) NOT NULL,
  remarks TEXT DEFAULT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  perfect_pieces INTEGER DEFAULT 0,
  defect_pieces INTEGER DEFAULT 0
);

INSERT INTO production_entries (id, worker_id, machine_id, model_id, start_time, end_time, kg_produced, remarks, date, created_at, updated_at, perfect_pieces, defect_pieces) VALUES
(5, 3, 2, 2, '16:00:00', '18:00:00', 299.00, '', '2025-05-24', '2025-05-23 07:37:43', '2025-05-23 07:37:43', 0, 0);

-- Table structure for table production_logs
CREATE TABLE production_logs (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  hour INTEGER NOT NULL CHECK (hour BETWEEN 1 AND 24),
  perfect_pieces INTEGER NOT NULL DEFAULT 0,
  defect_pieces INTEGER NOT NULL DEFAULT 0,
  total_pieces INTEGER GENERATED ALWAYS AS (perfect_pieces + defect_pieces) STORED,
  weight NUMERIC(10,2) NOT NULL,
  remarks TEXT DEFAULT NULL,
  logged_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Table structure for table products
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(100) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  per_hour_production NUMERIC(10,2) DEFAULT NULL
);

INSERT INTO products (id, name, description, category, status, created_at, updated_at, per_hour_production) VALUES
(1, 'T cone ', 'Primary production product1 ', 'Y cone ', 'active', '2025-05-26 12:38:21', '2025-05-29 12:09:49', 440.00),
(3, 'TFO Roll ', 'Primary production product ', 'TFO roll', 'active', '2025-05-29 11:07:27', '2025-05-29 11:07:37', 441.00),
(4, '112*152 red roll', NULL, 'TFO roll', 'active', '2025-05-29 12:11:36', '2025-05-29 12:11:36', 39.00);

-- Table structure for table raw_materials
CREATE TABLE raw_materials (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  threshold NUMERIC(10,2) DEFAULT 0.00,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO raw_materials (id, name, quantity, unit, threshold, description, created_at) VALUES
(3, 'M2', 1026.00, 'kg', 100.00, '', '2025-05-24 03:44:17'),
(4, 'M1', 1650.00, 'kg', 100.00, '', '2025-05-24 09:20:00'),
(5, 'm3', 1499.00, 'kg', 200.00, ' ', '2025-05-24 09:33:11');

-- Table structure for table tasks
  CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    machine_id INTEGER NOT NULL,
    mould_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    color_mix_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    target INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

INSERT INTO tasks (id, name, description, machine_id, mould_id, product_id, color_mix_id, worker_id, target, status, created_by, created_at, updated_at) VALUES
(13, 'new12', 'na', 1, 1, 1, 4, 2, 120, 'pending', 1, '2025-05-29 06:09:16', '2025-05-29 11:52:55'),
(14, 'new123', 'na', 2, 2, 3, 5, 2, 120, 'completed', 1, '2025-05-29 06:22:27', '2025-05-29 15:25:24'),
(16, 'new2014', 'na', 1, 1, 1, 4, 3, 12000, 'in_progress', 1, '2025-05-29 14:44:23', '2025-05-29 14:44:23'),
(17, 'new 2016', 'na ', 2, 2, 3, 5, 3, 1200, 'in_progress', 2, '2025-05-29 14:47:06', '2025-05-29 14:47:06');

-- Table structure for table users
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('super_admin','admin','worker')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, user_id, name, role, created_at, updated_at) VALUES
(1, 'SA001', 'NP', 'super_admin', '2025-05-25 06:29:03', '2025-05-25 15:21:37'),
(2, 'WK001', 'Worker 1', 'worker', '2025-05-25 06:29:03', '2025-05-25 07:16:33'),
(3, 'WK002', 'Ramesh kaka', 'worker', '2025-05-25 06:29:03', '2025-05-27 06:07:19'),
(4, 'SA002', 'KP', 'super_admin', '2025-05-27 06:07:34', '2025-05-29 14:39:29'),
(5, 'SA003', 'CUP', 'super_admin', '2025-05-29 14:31:18', '2025-05-29 14:31:18');
-- Indexes for table color_mix_entries
ALTER TABLE color_mix_entries ADD PRIMARY KEY (id);
CREATE INDEX idx_color_mix_entries_formula_id ON color_mix_entries (formulaid);

-- Indexes for table color_mix_formulas
ALTER TABLE color_mix_formulas ADD PRIMARY KEY (id);
CREATE INDEX idx_color_mix_formulas_created_by ON color_mix_formulas (createdby);

-- Indexes for table finished_goods
ALTER TABLE finished_goods ADD PRIMARY KEY (id);
CREATE INDEX idx_finished_goods_model_id ON finished_goods (modelid);

-- Indexes for table hourly_production_logs
ALTER TABLE hourly_production_logs ADD PRIMARY KEY (id);
CREATE INDEX idx_hourly_production_logs_task_id ON hourly_production_logs (taskid);

-- Indexes for table machines
ALTER TABLE machines ADD PRIMARY KEY (id);

-- Indexes for table moulds
ALTER TABLE moulds ADD PRIMARY KEY (id);

-- Indexes for table production_entries
ALTER TABLE production_entries ADD PRIMARY KEY (id);
CREATE INDEX idx_production_entries_worker_id ON production_entries (workerid);
CREATE INDEX idx_production_entries_machine_id ON production_entries (machineid);
CREATE INDEX idx_production_entries_model_id ON production_entries (modelid);

-- Indexes for table production_logs
ALTER TABLE production_logs ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX unique_task_hour ON production_logs (task_id, hour, created_at);
CREATE INDEX idx_production_logs_logged_by ON production_logs (logged_by);
CREATE INDEX idx_production_logs_task_id ON production_logs (task_id);
CREATE INDEX idx_production_logs_hour ON production_logs (hour);
CREATE INDEX idx_production_logs_created_at ON production_logs (created_at);

-- Indexes for table products
ALTER TABLE products ADD PRIMARY KEY (id);

-- Indexes for table raw_materials
ALTER TABLE raw_materials ADD PRIMARY KEY (id);

-- Indexes for table tasks
ALTER TABLE tasks ADD PRIMARY KEY (id);
CREATE INDEX idx_tasks_product_id ON tasks (product_id);
CREATE INDEX idx_tasks_color_mix_id ON tasks (color_mix_id);
CREATE INDEX idx_tasks_created_by ON tasks (created_by);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_worker_id ON tasks (worker_id);
CREATE INDEX idx_tasks_machine_id ON tasks (machine_id);
CREATE INDEX idx_tasks_mould_id ON tasks (mould_id);

-- Indexes for table users
ALTER TABLE users ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX idx_users_user_id ON users (user_id);
-- Set sequence values for auto-incremented IDs (if needed)
SELECT setval('hourly_production_logs_id_seq', 43, true);
SELECT setval('machines_id_seq', 3, true);
SELECT setval('moulds_id_seq', 3, true);
SELECT setval('production_entries_id_seq', 6, true);
SELECT setval('production_logs_id_seq', 1, true); -- set to max(id) if you have data
SELECT setval('products_id_seq', 5, true);
SELECT setval('raw_materials_id_seq', 6, true);
SELECT setval('tasks_id_seq', 18, true);
SELECT setval('users_id_seq', 6, true);

-- Constraints for dumped tables

ALTER TABLE color_mix_entries
  ADD CONSTRAINT color_mix_entries_ibfk_1 FOREIGN KEY (formulaid) REFERENCES color_mix_formulas (id);

ALTER TABLE color_mix_formulas
  ADD CONSTRAINT fk_color_mix_formulas_user FOREIGN KEY (createdby) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE finished_goods
  ADD CONSTRAINT finished_goods_ibfk_1 FOREIGN KEY (modelid) REFERENCES product_models (id);

ALTER TABLE hourly_production_logs
  ADD CONSTRAINT hourly_production_logs_ibfk_1 FOREIGN KEY (taskid) REFERENCES tasks (id) ON DELETE CASCADE;

ALTER TABLE production_entries
  ADD CONSTRAINT production_entries_ibfk_1 FOREIGN KEY (workerid) REFERENCES users (id),
  ADD CONSTRAINT production_entries_ibfk_2 FOREIGN KEY (machineid) REFERENCES machines (id),
  ADD CONSTRAINT production_entries_ibfk_3 FOREIGN KEY (modelid) REFERENCES product_models (id);

ALTER TABLE production_logs
  ADD CONSTRAINT production_logs_ibfk_1 FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  ADD CONSTRAINT production_logs_ibfk_2 FOREIGN KEY (logged_by) REFERENCES users (id);

ALTER TABLE tasks
  ADD CONSTRAINT tasks_ibfk_1 FOREIGN KEY (machine_id) REFERENCES machines (id),
  ADD CONSTRAINT tasks_ibfk_2 FOREIGN KEY (mould_id) REFERENCES moulds (id),
  ADD CONSTRAINT tasks_ibfk_3 FOREIGN KEY (product_id) REFERENCES products (id),
  ADD CONSTRAINT tasks_ibfk_4 FOREIGN KEY (color_mix_id) REFERENCES color_mix_formulas (id),
  ADD CONSTRAINT tasks_ibfk_5 FOREIGN KEY (worker_id) REFERENCES users (id),
  ADD CONSTRAINT tasks_ibfk_6 FOREIGN KEY (created_by) REFERENCES users (id);