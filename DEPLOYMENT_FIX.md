# Trojan-Trap Deployment Fix Guide

## Issues Fixed

### 1. CORS Configuration
- Added `https://trojan-trap-psi.vercel.app` to allowed origins in backend
- Updated environment examples with correct URLs

### 2. Environment Variables Setup

#### For Vercel (Frontend):
You need to set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
VITE_BACKEND_URL=https://trojan-trap.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

#### For Render (Backend):
You need to set these environment variables in your Render dashboard:

1. Go to your Render service dashboard
2. Navigate to Environment > Environment Variables
3. Add the following variables:

```
STRIPE_SECRET_KEY=your_stripe_secret_key_here
ALLOWED_ORIGINS=https://trojan-trap-psi.vercel.app
PORT=3000
```

### 3. File Upload Issues
The file upload should now work correctly with the updated CORS configuration.

## Steps to Deploy

### Frontend (Vercel):
1. Push your changes to GitHub
2. Vercel will automatically redeploy
3. Set the environment variables in Vercel dashboard
4. Redeploy if needed

### Backend (Render):
1. Push your changes to GitHub
2. Render will automatically redeploy
3. Set the environment variables in Render dashboard
4. Redeploy if needed

## Testing the Integration

1. Visit your Vercel frontend: https://trojan-trap-psi.vercel.app/
2. Try uploading a file for scanning
3. Check browser console for any CORS errors
4. Verify that the file upload and scan process works

## Troubleshooting

### If CORS errors persist:
1. Check that the environment variables are set correctly
2. Verify the backend URL in the frontend environment
3. Ensure the frontend URL is in the backend's allowed origins
4. Clear browser cache and try again

### If file upload fails:
1. Check the browser's network tab for request details
2. Verify the backend is running and accessible
3. Check Render logs for any server errors
4. Ensure the uploads directory exists on the backend

## Current Configuration

- Frontend: https://trojan-trap-psi.vercel.app/
- Backend: https://trojan-trap.onrender.com
- CORS: Configured to allow communication between these domains
