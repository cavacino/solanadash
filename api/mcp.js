const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { AnchorProvider } = require('@coral-xyz/anchor');

// Configuration for Solana devnet connection
const DEVNET_RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC_URL, 'confirmed');

// Create a new keypair for the provider
const wallet = Keypair.generate();

// Set up Anchor provider
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

// Vercel API handler
module.exports = async (req, res) => {
  // Set CORS headers
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'https://solonchain.netlify.app',
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

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST requests (MCP protocol)
  if (req.method === 'POST') {
    try {
      const request = JSON.parse(req.body);
      const response = await server.handleRequest(request);
      
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error'
        }
      });
    }
    return;
  }

  // Handle GET requests (info and health check)
  if (req.method === 'GET') {
    // Health check endpoint
    if (req.url.includes('/health')) {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        network: 'devnet',
        rpcUrl: DEVNET_RPC_URL
      });
      return;
    }
    
    // Root endpoint with info
    res.status(200).json({
      name: 'Solana MCP Server',
      version: '1.0.0',
      description: 'Solana MCP server for blockchain interactions',
      endpoints: {
        health: '/api/mcp/health',
        mcp: 'POST /api/mcp (JSON-RPC)'
      },
      network: 'devnet',
      rpcUrl: DEVNET_RPC_URL
    });
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}; 