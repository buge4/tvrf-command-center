#!/bin/bash

echo "🚀 Preparing Railway deployment..."

# Add all new Railway files
git add railway.json package.json server.js RAILWAY_DEPLOYMENT.md

# Create commit with Railway deployment files
git commit -m "Add Railway deployment configuration

- Add railway.json for Railway deployment
- Add package.json with Express server dependencies  
- Add server.js with API endpoints and static file serving
- Add comprehensive RAILWAY_DEPLOYMENT.md guide
- Ready for one-click Railway deployment"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "✅ Railway deployment files pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
echo "3. Select your repository"
echo "4. Add environment variables:"
echo "   - CLAUDE_API_KEY (or OPENAI_API_KEY)"
echo "5. Deploy!"
echo ""
echo "🌐 Your app will be available at:"
echo "https://your-project-name.railway.app"