# ShopEZ Stocks - Real-Time Stock Trading Simulation Platform

Welcome to **ShopEZ Stocks**, a premium full-stack MERN (MongoDB, Express.js, React.js, Node.js) application designed to simulate stock market exploration, real-time portfolio management, and virtual trade execution. 

ShopEZ Stocks offers a highly interactive experience for investors to browse quotes and execute mock trades, while giving administrators the auditing tools required to manage listed stocks and monitor global trading volume statistics.

---

## 🚀 Key Features

### User Capabilities (Traders)
* **JWT-Based Authentication**: Secure signup and signin, keeping token-based session verification across client page swaps.
* **Live Market Dashboard**: View active stock tickers (AAPL, MSFT, TSLA, etc.) with real-time price updates. Row animations signal upward or downward price shifts.
* **Filter & Search Tickers**: Locate assets instantly by symbol or company name, or filter by specific market sectors.
* **Performance Charts**: Visualize historical stock prices using interactive, gradient area line charts powered by Chart.js.
* **Mock Trade Widget**: Execute instant **BUY** and **SELL** orders with virtual capital, calculating real-time costs and holding bases.
* **Portfolio Valuation Metrics**: Track holdings quantity, average purchase prices, net worth changes, and overall profit/loss stats.
* **Transaction Log Audits**: Inspect chronological records of executed trade operations.

### Admin Capabilities (Moderators)
* **Global Statistics Overview**: Monitor total transaction logs, active trader counts, system currency pool inflation, and popular stock trends.
* **Stock Catalog CRUD Control**: Create new stock tickers, update company sector descriptions, manually override prices, or delete listings.
* **User Balance Adjustments**: Overwrite virtual cash balances directly for any registered user.

---

## 🛠️ Tech Stack

### Backend
* **Core**: Node.js, Express.js
* **Database**: MongoDB & Mongoose
* **Security & Tokens**: Bcrypt.js, Jsonwebtoken
* **CORS & Logging**: Cors, custom JSON logging middleware

### Price Simulator (Backend Loop)
* Runs in the background, updating all stock prices randomly between `-1.5%` and `+1.5%` every **5 seconds**, populating historical charts dynamically without external API rate constraints.

### Frontend
* **Core**: React.js, Vite
* **Styling**: Custom CSS variables (Dark Mode Theme, Glassmorphism, card gradients), Bootstrap
* **Charts**: Chart.js, React-Chartjs-2
* **Icons**: Lucide-React
* **HTTP Client**: Axios (configured with automated JWT request interceptors)

---

## 📂 Project Structure

```
.
├── backend/
│   ├── config/db.js          # Mongoose connection config
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth token guards & role validations
│   ├── models/               # User, Stock, Transaction, Portfolio schemas
│   ├── routes/               # Express routing configuration
│   ├── scripts/              # Seeding script and test runner
│   ├── server.js             # Express entry point and simulator interval
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Route guards, charts, navbar
    │   ├── context/          # Global Auth Provider
    │   ├── pages/            # Login, Dashboard, Detail, Portfolio, Admin
    │   ├── utils/api.js      # Axios client configuration
    │   ├── index.css         # CSS design tokens & animations
    │   └── main.jsx
    └── vite.config.js
```

---

## ⚙️ Setup & Local Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **MongoDB Community Server** (running locally on port `27017`)
* **Node.js (v18+)** and **npm**

### 2. Database Configuration
Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopez_stocks
JWT_SECRET=shopez_secret_key_12345
NODE_ENV=development
```

### 3. Install Dependencies
Run the installation command in both folders:

**For Backend:**
```bash
cd backend
npm install
```

**For Frontend:**
```bash
cd frontend
npm install
```

### 4. Seed Database
Execute the database seeder script to populate default stocks, standard traders (`john_doe`), and administrators (`admin`):
```bash
node backend/scripts/seedStocks.js
```

### 5. Running the Application

**Start Backend Server:**
```bash
cd backend
npm start
```
*The server will run on `http://localhost:5000` and start the price simulator.*

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```
*The React app will open on `http://localhost:3000`.*

---

## 🧪 Testing & Verification

A custom integration test script is available in the backend to verify trading validations, over-draft budget restrictions, and state changes.

Run it in your terminal while the backend server is running:
```bash
node backend/scripts/testEndpoints.js
```