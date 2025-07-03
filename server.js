const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { AnchorProvider } = require('@coral-xyz/anchor');
const http = require('http');
const url = require('url');

// Configuration for Solana devnet connection
const DEVNET_RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC_URL, 'confirmed');

// Create a new keypair for the provider (in production, you'd use a real wallet)
const wallet = Keypair.generate();

// Set up Anchor provider for interacting with Solana programs
const provider = new AnchorProvider(
  connection,
  {
    publicKey: wallet.publicKey,
    signTransaction: (tx) => Promise.resolve(tx),
    signAllTransactions: (txs) => Promise.resolve(txs),
  },
  { commitment: 'confirmed' }
);

// MCP Server implementation
class MCPServer {
  constructor(config) {
    this.name = config.name;
    this.version = config.version;
    this.description = config.description;
    this.tools = new Map();
  }

  registerTool(name, config) {
    this.tools.set(name, config);
  }

  async handleRequest(request) {
    const { method, params, id } = request;

    try {
      switch (method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {}
              },
              serverInfo: {
                name: this.name,
                version: this.version,
                description: this.description
              }
            }
          };

        case 'tools/list':
          const tools = Array.from(this.tools.entries()).map(([name, config]) => ({
            name,
            description: config.description,
            inputSchema: config.parameters
          }));

          return {
            jsonrpc: '2.0',
            id,
            result: { tools }
          };

        case 'tools/call':
          const { name: toolName, arguments: toolArgs } = params;
          const tool = this.tools.get(toolName);

          if (!tool) {
            throw new Error(`Tool '${toolName}' not found`);
          }

          const result = await tool.handler(toolArgs);
          return {
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
          };

        default:
          throw new Error(`Method '${method}' not supported`);
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }
}

// Initialize the MCP server
const server = new MCPServer({
  name: 'solana-mcp-server',
  version: '1.0.0',
  description: 'Solana MCP server for blockchain interactions'
});

// Register tools for Solana operations
server.registerTool('get_balance', {
  description: 'Get the balance of a Solana account',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The public key of the account to check'
      }
    },
    required: ['address']
  },
  handler: async ({ address }) => {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return {
        balance: balance / 1e9, // Convert lamports to SOL
        address: address,
        lamports: balance
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }
});

server.registerTool('get_account_info', {
  description: 'Get account information for a Solana address',
  parameters: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'The public key of the account'
      }
    },
    required: ['address']
  },
  handler: async ({ address }) => {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        return { error: 'Account not found' };
      }
      
      return {
        address: address,
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch
      };
    } catch (error) {
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }
});

server.registerTool('get_recent_blockhash', {
  description: 'Get the most recent blockhash from the network',
  parameters: {
    type: 'object',
    properties: {}
  },
  handler: async () => {
    try {
      const { blockhash } = await connection.getLatestBlockhash();
      return {
        blockhash: blockhash,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get recent blockhash: ${error.message}`);
    }
  }
});

server.registerTool('get_slot', {
  description: 'Get the current slot number',
  parameters: {
    type: 'object',
    properties: {}
  },
  handler: async () => {
    try {
      const slot = await connection.getSlot();
      return {
        slot: slot,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get current slot: ${error.message}`);
    }
  }
});

server.registerTool('get_network_info', {
  description: 'Get network information and connection status',
  parameters: {
    type: 'object',
    properties: {}
  },
  handler: async () => {
    try {
      const slot = await connection.getSlot();
      const { blockhash } = await connection.getLatestBlockhash();
      const version = await connection.getVersion();
      
      return {
        network: 'devnet',
        rpcUrl: DEVNET_RPC_URL,
        currentSlot: slot,
        latestBlockhash: blockhash,
        version: version,
        providerWallet: wallet.publicKey.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }
});

// Create HTTP server
const httpServer = http.createServer(async (req, res) => {
  // Set CORS headers for production deployment
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'https://solana-mcp-dashboard.netlify.app',
    'https://solana-mcp-dashboard.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || origin?.includes('netlify.app') || origin?.includes('vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        const response = await server.handleRequest(request);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: 'Parse error'
          }
        }));
      }
    });
  } else if (req.method === 'GET') {
    // Health check endpoint
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        network: 'devnet',
        rpcUrl: DEVNET_RPC_URL
      }));
      return;
    }
    
    // Root endpoint with info
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        name: 'Solana MCP Server',
        version: '1.0.0',
        description: 'Solana MCP server for blockchain interactions',
        endpoints: {
          health: '/health',
          mcp: 'POST / (JSON-RPC)'
        },
        network: 'devnet',
        rpcUrl: DEVNET_RPC_URL
      }));
      return;
    }
    
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

// Only start the server if we're not in Vercel (Vercel handles this automatically)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Solana MCP Server running on port ${PORT}`);
    console.log(`📡 Connected to Solana devnet: ${DEVNET_RPC_URL}`);
    console.log(`🔑 Provider wallet: ${wallet.publicKey.toString()}`);
    
    // Get and display provider balance
    connection.getBalance(wallet.publicKey)
      .then(balance => {
        console.log(`💰 Provider balance: ${balance / 1e9} SOL`);
      })
      .catch(() => {
        console.log(`💰 Provider balance: Unknown`);
      });
    
    console.log('\n📋 Available tools:');
    console.log('  - get_balance: Get account balance');
    console.log('  - get_account_info: Get account information');
    console.log('  - get_recent_blockhash: Get latest blockhash');
    console.log('  - get_slot: Get current slot number');
    console.log('  - get_network_info: Get network information');
    console.log('\n🔗 MCP Endpoint: http://localhost:' + PORT);
    console.log('📝 To connect to Cursor MCP, use the HTTP endpoint above');
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Solana MCP Server...');
    httpServer.close(() => {
      console.log('✅ Server closed successfully');
      process.exit(0);
    });
  });
}

module.exports = { server, connection, provider, httpServer }; 