require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

const initialStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.50,
    prevClose: 173.20,
    high: 176.20,
    low: 172.80,
    sector: 'Technology',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 420.20,
    prevClose: 418.50,
    high: 422.00,
    low: 416.80,
    sector: 'Technology',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 150.80,
    prevClose: 152.00,
    high: 153.10,
    low: 149.50,
    sector: 'Technology',
    description: 'Alphabet Inc. provides search, online advertising, cloud computing, software, and hardware products worldwide.',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 180.40,
    prevClose: 179.10,
    high: 181.90,
    low: 177.60,
    sector: 'Consumer Cyclical',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 170.10,
    prevClose: 175.40,
    high: 176.50,
    low: 168.20,
    sector: 'Automotive',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 900.50,
    prevClose: 885.30,
    high: 905.00,
    low: 875.20,
    sector: 'Technology',
    description: 'NVIDIA Corporation provides graphics, computing and networking solutions worldwide, fueling the AI revolution.',
  },
  {
    symbol: 'NFLX',
    name: 'Netflix, Inc.',
    price: 610.30,
    prevClose: 605.20,
    high: 615.00,
    low: 602.10,
    sector: 'Communication Services',
    description: 'Netflix, Inc. provides entertainment services with paid memberships in approximately 190 countries.',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 500.90,
    prevClose: 502.40,
    high: 505.20,
    low: 495.60,
    sector: 'Technology',
    description: 'Meta Platforms, Inc. focuses on building products that enable people to connect and share through mobile devices and personal computers.',
  },
];

const generateHistory = (basePrice) => {
  const history = [];
  const now = new Date();
  let currentVal = basePrice;
  
  // Create 20 data points representing hourly history points
  for (let i = 20; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    // Slight random walk
    const change = (Math.random() * 2 - 1) / 100; // -1% to +1%
    currentVal = Math.round(currentVal * (1 + change) * 100) / 100;
    history.push({
      price: currentVal,
      timestamp,
    });
  }
  return history;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear DB
    await User.deleteMany({});
    await Stock.deleteMany({});
    await Transaction.deleteMany({});
    await Portfolio.deleteMany({});
    console.log('Existing data cleared.');

    // Seed Admin User
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@shopez.com',
      password: 'adminpassword',
      role: 'ADMIN',
      balance: 100000.0,
    });
    await Portfolio.create({ user: adminUser._id, holdings: [] });
    console.log('Admin user seeded.');

    // Seed Standard User
    const standardUser = await User.create({
      username: 'john_doe',
      email: 'john@gmail.com',
      password: 'password123',
      role: 'USER',
      balance: 100000.0,
    });
    await Portfolio.create({ user: standardUser._id, holdings: [] });
    console.log('Standard user seeded.');

    // Seed Stocks with generated history
    for (const item of initialStocks) {
      const stockData = {
        ...item,
        history: generateHistory(item.price),
      };
      await Stock.create(stockData);
    }
    console.log('Stocks seeded successfully.');

    console.log('Database seeding complete!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
