# Frontend Deployment Fix Guide

This guide will help you fix the frontend deployment issues with Vercel.

## Issue Analysis

Based on the deployment logs, the frontend build process completes successfully but there are security vulnerabilities that need to be addressed:

1. **Security Vulnerabilities**: 11 vulnerabilities (3 low, 4 moderate, 3 high, 1 critical)
2. **Missing Environment Variables**: The frontend needs proper environment configuration
3. **CORS Configuration**: Backend needs to allow requests from the frontend domain

## Step-by-Step Fix

### 1. Fix Security Vulnerabilities

Run the following command in your frontend directory to fix security vulnerabilities:

```bash
cd frontend
npm audit fix
```

If this doesn't fix all vulnerabilities, you may need to update specific packages:

```bash
npm update
```

### 2. Configure Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add the following variables:

```
VITE_BACKEND_URL=https://trojan-trap.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

Note: Replace `pk_test_your_stripe_publishable_key` with your actual Stripe publishable key.

### 3. Update Backend CORS Configuration

The backend has been updated to use the `ALLOWED_ORIGINS` environment variable. Make sure to set this in your Render dashboard:

```
ALLOWED_ORIGINS=https://your-frontend-vercel-url.vercel.app
```

### 4. Redeploy Frontend

After making these changes:

1. Commit and push your changes to GitHub
2. Trigger a new deployment in Vercel
3. Check the deployment logs for any errors

## Troubleshooting

### If You Still See CORS Errors

1. Make sure the `ALLOWED_ORIGINS` environment variable in Render matches your Vercel frontend URL exactly
2. Restart your Render backend service after updating environment variables

### If You See Build Errors

1. Check that all dependencies are properly listed in package.json
2. Run `npm install` locally to ensure all dependencies are installed correctly

## Post-Deployment Verification

1. Visit your frontend URL
2. Try uploading a file to test the connection to the backend
3. Check browser console for any errors
4. Verify that API calls to the backend are working correctly

## Security Considerations

1. Never commit sensitive keys to Git
2. Use environment variables for all sensitive information
3. Regularly update dependencies to address security vulnerabilities
4. Monitor deployment logs for any errors or warnings

## Support

For issues with:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Render**: Check [Render Documentation](https://render.com/docs)
- **Stripe**: Check [Stripe Documentation](https://stripe.com/docs)
