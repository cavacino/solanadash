const { Connection } = require('@solana/web3.js');

// Configuration for Solana devnet connection
const DEVNET_RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC_URL, 'confirmed');

async function getCurrentSlot() {
  try {
    console.log('🔍 Fetching current Solana network slot...');
    console.log(`📡 Connecting to: ${DEVNET_RPC_URL}`);
    
    const slot = await connection.getSlot();
    const timestamp = new Date().toISOString();
    
    console.log('\n✅ Current Solana Network Slot:');
    console.log(`   Slot: ${slot.toLocaleString()}`);
    console.log(`   Timestamp: ${timestamp}`);
    console.log(`   Network: Devnet`);
    
    return { slot, timestamp, network: 'devnet' };
  } catch (error) {
    console.error('❌ Error fetching slot:', error.message);
    throw error;
  }
}

// Run the function
getCurrentSlot()
  .then(() => {
    console.log('\n🎉 Slot information retrieved successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to get slot:', error.message);
    process.exit(1);
  }); 