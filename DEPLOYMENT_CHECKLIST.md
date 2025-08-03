# Deployment Verification Checklist

## Pre-Deployment Verification

### 1. Environment Variables

#### Render (Backend)
- [ ] `STRIPE_SECRET_KEY` is set with a valid Stripe secret key
- [ ] `ALLOWED_ORIGINS` is set to your Vercel frontend URL (e.g., `https://your-app-name.vercel.app`)

#### Vercel (Frontend) 
- [ ] `VITE_BACKEND_URL` is set to your Render backend URL (e.g., `https://your-render-app.onrender.com`)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` is set with a valid Stripe publishable key

### 2. Configuration Files

#### Backend (server.js)
- [ ] CORS is configured to allow your Vercel frontend URL
- [ ] Environment variables are used for configuration

#### Frontend (Vercel)
- [ ] `VITE_BACKEND_URL` is set to your Render backend URL
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` is set with your Stripe publishable key

## Deployment Steps

### 1. Deploy Backend to Render

1. [ ] Push updated code to your repository
2. [ ] In Render dashboard:
   - [ ] Connect to your repository
   - [ ] Set Root Directory to `backend`
   - [ ] Add environment variables:
      - `STRIPE_SECRET_KEY` = `sk_test_...`
      - `ALLOWED_ORIGINS` = `https://your-frontend-url.vercel.app`
3. [ ] Deploy the service
4. [ ] Note the deployed URL (e.g., `https://your-app-name.onrender.com`)

### 2. Deploy Frontend to Vercel

1. [ ] In Vercel:
   - [ ] Import your repository
   - [ ] Set Root Directory to `frontend`
2. [ ] Add environment variables:
   - [ ] `VITE_BACKEND_URL` = `https://your-render-app.onrender.com`
   - [ ] `VITE_STRIPE_PUBLISHiéndo_KEY` = `pk_test_...`
3. [ ] Deploy the project

### 3. Connect Services

1. [ ] In Render, update the `ALLOWED_ORIGINS` to include your actual Vercel URL
2. [ ] Redeploy the backend service
3. [ ] In Vercel, update the `VITE_BACKEND_URL` to your actual Render URL
4. [ ] Redeploy the frontend

## Post-Deployment Verification

### 1. Frontend Verification

1. [ ] Visit your Vercel frontend URL
2. [ ] Verify the page loads correctly
3. [ ] Check browser console for any errors
4. [ ] Try to upload a file

### 2. Backend Verification

1. [ ] Check Render logs for any errors
2. [ ] Verify the backend is running and listening on the correct port
3. [ ] Check that the backend can accept connections

### 3. Integration Verification

1. [ ] Upload a file through the frontend
2. [ ] Verify the file is sent to the backend
3. [ ] Check that the response is correctly handled
4. [ ] Verify the payment flow works correctly

## Troubleshooting

### CORS Errors

If you see CORS errors:

1. [ ] Check that `ALLOWED_ORIGINS` in Render matches your Vercel frontend URL exactly
2. [ ] Restart the Render service after updating environment variables
3. [ ] Check that the `VITE_BACKEND_URL` in Vercel is the correct Render backend URL

### Build Failures

If the build fails:

1. [ ] Check that all dependencies are properly listed in package.json
2. [ ] Run `npm install` locally to verify dependencies are correct
3. [ ] Check the build logs for specific error messages

### API Connection Issues

If the frontend cannot connect to the backend:

1. [ ] Verify `VITE_BACKEND_URL` in Vercel is the correct Render backend URL
2. [ ] Check that the Render service is running
3. [ ] Check the Render logs for any errors

## Final Verification

- [ ] The application loads without errors
- [ ] File upload works correctly
- [ ] Payment processing works
- [ ] No CORS errors in the browser console
- [ ] All API calls are successful
