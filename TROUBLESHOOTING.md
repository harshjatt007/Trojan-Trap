# Trojan Trap - Troubleshooting Guide

## Current Issue: File Upload Not Working

### Problem Description
The file upload feature is not working in the deployed environment (Vercel frontend + Render backend). Users are experiencing "TypeError: Failed to fetch" errors.

### Root Cause Analysis
1. **CORS Configuration**: The backend was rejecting requests from the Vercel frontend
2. **Upload Endpoint Issues**: The multer middleware was not properly configured for production
3. **Error Handling**: Insufficient error handling made debugging difficult

### Fixes Applied

#### 1. Backend CORS Configuration (server.js)
```javascript
// Simplified CORS configuration
const corsOptions = {
  origin: true, // Allow all origins for now
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
};
```

#### 2. Upload Endpoint Improvements
```javascript
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: "File upload failed", 
        details: err.message 
      });
    }
    // ... rest of the logic
  });
});
```

#### 3. Enhanced Error Handling
- Added comprehensive error logging
- Improved error responses with detailed messages
- Added request/response logging for debugging

#### 4. Frontend Improvements
- Enhanced upload function with better error handling
- Added detailed console logging for debugging
- Created test component for connection verification

### Testing Steps

#### 1. Deploy the Updated Backend
```bash
# Commit and push changes
git add .
git commit -m "Fix CORS and upload issues"
git push origin main
```

#### 2. Test Backend Health
Visit: `https://trojan-trap.onrender.com/health`
Expected: `{"status":"ok","message":"Server is running"}`

#### 3. Test Frontend Connection
Visit: `https://trojan-trap-psi.vercel.app/test`
- Click "Test Backend Connection"
- Check console for detailed logs
- Try uploading a small test file

#### 4. Test File Upload
- Go to the Scanner page
- Try uploading a small file (< 10MB)
- Check browser console for detailed error messages

### Environment Variables

#### Frontend (Vercel)
Make sure these are set in your Vercel dashboard:
```
VITE_BACKEND_URL=https://trojan-trap.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### Backend (Render)
Make sure these are set in your Render dashboard:
```
ALLOWED_ORIGINS=https://trojan-trap-psi.vercel.app
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Common Issues and Solutions

#### 1. "Failed to fetch" Error
**Cause**: Network connectivity or CORS issues
**Solution**: 
- Check if backend is accessible: `https://trojan-trap.onrender.com/health`
- Verify CORS configuration in backend
- Check environment variables

#### 2. "Not allowed by CORS" Error
**Cause**: Backend rejecting requests from frontend
**Solution**: 
- Update CORS configuration to allow Vercel domain
- Check ALLOWED_ORIGINS environment variable

#### 3. "Internal Server Error" on Upload
**Cause**: Backend processing issues
**Solution**:
- Check backend logs in Render dashboard
- Verify file size limits (currently 10MB)
- Check uploads directory permissions

#### 4. Environment Variable Issues
**Cause**: Incorrect or missing environment variables
**Solution**:
- Verify VITE_BACKEND_URL in Vercel
- Check ALLOWED_ORIGINS in Render
- Redeploy after updating environment variables

### Debugging Tools

#### 1. Test Connection Component
Visit `/test` route to:
- Test backend connectivity
- Check CORS configuration
- Test file upload functionality
- View detailed error logs

#### 2. Browser Console
Check for:
- Network request details
- CORS error messages
- Upload progress logs
- Error stack traces

#### 3. Backend Logs
In Render dashboard:
- Check build logs for errors
- Monitor runtime logs
- Look for upload-related errors

### File Size Limits
- **Current Limit**: 10MB per file
- **Supported Formats**: All file types
- **Storage**: Temporary storage in uploads directory

### Performance Considerations
- Large files may take longer to upload
- Backend has timeout limits
- Consider implementing progress indicators

### Security Notes
- CORS is currently set to allow all origins (temporary fix)
- File uploads are validated but not sanitized
- Consider implementing file type restrictions

### Next Steps
1. Deploy the updated backend
2. Test the connection using the test page
3. Try uploading files in the scanner
4. Monitor for any remaining issues
5. Consider implementing additional security measures

### Support
If issues persist:
1. Check the test page for detailed error information
2. Review browser console logs
3. Check Render backend logs
4. Verify all environment variables are set correctly 