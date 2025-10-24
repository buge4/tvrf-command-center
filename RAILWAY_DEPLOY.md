# Railway Deployment Guide

## Quick Deploy to Railway

### 1. Create Railway Account
Visit [railway.app](https://railway.app) and sign up

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `buge4/tvrf-command-center`
4. Railway will auto-detect the Node.js application

### 3. Configure Environment Variables

In Railway dashboard, add these environment variables:

```
CLAUDE_API_KEY=your_actual_claude_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_random_secret_string
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.railway.app
```

⚠️ **IMPORTANT**: Replace all placeholder values with your actual API keys and credentials.

**Getting your credentials:**

1. **Claude API Key**: Sign up at [console.anthropic.com](https://console.anthropic.com/)
2. **Supabase**: Get from [supabase.com/dashboard](https://supabase.com/dashboard) → Your Project → Settings → API
3. **SESSION_SECRET**: Generate using `openssl rand -base64 32`

### 4. Set Up Database

**IMPORTANT**: Before deploying, run the database schema:

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy and paste content from `database/schema.sql`
4. Execute the SQL

This creates:
- conversations table
- projects table  
- project_sessions table
- Indexes for performance
- RLS policies

### 5. Deploy

Railway will automatically:
1. Install dependencies (`pnpm install`)
2. Start the application (`npm start`)
3. Assign a public URL

### 6. Verify Deployment

Once deployed, test:

```bash
# Health check
curl https://your-app.railway.app/api/health

# Should return:
# {"status":"healthy","timestamp":"...","service":"TVRF Command Center"}
```

### 7. Access Dashboard

Visit: `https://your-app.railway.app/dashboard`

## Railway Configuration

Railway auto-detects:
- **Build Command**: None needed (no build step)
- **Start Command**: `npm start` (from package.json)
- **Port**: Automatically from `process.env.PORT`

## Environment Variables Checklist

- [ ] CLAUDE_API_KEY (get from Anthropic)
- [ ] SUPABASE_URL (from Supabase project)
- [ ] SUPABASE_ANON_KEY (from Supabase project)
- [ ] SUPABASE_SERVICE_ROLE_KEY (from Supabase project)
- [ ] SESSION_SECRET (random string)
- [ ] NODE_ENV=production
- [ ] ALLOWED_ORIGINS (your Railway domain)

## Troubleshooting

### Application Not Starting

1. Check logs in Railway dashboard
2. Verify all environment variables are set
3. Ensure database schema is created

### Database Connection Errors

1. Verify Supabase credentials
2. Check Supabase project is active
3. Confirm RLS policies are enabled

### Claude API Errors

1. Verify API key is valid
2. Check API usage limits
3. Ensure correct model name: claude-3-opus-20240229

## Post-Deployment

1. Update ALLOWED_ORIGINS if using custom domain:
   ```
   ALLOWED_ORIGINS=https://your-app.railway.app,https://your-custom-domain.com
   ```

2. Test all features:
   - Chat functionality
   - Project creation
   - Conversation history
   - Session persistence

## Monitoring

Railway provides:
- Real-time logs
- Metrics dashboard
- Deployment history
- Automatic HTTPS

## Custom Domain (Optional)

1. Go to Railway project settings
2. Click "Domains"
3. Add custom domain
4. Update DNS records as instructed
5. Update ALLOWED_ORIGINS environment variable

## Cost Estimation

Railway offers:
- Free tier: $5 credit/month
- Pro tier: Pay as you go

Estimated costs:
- Small app: ~$5-10/month
- Medium traffic: ~$15-25/month

## Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. Detect the push
2. Pull latest code
3. Install dependencies
4. Restart application
5. Deploy to production

## Automated Deployment Verification

Use the automated verification script to test your deployment:

```bash
# After deployment, run the verification script
node verify-deployment.js https://your-app.railway.app
```

This will test:
- ✅ Health check endpoint
- ✅ Dashboard access
- ✅ Chat API functionality
- ✅ Project management features

For detailed verification steps, see [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/buge4/tvrf-command-center/issues
