# 🚀 Solana MCP Dashboard

A clean and modern web dashboard for interacting with Solana blockchain through an MCP (Model Context Protocol) server.

## ✨ Features

- **Real-time Network Information**: Live Solana devnet data
- **Current Slot Tracking**: Auto-refreshing slot numbers
- **Account Balance Checker**: Query any Solana address balance
- **Account Information**: Detailed account data and metadata
- **Recent Blockhash**: Latest blockhash from the network
- **Modern UI**: Clean, responsive design with smooth animations

## 🛠️ Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the MCP server:
   ```bash
   npm start
   ```
4. Open `dashboard.html` in your browser

## 🌐 Deployment

### Netlify Deployment

1. **Push to GitHub**: Upload your code to a GitHub repository

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository

3. **Configure Build Settings**:
   - Build command: (leave empty)
   - Publish directory: `.`
   - Click "Deploy site"

4. **Environment Variables** (Optional):
   - Add `MCP_SERVER_URL` if you want to point to a different MCP server

### Important Notes

⚠️ **CORS Configuration**: The dashboard connects to your local MCP server. For production use, you'll need to:

1. Deploy your MCP server to a hosting service (Heroku, Railway, etc.)
2. Update the `MCP_SERVER_URL` in `dashboard.html` to point to your deployed server
3. Ensure your MCP server allows CORS from your Netlify domain

### Alternative: Deploy Both Together

For a complete solution, you can deploy both the frontend and backend:

1. **Deploy MCP Server** to a service like Heroku or Railway
2. **Update the frontend** to point to your deployed server
3. **Deploy the dashboard** to Netlify

## 📁 Project Structure

```
├── server.js          # MCP server implementation
├── dashboard.html     # Main dashboard interface
├── test_slot.js       # Slot testing utility
├── package.json       # Node.js dependencies
├── netlify.toml       # Netlify configuration
└── README.md          # This file
```

## 🔧 MCP Server Tools

The server provides these tools:
- `get_balance`: Get account balance
- `get_account_info`: Get account information
- `get_recent_blockhash`: Get latest blockhash
- `get_slot`: Get current slot number
- `get_network_info`: Get comprehensive network information

## 🎨 Customization

The dashboard uses a modern gradient design with:
- Purple-blue gradient background
- Clean white cards with hover effects
- Responsive grid layout
- Auto-refresh functionality
- Error handling and status indicators

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this project for your own purposes. 