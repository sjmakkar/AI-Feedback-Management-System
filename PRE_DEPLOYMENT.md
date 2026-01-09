# Pre-Deployment Checklist

## Backend Requirements

- [x] `vercel.json` - Vercel configuration
- [x] `index.py` - ASGI entry point
- [x] `requirements.txt` - All dependencies
- [x] `.env` - Local development (don't commit)
- [ ] Environment variables set in Vercel:
  - `GEMINI_API_KEY` = your-api-key
  - `DATABASE_URL` = your-postgres-url

## Frontend Requirements

- [x] `.env.production` - Updated with backend URL
- [x] `package.json` - All dependencies
- [ ] Update frontend `.env.production` with real backend URL

## Database

- [x] PostgreSQL on Aiven
- [x] DATABASE_URL in backend env vars

## Before Deploying

1. **Test locally first:**
   ```bash
   cd backend
   python -m uvicorn app:app --reload
   
   # In another terminal
   cd frontend
   npm run dev
   ```

2. **Test form submission works**

3. **Test admin dashboard loads**

4. **Commit to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

## Deployment Order

1. Deploy Backend first
2. Get backend URL from Vercel
3. Update frontend `.env.production` with backend URL
4. Deploy Frontend

---

## After Deployment

1. Visit https://your-frontend.vercel.app
2. Test user feedback form
3. Test admin dashboard
4. Verify AI responses work
5. Check database updates in Aiven

---

## GitHub Push Command

```bash
git add -A
git commit -m "Ready for Vercel: frontend and backend optimized"
git push origin main
```
