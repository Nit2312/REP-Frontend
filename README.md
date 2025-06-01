# Factory Production Management System

A comprehensive production management system for factories with role-based access control, interactive dashboards, inventory tracking, and multilingual support.

## Features

### User Management
- **Role-Based Access Control**: Super Admin, Admin, and Worker roles
- **User Authentication**: Login with User ID and Name
- **User Administration**: Add, edit, and manage users (Super Admin & Admin only)

### Production Management
- **Machine Assignment**: Assign machines to workers
- **Model Assignment**: Assign product models to machines
- **Production Tracking**: Record daily production data including time, quantity, and remarks
- **Production Reports**: View and filter production data

### Interactive Dashboard
- **Visual Analytics**: Charts and graphs for production metrics
- **Filtering Capabilities**: Filter by date range, machine, worker, and model
- **KPI Monitoring**: Track key performance indicators
- **Real-time Updates**: Dynamic data visualization

### Inventory Management
- **Raw Material Tracking**: Monitor available stock
- **Usage Tracking**: Record material consumption
- **Low Stock Alerts**: Get notified when material goes below threshold
- **Inventory Reports**: View daily usage and balance reports

### Multilingual Support
- **Multiple Languages**: English (default), Gujarati, and Hindi
- **Language Switching**: Switch languages on the fly
- **Translated Interface**: Complete translation of all UI elements

## Database Schema

The system uses MySQL database with the following structure:

### Tables
- **users**: Stores user information and roles
- **machines**: Contains machine details
- **product_models**: Stores product model specifications
- **machine_assignments**: Tracks machine assignments to workers
- **model_assignments**: Tracks model assignments to machines
- **production_entries**: Records daily production data
- **raw_materials**: Stores inventory information

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS
- **State Management**: React Context API
- **Charts**: Chart.js with React-Chartjs-2
- **Internationalization**: i18next
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MySQL (v5.7 or later)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/factory-management.git
   cd factory-management
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3307
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=factory_management
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the database
   Run the SQL commands in `db.txt` to create the database and tables

5. Start the development server
   ```
   npm run dev
   ```

6. Start the backend server
   ```
   npm run server
   ```

7. Open your browser and navigate to `http://localhost:5173`

### Default Users

The system comes with the following default users:
- **Super Admin**: User ID: SA001, Name: Super Admin
- **Admin**: User ID: AD001, Name: Admin User
- **Worker**: User ID: WK001, Name: Worker 1

## Usage Guide

### Login
1. Enter your User ID and Name
2. Select your preferred language (optional)
3. Click the Login button

### Super Admin & Admin Dashboard
- View production statistics and KPIs
- Assign machines to workers
- Assign product models to machines
- Manage users

### Worker Dashboard
- View assigned machines and models
- Enter daily production data
- View personal production statistics

### Production Management
1. Navigate to the Production page
2. To add a new production entry:
   - Select machine and model
   - Enter start and end time
   - Enter quantity produced in KG
   - Add any remarks
   - Submit the entry

### Inventory Management
1. Navigate to the Inventory page
2. Monitor current stock levels
3. Add new materials or update existing ones
4. Record material usage

## Project Structure

```
factory-management/
├── public/
├── server/
│   ├── index.js
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   ├── context/
│   ├── locales/
│   ├── pages/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── db.txt
├── package.json
└── README.md
```# REP-Frontend
# REP-Frontend
