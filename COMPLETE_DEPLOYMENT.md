# 🚀 Complete Solana MCP Dashboard Deployment

This guide will help you deploy both the **frontend dashboard** (Netlify) and **backend MCP server** (Vercel) for a complete solution.

## 📋 Prerequisites

- GitHub account
- Netlify account (free)
- Vercel account (free)

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Create a new GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Solana MCP Dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/solana-mcp-dashboard.git
   git push -u origin main
   ```

### Step 2: Deploy Backend (MCP Server) to Vercel

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up/login with your GitHub account
   - Click "New Project"

2. **Import your repository**
   - Select your `solana-mcp-dashboard` repository
   - Vercel will auto-detect it's a Node.js project

3. **Configure deployment**
   - **Framework Preset**: Node.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: (leave empty - no build needed)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

4. **Environment Variables** (optional)
   - `RPC_URL`: `https://api.devnet.solana.com` (or your preferred RPC)
   - `NODE_ENV`: `production`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Vercel URL (e.g., `https://your-project.vercel.app`)

### Step 3: Deploy Frontend (Dashboard) to Netlify

1. **Go to [netlify.com](https://netlify.com)**
   - Sign up/login with your GitHub account
   - Click "New site from Git"

2. **Connect your repository**
   - Select your `solana-mcp-dashboard` repository
   - Choose the main branch

3. **Configure build settings**
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
   - Click "Deploy site"

4. **Configure the dashboard**
   - Once deployed, go to your Netlify site
   - In the server configuration section, enter your Vercel URL
   - Click "Update Server"

### Step 4: Test Your Complete Solution

1. **Test the backend**
   - Visit your Vercel URL: `https://your-project.vercel.app`
   - You should see server information
   - Test health endpoint: `https://your-project.vercel.app/health`

2. **Test the frontend**
   - Visit your Netlify URL: `https://your-site.netlify.app`
   - The dashboard should connect to your Vercel server
   - Test all features: balance, account info, slot, etc.

## 🔧 Configuration Options

### Environment Variables for Vercel

In your Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `RPC_URL` | `https://api.devnet.solana.com` | Solana RPC endpoint |
| `NODE_ENV` | `production` | Environment mode |

### Custom Domains

**Vercel (Backend)**:
1. Go to Vercel dashboard → Domains
2. Add custom domain
3. Configure DNS

**Netlify (Frontend)**:
1. Go to Netlify dashboard → Domain settings
2. Add custom domain
3. Configure DNS

## 🌐 Production URLs

After deployment, you'll have:

- **Backend**: `https://your-project.vercel.app`
- **Frontend**: `https://your-site.netlify.app`

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - ✅ Already configured in `server.js`
   - ✅ Allows Netlify and Vercel domains

2. **Connection Failed**
   - Check your Vercel URL is correct
   - Verify the MCP server is responding
   - Test the health endpoint

3. **Build Failures**
   - Ensure all files are committed to GitHub
   - Check `package.json` has correct dependencies
   - Verify `vercel.json` and `netlify.toml` are present

### Testing Commands

```bash
# Test backend health
curl https://your-project.vercel.app/health

# Test MCP server
curl -X POST https://your-project.vercel.app \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## 🚀 Advanced Features

### Auto-Deployment

Both Vercel and Netlify will automatically redeploy when you push changes to GitHub.

### Custom RPC Endpoints

You can change the Solana network by updating the `RPC_URL` environment variable:

- **Devnet**: `https://api.devnet.solana.com`
- **Testnet**: `https://api.testnet.solana.com`
- **Mainnet**: `https://api.mainnet-beta.solana.com`

### Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Netlify Analytics**: Track dashboard usage
- **Health Checks**: Monitor server status

## 🎉 Success!

Your complete Solana MCP Dashboard is now live with:

✅ **Reliable Backend** - Vercel serverless functions  
✅ **Fast Frontend** - Netlify CDN  
✅ **Auto-scaling** - Handles traffic automatically  
✅ **HTTPS** - Secure connections  
✅ **Custom Domains** - Professional URLs  
✅ **Auto-deployment** - Updates on Git push  

## 📞 Support

If you encounter issues:

1. Check the deployment logs in Vercel/Netlify
2. Verify environment variables are set correctly
3. Test endpoints individually
4. Check browser console for errors

Your dashboard is now production-ready and can handle real users! 🚀 