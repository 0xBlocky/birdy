/**
 * Test script for DEXScreener API integration
 * Run with: npx tsx src/test-dexscreener.ts
 */

import { DEXScreenerClient } from './services/DEXScreenerClient';
import { TRADEABLE_TOKENS } from 'shared';

async function testDEXScreenerIntegration() {
  console.log('🧪 Testing DEXScreener API Integration\n');

  const client = new DEXScreenerClient();

  // Test 1: Health check
  console.log('1️⃣ Testing API health check...');
  const isHealthy = await client.healthCheck();
  console.log(`   ${isHealthy ? '✅' : '❌'} API ${isHealthy ? 'is healthy' : 'is not responding'}\n`);

  if (!isHealthy) {
    console.log('❌ API health check failed. Cannot continue tests.');
    return;
  }

  // Test 2: Fetch all tradeable tokens
  console.log('2️⃣ Fetching all tradeable tokens...');
  try {
    const tokens = await client.fetchAllTradeableTokens();
    console.log(`   ✅ Fetched ${tokens.length} tokens\n`);

    // Display token details
    console.log('📊 Token Prices:\n');
    for (const token of tokens) {
      const priceChange = token.priceChange24h >= 0 ? '+' : '';
      const changeColor = token.priceChange24h >= 0 ? '🟢' : '🔴';

      console.log(`   ${changeColor} ${token.symbol} (${token.name})`);
      console.log(`      Price: $${token.currentPriceUSD.toFixed(6)} (${token.currentPriceTON.toFixed(6)} TON)`);
      console.log(`      24h Change: ${priceChange}${token.priceChange24h.toFixed(2)}%`);
      console.log(`      Volume 24h: $${token.volume24h.toLocaleString()}`);
      console.log(`      Liquidity: $${token.liquidity.toLocaleString()}`);
      console.log(`      DEX: ${token.dexName}`);
      console.log(`      Last Updated: ${new Date(token.lastUpdated).toLocaleTimeString()}\n`);
    }
  } catch (error) {
    console.error('   ❌ Error fetching tokens:', error);
  }

  // Test 3: Fetch single token (STON)
  console.log('3️⃣ Fetching single token (STON)...');
  try {
    const stonToken = await client.fetchTokenByAddress(TRADEABLE_TOKENS.STON.contractAddress);
    if (stonToken) {
      console.log(`   ✅ STON price: $${stonToken.currentPriceUSD.toFixed(6)}`);
      console.log(`   Market Cap: $${stonToken.marketCap.toLocaleString()}\n`);
    } else {
      console.log('   ⚠️ STON token not found\n');
    }
  } catch (error) {
    console.error('   ❌ Error fetching STON:', error);
  }

  console.log('✅ All tests completed!');
}

// Run tests
testDEXScreenerIntegration()
  .then(() => {
    console.log('\n✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
