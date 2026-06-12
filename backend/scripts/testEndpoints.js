const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

const runTests = async () => {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
  let token = '';
  let testUserId = '';
  
  try {
    // 1. Register User
    console.log('Testing User Registration...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'test_trader_99',
      email: 'test_trader_99@gmail.com',
      password: 'password123',
    });

    if (registerRes.data.success && registerRes.data.token) {
      console.log('✓ Registration successful! User created with balance: ' + registerRes.data.balance);
      token = registerRes.data.token;
      testUserId = registerRes.data._id;
    } else {
      throw new Error('Registration response failed validation.');
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Fetch User Profile
    console.log('Testing Fetch Profile...');
    const profileRes = await axios.get(`${BASE_URL}/auth/profile`, { headers });
    if (profileRes.data.success && profileRes.data.username === 'test_trader_99') {
      console.log('✓ Fetch profile successful!');
    } else {
      throw new Error('Profile details mismatched.');
    }

    // 3. Fetch Stocks List
    console.log('Testing Fetch Stocks list...');
    const stocksRes = await axios.get(`${BASE_URL}/stocks`);
    if (stocksRes.data.success && stocksRes.data.count > 0) {
      console.log(`✓ Fetch stocks successful! Found ${stocksRes.data.count} tickers.`);
    } else {
      throw new Error('Failed to fetch stock list.');
    }

    const testStock = stocksRes.data.data[0]; // e.g. AAPL
    console.log(`Selected stock for trading tests: ${testStock.symbol} @ $${testStock.price}`);

    // 4. Place a BUY trade
    console.log(`Testing BUY trade: 10 shares of ${testStock.symbol}...`);
    const buyRes = await axios.post(`${BASE_URL}/trade/buy`, {
      symbol: testStock.symbol,
      quantity: 10,
    }, { headers });

    if (buyRes.data.success && buyRes.data.balance < 100000) {
      console.log(`✓ BUY trade successful! New cash balance: $${buyRes.data.balance}`);
    } else {
      throw new Error('BUY trade transaction failed.');
    }

    // 5. Fetch Portfolio to verify holdings
    console.log('Testing Fetch Portfolio...');
    const portfolioRes = await axios.get(`${BASE_URL}/portfolio`, { headers });
    const holdings = portfolioRes.data.data.holdings;
    const holding = holdings.find(h => h.symbol === testStock.symbol);
    
    if (portfolioRes.data.success && holding && holding.quantity === 10) {
      console.log(`✓ Portfolio contains holding: ${holding.symbol} x ${holding.quantity} shares`);
    } else {
      throw new Error('Portfolio verification failed.');
    }

    // 6. Test insufficient funds validation
    console.log('Testing insufficient balance validation...');
    try {
      await axios.post(`${BASE_URL}/trade/buy`, {
        symbol: testStock.symbol,
        quantity: 10000, // Very expensive
      }, { headers });
      throw new Error('Validation failed: user was allowed to buy stocks beyond budget!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log(`✓ Insufficient funds correctly rejected with message: "${err.response.data.message}"`);
      } else {
        throw err;
      }
    }

    // 7. Place a SELL trade
    console.log(`Testing SELL trade: 4 shares of ${testStock.symbol}...`);
    const sellRes = await axios.post(`${BASE_URL}/trade/sell`, {
      symbol: testStock.symbol,
      quantity: 4,
    }, { headers });

    if (sellRes.data.success) {
      console.log(`✓ SELL trade successful! New cash balance: $${sellRes.data.balance}`);
    } else {
      throw new Error('SELL trade transaction failed.');
    }

    // 8. Verify updated holdings (should be 6 shares left)
    const portfolioRes2 = await axios.get(`${BASE_URL}/portfolio`, { headers });
    const holding2 = portfolioRes2.data.data.holdings.find(h => h.symbol === testStock.symbol);
    if (holding2 && holding2.quantity === 6) {
      console.log(`✓ Portfolio correctly updated: ${holding2.symbol} x ${holding2.quantity} shares`);
    } else {
      throw new Error('Holding quantity after sell is incorrect.');
    }

    // 9. Fetch user transactions log
    console.log('Testing Fetch User Transaction logs...');
    const transactionsRes = await axios.get(`${BASE_URL}/portfolio/transactions`, { headers });
    if (transactionsRes.data.success && transactionsRes.data.count === 2) {
      console.log('✓ Found ' + transactionsRes.data.count + ' transaction log entries.');
    } else {
      throw new Error('Transaction log count mismatched.');
    }

    console.log('\n======================================');
    console.log('✓ ALL BACKEND SYSTEM INTEGRATION TESTS PASSED!');
    console.log('======================================');
    process.exit(0);
  } catch (error) {
    console.error('✗ INTEGRATION TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  }
};

runTests();
