-- Create the database (run separately in PostgreSQL)
-- CREATE DATABASE raameshth_management;
-- \c raameshth_management

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin', 'worker')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial super admin
INSERT INTO users (userId, name, role) VALUES ('SA001', 'Super Admin', 'super_admin') ON CONFLICT DO NOTHING;
INSERT INTO users (userId, name, role) VALUES ('AD001', 'Admin User', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO users (userId, name, role) VALUES ('WK001', 'Worker 1', 'worker') ON CONFLICT DO NOTHING;

-- Machines table
CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  current_mould_id INTEGER,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (current_mould_id) REFERENCES moulds(id)
);

-- Moulds table
CREATE TABLE IF NOT EXISTS moulds (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Models table
CREATE TABLE IF NOT EXISTS product_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  productionKg DECIMAL(10,2) DEFAULT 0,
  rawMaterials TEXT,
  outputDetails TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  machineId INTEGER NOT NULL,
  mouldId INTEGER NOT NULL,
  modelId INTEGER NOT NULL,
  workerId INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  startDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endDate TIMESTAMP NULL,
  FOREIGN KEY (machineId) REFERENCES machines(id),
  FOREIGN KEY (mouldId) REFERENCES moulds(id),
  FOREIGN KEY (modelId) REFERENCES product_models(id),
  FOREIGN KEY (workerId) REFERENCES users(id)
);

-- Color Mix Formulas table
CREATE TABLE IF NOT EXISTS color_mix_formulas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  materialCount INT NOT NULL,
  formula TEXT NOT NULL,
  createdBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Color Mix Entries table
CREATE TABLE IF NOT EXISTS color_mix_entries (
  id SERIAL PRIMARY KEY,
  formulaId INT NOT NULL,
  activityId INT NOT NULL,
  materialWeights JSON NOT NULL,
  colorRequirement DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formulaId) REFERENCES color_mix_formulas(id),
  FOREIGN KEY (activityId) REFERENCES activities(id)
);

-- Hourly Production Logs table
CREATE TABLE IF NOT EXISTS hourly_production_logs (
  id SERIAL PRIMARY KEY,
  activityId INT NOT NULL,
  hour TIME NOT NULL,
  totalPieces INT NOT NULL DEFAULT 0,
  perfectPieces INT NOT NULL DEFAULT 0,
  defectPieces INT NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE
);

-- Raw Materials table
CREATE TABLE IF NOT EXISTS raw_materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  threshold DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material Usage table
CREATE TABLE IF NOT EXISTS material_usage (
  id SERIAL PRIMARY KEY,
  materialId INT NOT NULL,
  activityId INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materialId) REFERENCES raw_materials(id),
  FOREIGN KEY (activityId) REFERENCES activities(id)
);

-- Finished Goods Inventory table
CREATE TABLE IF NOT EXISTS finished_goods (
  id SERIAL PRIMARY KEY,
  modelId INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  perfectCount INT NOT NULL DEFAULT 0,
  defectCount INT NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modelId) REFERENCES product_models(id)
);
