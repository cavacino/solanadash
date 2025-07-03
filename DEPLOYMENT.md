# 🚀 Netlify Deployment Guide

## Quick Deploy to Netlify

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository
   - Configure build settings:
     - Build command: (leave empty)
     - Publish directory: `.`
   - Click "Deploy site"

### Option 2: Drag & Drop Deploy

1. **Prepare files for upload**
   - Make sure you have these files in your project:
     - `dashboard.html`
     - `netlify.toml`
     - `README.md`

2. **Upload to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder to the deploy area
   - Wait for deployment to complete

## 🔧 Configuration Options

### Custom MCP Server URL

After deployment, you can configure the dashboard to connect to your MCP server:

1. **Via URL Parameter**
   ```
   https://your-site.netlify.app?server=https://your-mcp-server.com
   ```

2. **Via Dashboard Interface**
   - Open your deployed dashboard
   - Enter your MCP server URL in the configuration section
   - Click "Update Server"

### Environment Variables (Optional)

In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add `MCP_SERVER_URL` with your server URL

## 🌐 Deploying the MCP Server

For a complete solution, deploy your MCP server to a hosting service:

### Option 1: Railway
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create new project from GitHub repo
4. Add environment variables if needed
5. Deploy

### Option 2: Heroku
1. Create a `Procfile`:
   ```
   web: node server.js
   ```
2. Deploy to Heroku using their CLI or GitHub integration

### Option 3: Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`

## 🔒 CORS Configuration

If you deploy your MCP server separately, ensure it allows CORS from your Netlify domain:

```javascript
// In your server.js, add CORS headers
app.use(cors({
  origin: ['https://your-site.netlify.app', 'http://localhost:3000']
}));
```

## 📱 Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add custom domain
3. Configure DNS settings
4. Enable HTTPS

## 🔍 Troubleshooting

### Common Issues

1. **Dashboard shows "Disconnected"**
   - Check if your MCP server is running
   - Verify the server URL is correct
   - Ensure CORS is properly configured

2. **Build fails**
   - Make sure `netlify.toml` is in the root directory
   - Check that all required files are present

3. **CORS errors**
   - Add your Netlify domain to your MCP server's CORS configuration
   - Use a CORS proxy if needed

### Testing Locally

Before deploying, test locally:
1. Start your MCP server: `npm start`
2. Open `dashboard.html` in your browser
3. Verify all functionality works

## 🎉 Success!

Once deployed, your dashboard will be available at:
```
https://your-site-name.netlify.app
```

The dashboard will automatically detect if it's connected to an MCP server and display real-time Solana network information! 