# Trojan Trap - Troubleshooting Guide

## Current Issue: File Upload Not Working

### Problem Description
The file upload feature is not working in the deployed environment (Vercel frontend + Render backend). Users are experiencing "TypeError: Failed to fetch" errors.

### Root Cause Analysis
1. **CORS Configuration**: The backend was rejecting requests from the Vercel frontend
2. **Upload Endpoint Issues**: The multer middleware was not properly configured for production
3. **Error Handling**: Insufficient error handling made debugging difficult
4. **File Size Limits**: Previous 10MB limit was too restrictive
5. **Scan Logic**: All files were showing as safe regardless of type

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
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: "File upload failed", 
        details: err.message 
      });
    }
    // Enhanced file analysis and payment logic
  });
});
```

#### 3. Enhanced File Size Limits
- **Previous**: 10MB limit
- **Current**: 500MB limit
- **Payment Required**: Files > 50MB or dangerous file types

#### 4. Improved Scan Logic
- **File Type Detection**: Identifies dangerous file types (.exe, .bat, .js, etc.)
- **Hash-based Detection**: Checks against known malicious hashes
- **Threat Level Assessment**: Based on file type and content analysis
- **Payment Integration**: Premium scans for large or dangerous files

#### 5. Payment System Integration
- **Stripe Integration**: For premium scans
- **Payment Modal**: Secure payment processing
- **Scan Types**: Basic (free) vs Premium (paid)

### Testing Steps

#### 1. Deploy the Updated Backend
```bash
# Commit and push changes
git add .
git commit -m "Fix CORS, upload issues, and add payment system"
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
- Try uploading files of different sizes:
  - Small files (< 50MB): Should work for free
  - Large files (> 50MB): Should require payment
  - Dangerous file types (.exe, .bat): Should require payment

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

### File Size and Payment Rules

#### Free Scans (Basic)
- **File Size**: Up to 50MB
- **File Types**: Safe file types (images, documents, etc.)
- **Features**: Basic threat detection

#### Premium Scans (Paid)
- **File Size**: 50MB - 500MB
- **File Types**: Dangerous file types (.exe, .bat, .js, .jar, etc.)
- **Cost**: ₹10 per scan
- **Features**: Advanced threat detection, detailed analysis

### Common Issues and Solutions

#### 1. "Failed to fetch" Error
**Cause**: Network connectivity or CORS issues
**Solution**: 
- Check if backend is accessible: `https://trojan-trap.onrender.com/health`
- Verify CORS configuration in backend
- Check environment variables

#### 2. "File too large" Error
**Cause**: File exceeds 500MB limit
**Solution**: 
- Reduce file size or split into smaller files
- Consider using premium scan for large files

#### 3. Payment Modal Not Appearing
**Cause**: Stripe configuration issues
**Solution**:
- Verify VITE_STRIPE_PUBLISHABLE_KEY is set
- Check browser console for Stripe errors
- Ensure payment intent creation is successful

#### 4. All Files Showing as Safe
**Cause**: Scan logic not working properly
**Solution**:
- Check backend logs for scan processing errors
- Verify malware hash database is loaded
- Test with known dangerous file types

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
- Payment processing errors
- Error stack traces

#### 3. Backend Logs
In Render dashboard:
- Check build logs for errors
- Monitor runtime logs
- Look for upload-related errors
- Payment intent creation logs

### File Size Limits
- **Current Limit**: 500MB per file
- **Free Tier**: Up to 50MB
- **Premium Tier**: 50MB - 500MB
- **Supported Formats**: All file types
- **Storage**: Temporary storage in uploads directory

### Payment System
- **Provider**: Stripe
- **Currency**: INR (₹)
- **Basic Scan**: Free
- **Premium Scan**: ₹10
- **Payment Methods**: Credit/Debit cards
- **Security**: PCI compliant

### Performance Considerations
- Large files may take longer to upload
- Backend has timeout limits
- Payment processing adds additional time
- Consider implementing progress indicators

### Security Notes
- CORS is currently set to allow all origins (temporary fix)
- File uploads are validated but not sanitized
- Payment information is handled securely by Stripe
- Consider implementing file type restrictions

### Next Steps
1. Deploy the updated backend
2. Test the connection using the test page
3. Try uploading files of different sizes and types
4. Test the payment system with small amounts
5. Monitor for any remaining issues
6. Consider implementing additional security measures

### Support
If issues persist:
1. Check the test page for detailed error information
2. Review browser console logs
3. Check Render backend logs
4. Verify all environment variables are set correctly
5. Test payment system with Stripe test cards 