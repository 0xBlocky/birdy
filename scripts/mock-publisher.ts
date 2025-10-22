import { createClient } from 'redis';
import { TradingOpportunity } from 'shared';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function publishMockOpportunities() {
  try {
    await client.connect();
    console.log('✅ Connected to Redis');

    const channel = process.env.REDIS_CHANNEL || 'trading_opportunities';
    
    // Generate mock opportunities
    const tokens = ['TON', 'USDT', 'USDC', 'BTC', 'ETH', 'DOGE'];
    const dexes = ['STON.fi', 'DeDust', 'TON Swap'];
    
    let opportunityId = 1;
    
    const publishOpportunity = () => {
      const tokenIn = tokens[Math.floor(Math.random() * tokens.length)];
      const tokenOut = tokens[Math.floor(Math.random() * tokens.length)];
      
      if (tokenIn === tokenOut) return; // Skip same token pairs
      
      const basePrice = Math.random() * 1000 + 1; // $1 - $1001
      const profitPotential = (Math.random() - 0.3) * 10; // -3% to +7%
      const targetPrice = basePrice * (1 + profitPotential / 100);
      const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
      
      const opportunity: TradingOpportunity = {
        id: `opp_${opportunityId++}`,
        timestamp: Date.now(),
        tokenIn,
        tokenOut,
        currentPrice: basePrice,
        targetPrice,
        profitPotential,
        confidence,
        metadata: `Arbitrage opportunity detected on ${dexes[Math.floor(Math.random() * dexes.length)]}`,
        slippageTolerance: Math.random() * 3 + 0.5, // 0.5% - 3.5%
        dexName: dexes[Math.floor(Math.random() * dexes.length)]
      };
      
      const message = JSON.stringify(opportunity);
      client.publish(channel, message);
      
      console.log(`📡 Published opportunity ${opportunity.id}: ${tokenIn}/${tokenOut} ${profitPotential.toFixed(2)}%`);
    };
    
    // Publish initial opportunities
    for (let i = 0; i < 5; i++) {
      publishOpportunity();
    }
    
    // Publish new opportunities every 2-5 seconds
    const interval = setInterval(() => {
      publishOpportunity();
    }, Math.random() * 3000 + 2000);
    
    console.log('📡 Mock publisher started. Press Ctrl+C to stop.');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down mock publisher...');
      clearInterval(interval);
      await client.disconnect();
      console.log('✅ Mock publisher stopped');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Mock publisher error:', error);
    process.exit(1);
  }
}

// Run the mock publisher
publishMockOpportunities();
