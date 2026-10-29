# MERN Ecommerce - Local Setup Guide

Welcome! The repository [mohamedsamara/mern-ecommerce](https://github.com/mohamedsamara/mern-ecommerce) is fully cloned, configured, and ready on your system.

---

## 🚀 Quick Start (One Click)

Double-click `start-all.bat` (or run `./start-all.ps1` in PowerShell).

This launcher will:
1. Ensure the local MongoDB database engine is running on `127.0.0.1:27017`.
2. Start the Express API server on `http://localhost:3000`.
3. Start the Webpack development server on `http://localhost:8080`.
4. Automatically open `http://localhost:8080` in your browser.

---

## 🔑 Default Admin Account & Sample Data

The database has already been seeded with test data:
- **Admin Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Sample Data**: 10 Brands, 10 Categories, 100 Products

To re-seed or change credentials at any time:
```bash
# Using batch file:
seed-database.bat [email] [password]

# Or using npm:
npm run seed:db admin@example.com Admin@123
```

---

## 🛠️ Installed Development Tools

To ensure zero setup friction, the following portable tools were installed to `D:\tools` and added to your User `PATH`:
- **Node.js**: `v18.20.5` (`D:\tools\nodejs`)
- **npm**: `10.8.2`
- **Git**: `2.44.0` (`D:\tools\git\cmd`)
- **MongoDB Community Server**: `4.4.29` (`D:\tools\mongodb\bin`)
- **MongoDB Data Directory**: `D:\tools\mongodb\data`

---

## ⚙️ Environment Configuration

- **Client (`client/.env`)**:
  ```env
  API_URL=http://localhost:3000/api
  ```

- **Server (`server/.env`)**:
  ```env
  PORT=3000
  MONGO_URI=mongodb://127.0.0.1:27017/mern_ecommerce
  JWT_SECRET=supersecretjwtkeyforlocaldevelopment12345
  CLIENT_URL=http://localhost:8080
  BASE_API_URL=api
  ```

---

## 📂 Manual Command Execution

If you prefer running components in separate terminal windows:

### Terminal 1: MongoDB
```powershell
mongod --dbpath "D:\tools\mongodb\data" --bind_ip 127.0.0.1 --port 27017
```

### Terminal 2: Backend Server
```powershell
cd D:\MERNSTACK\server
npm run dev
```

### Terminal 3: Frontend Client
```powershell
cd D:\MERNSTACK\client
npm run dev
```

Or from the workspace root `D:\MERNSTACK`:
```powershell
npm run dev
```
