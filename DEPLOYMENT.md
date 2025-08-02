# Deployment Guide

This guide will help you deploy the Trojan-Trap application with the frontend on Vercel and backend on Render.

## Prerequisites

1. **GitHub Account**: Ensure your code is pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **Stripe Account**: For payment processing (optional for testing)

## Backend Deployment on Render

### Step 1: Deploy Backend to Render

1. **Login to Render** and click "New +"
2. **Select "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `trojan-trap-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid for better performance)

### Step 2: Configure Environment Variables

In your Render service dashboard, go to "Environment" tab and add:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PORT=3000
```

### Step 3: Deploy

Click "Create Web Service" and wait for deployment to complete.

**Note**: Your backend URL will be: `https://your-service-name.onrender.com`

## Frontend Deployment on Vercel

### Step 1: Deploy Frontend to Vercel

1. **Login to Vercel** and click "New Project"
2. **Import your GitHub repository**
3. **Configure the project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Configure Environment Variables

In your Vercel project dashboard, go to "Settings" → "Environment Variables" and add:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_BACKEND_URL=https://your-backend-name.onrender.com
```

### Step 3: Deploy

Click "Deploy" and wait for deployment to complete.

**Note**: Your frontend URL will be: `https://your-project-name.vercel.app`

## Post-Deployment Configuration

### Step 1: Update CORS Settings

After getting your Vercel frontend URL, update the backend CORS settings:

1. Go to your Render backend service
2. Add environment variable:
   ```
   ALLOWED_ORIGINS=https://your-frontend-name.vercel.app
   ```
3. Redeploy the backend service

### Step 2: Update Frontend Backend URL

1. Go to your Vercel frontend project
2. Update the `VITE_BACKEND_URL` environment variable with your Render backend URL
3. Redeploy the frontend

## Environment Variables Reference

### Backend (.env)
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PORT=3000
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_BACKEND_URL=https://your-backend-name.onrender.com
```

## Testing the Deployment

1. **Health Check**: Visit `https://your-backend-name.onrender.com/health`
2. **Frontend**: Visit your Vercel URL
3. **File Upload**: Test the file scanning functionality
4. **Payment**: Test with Stripe test cards

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend URL is added to the backend's allowed origins
2. **Build Failures**: Check that all dependencies are properly listed in package.json
3. **Environment Variables**: Verify all required environment variables are set
4. **Port Issues**: Render automatically assigns ports, so don't hardcode port 3000

### Debugging

1. **Backend Logs**: Check Render service logs for errors
2. **Frontend Logs**: Check Vercel deployment logs
3. **Network Tab**: Use browser dev tools to check API calls

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to Git
2. **CORS**: Only allow necessary origins
3. **File Uploads**: Implement proper file validation
4. **Rate Limiting**: Consider adding rate limiting for production

## Scaling Considerations

1. **Render Free Tier**: Has limitations on requests and uptime
2. **Vercel Free Tier**: Good for most use cases
3. **Database**: Consider adding a database for production use
4. **CDN**: Vercel provides global CDN automatically

## Support

For issues with:
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **Render**: Check [Render Documentation](https://render.com/docs)
- **Stripe**: Check [Stripe Documentation](https://stripe.com/docs)
