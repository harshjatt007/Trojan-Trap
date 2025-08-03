# Deployment Fix Guide for Trojan Trap

## Issue Summary

The frontend deployment on Vercel is failing due to:

1. **CORS Configuration Issues**: Backend not properly configured to accept requests from frontend domain
2. **Environment Variables**: Missing or incorrect configuration of backend URL in frontend
3. **Security Vulnerabilities**: 11 vulnerabilities in frontend dependencies

## Solution Implementation

### 1. Backend CORS Fix

The backend has been updated to properly handle CORS by using environment variables:

```javascript
// In backend/server.js
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins from environment variable
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://trojan-trap-seven.vercel.app",
      "https://trojan-trap.vercel.app",
      // Add your Vercel deployment URL here after deployment
      // Replace with your actual frontend URL when deployed
      process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []
    ].flat();
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
};
```

### 2. Environment Variable Configuration

#### Backend (Render)
In your Render service, add this environment variable:
```
ALLOWED_ORIGINS=https://your-frontend-vercel-url.vercel.app
```

#### Frontend (Vercel)
In your Vercel project, add these environment variables:
```
VITE_BACKEND_URL=https://trojan-trap.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Security Vulnerability Fix

Run this command in your frontend directory:
```bash
cd frontend
npm audit fix
```

## Deployment Steps

### Step 1: Update Backend on Render

1. Push the updated code to GitHub
2. In Render dashboard:
   - Go to your service
   - Add environment variable: `ALLOWED_ORIGINS=https://your-frontend-vercel-url.vercel.app`
   - Redeploy the service

### Step 2: Update Frontend on Vercel

1. In Vercel dashboard:
   - Go to your project settings
   - Add environment variables:
     ```
     VITE_BACKEND_URL=https://trojan-trap.onrender.com
     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
     ```
2. Redeploy the frontend

### Step 3: Fix Security Vulnerabilities

Run in your frontend directory:
```bash
cd frontend
npm audit fix
```

## Verification

After deployment:

1. Visit your frontend URL
2. Try uploading a file
3. Check browser console for any errors
4. Verify API calls to backend are working

## Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` in Render matches your Vercel frontend URL exactly
- Restart Render service after updating environment variables

### Build Failures
- Check that all dependencies are properly listed in package.json
- Run `npm install` locally to verify dependencies

### API Connection Issues
- Verify `VITE_BACKEND_URL` in Vercel matches your Render backend URL
- Check Render logs for any errors

## Security Considerations

1. Never commit sensitive keys to Git
2. Use environment variables for all sensitive information
3. Regularly update dependencies
4. Monitor deployment logs for errors
