# Railway Deployment Checklist

## ✅ Pre-Deployment

### Code & Repository
- [ ] Code committed and pushed to GitHub
- [ ] Repository is public or Railway has access
- [ ] All sensitive data removed from code (API keys, secrets)
- [ ] Package.json has correct start command: `npm start`
- [ ] PORT configuration uses `process.env.PORT || 3000`
- [ ] Node.js version >= 18.0.0 in package.json

### Database
- [ ] Supabase project created and active
- [ ] Database schema executed in Supabase SQL Editor
- [ ] Tables created:
  - [ ] conversations table
  - [ ] projects table
  - [ ] project_sessions table
- [ ] RLS policies configured
- [ ] Indexes created for performance
- [ ] Database credentials verified

### Environment Variables
- [ ] All required environment variables identified
- [ ] API keys obtained:
  - [ ] Claude API key (Anthropic Console)
  - [ ] Supabase project credentials
- [ ] Random session secret generated (32+ chars)
- [ ] Environment variable documentation reviewed

## ✅ Railway Setup

### Account & Project
- [ ] Railway account created at https://railway.app
- [ ] GitHub account connected to Railway
- [ ] New project created in Railway dashboard
- [ ] GitHub repository connected: `buge4/tvrf-command-center`
- [ ] Railway auto-detected Node.js application

### Environment Variables (Railway Dashboard)
Set these variables in Railway → Variables tab:

#### Required
- [ ] `CLAUDE_API_KEY` = sk-ant-api03-your_actual_key
- [ ] `SUPABASE_URL` = https://your-project.supabase.co
- [ ] `SUPABASE_ANON_KEY` = your_supabase_anon_key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = your_supabase_service_role_key

#### Recommended
- [ ] `SESSION_SECRET` = random_32_character_string
- [ ] `NODE_ENV` = production
- [ ] `ALLOWED_ORIGINS` = https://your-app.railway.app (update after deployment)

#### Optional
- [ ] `PORT` = (Railway will auto-set, usually not needed)

### Build & Deploy
- [ ] Railway build started automatically
- [ ] Dependencies installed successfully
- [ ] No build errors in Railway logs
- [ ] Application started successfully
- [ ] Public URL generated: `https://your-app.railway.app`

## ✅ Post-Deployment Verification

### Health Checks
- [ ] Server responds: `curl https://your-app.railway.app/api/health`
- [ ] Returns: `{"status":"healthy","service":"TVRF Command Center"}`
- [ ] Status code: 200

### Web Interface
- [ ] Dashboard loads: `https://your-app.railway.app/dashboard`
- [ ] No JavaScript console errors
- [ ] UI elements render correctly

### API Endpoints
- [ ] Root path: `GET /` → 200 OK
- [ ] Health check: `GET /api/health` → 200 OK
- [ ] Dashboard: `GET /dashboard` → 200 OK
- [ ] Chat API: `POST /api/chat` → 200 OK
- [ ] Projects API: `GET /api/projects` → 200 OK

### Functionality Tests
- [ ] Chat messages sent successfully
- [ ] AI responses received from Claude
- [ ] Project creation works
- [ ] Conversation history persists
- [ ] Session management works

### Database Operations
- [ ] Conversations saved to Supabase
- [ ] Projects saved to Supabase
- [ ] No database connection errors
- [ ] RLS policies working correctly

## ✅ Post-Deployment Configuration

### Security
- [ ] Update `ALLOWED_ORIGINS` with actual Railway domain
- [ ] Verify CORS configuration
- [ ] Check security headers (Helmet)
- [ ] Rate limiting active

### Monitoring
- [ ] Railway logs accessible
- [ ] Application logs show correct output
- [ ] Error logs monitored
- [ ] Performance metrics visible

### Production Checklist
- [ ] NODE_ENV=production set
- [ ] Debug/development tools disabled
- [ ] Error handling configured
- [ ] Environment variables secured

## ✅ Optional Enhancements

### Custom Domain
- [ ] Custom domain configured (optional)
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] ALLOWED_ORIGINS updated with custom domain

### Continuous Deployment
- [ ] GitHub webhook configured
- [ ] Auto-deploy on push to main branch
- [ ] Branch protection rules set (if needed)
- [ ] Deployment notifications enabled

### Additional Monitoring
- [ ] External monitoring service added
- [ ] Uptime monitoring configured
- [ ] Error tracking enabled (e.g., Sentry)
- [ ] Performance monitoring active

## 🚀 Quick Verification Commands

```bash
# Health check
curl https://your-app.railway.app/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"TVRF Command Center"}

# Test chat
curl -X POST https://your-app.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, deployment test!"}'

# Automated verification
node verify-deployment.js https://your-app.railway.app
```

## 🔧 Troubleshooting

### Common Issues

**Application won't start**
- Check Railway build logs
- Verify all environment variables set
- Ensure database schema created
- Check for syntax errors in code

**Database connection errors**
- Verify Supabase credentials
- Check Supabase project is active
- Ensure RLS policies configured
- Test database connection locally first

**Chat API errors**
- Verify Claude API key valid
- Check API quota/limits
- Review error logs
- Test API key with curl directly

**CORS errors**
- Update ALLOWED_ORIGINS with Railway domain
- Verify origin matches exactly
- Check for typos in domain

### Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Issues**: https://github.com/buge4/tvrf-command-center/issues
- **Supabase Docs**: https://supabase.com/docs
- **Anthropic Claude API**: https://console.anthropic.com/

## 📋 Deployment Summary

After completing all checks above:

✅ **Deployment Status**: SUCCESSFUL

- ✅ All tests passed
- ✅ Application running
- ✅ Database connected
- ✅ APIs functional
- ✅ Security configured

**Next Steps**:
1. Monitor logs for first 24 hours
2. Test all features thoroughly
3. Set up custom monitoring if needed
4. Share URL with users
5. Plan for future updates

---

**Deployment Date**: _______________
**Railway App URL**: _______________
**Deployed By**: _______________
**Verification Status**: _______________

## 📞 Support

If you encounter issues during deployment:

1. Check Railway build/deploy logs
2. Review this checklist for missed items
3. Test locally with `npm start`
4. Verify all environment variables
5. Check database schema and permissions
6. Open GitHub issue with logs/details

For Railway-specific issues:
- Check Railway Status: https://railwaystatus.com/
- Railway Support: https://discord.gg/railway

---

*This checklist ensures successful Railway deployment of the TVRF Command Center*
