# Trojan-Trap: Advanced Malware Scanner

A comprehensive malware detection system with real-time scanning, threat analysis, and detailed reporting.

## 🌟 Features

- **Real-time File Scanning**: Upload and scan files for malware threats
- **Advanced Threat Detection**: Multiple detection engines and signature matching
- **Detailed Reports**: Comprehensive threat analysis and recommendations
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Secure Payments**: Integrated Stripe payment processing
- **Cloud Deployment**: Ready for Vercel and Render deployment

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Stripe account (for payments)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshjatt007/Trojan-Trap.git
   cd Trojan-Trap
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your Stripe keys
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp env.example .env
   # Edit .env with your backend URL and Stripe keys
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## 🌐 Deployment

### Frontend (Vercel)

1. **Connect to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard:
     ```
     VITE_BACKEND_URL=https://your-backend-name.onrender.com
     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
     ```

2. **Deploy**
   - Vercel will automatically deploy on push
   - Your app will be available at: `https://your-app-name.vercel.app`

### Backend (Render)

1. **Create Render Service**
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `node server.js`

2. **Environment Variables**
   Add these in Render dashboard:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   ALLOWED_ORIGINS=https://your-frontend-name.vercel.app
   PORT=3000
   ```

3. **Deploy**
   - Render will automatically deploy
   - Your backend will be available at: `https://your-service-name.onrender.com`

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_BACKEND_URL=https://your-backend-name.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

#### Backend (.env)
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
ALLOWED_ORIGINS=https://your-frontend-name.vercel.app
PORT=3000
```

## 🛠️ API Endpoints

- `POST /upload` - Upload file for scanning
- `POST /scan` - Scan uploaded file
- `POST /verify-payment` - Verify payment and get results
- `GET /report/:reportId` - Get scan report
- `GET /health` - Health check

## 🔍 Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` in backend includes your frontend URL
- Check that environment variables are set correctly
- Clear browser cache and try again

### File Upload Issues
- Verify backend is running and accessible
- Check file size limits (50MB max)
- Ensure uploads directory exists on backend

### Payment Issues
- Verify Stripe keys are correct
- Check Stripe dashboard for payment status
- Ensure currency and amount are properly configured

### Deployment Issues
- Check build logs for errors
- Verify all environment variables are set
- Ensure Node.js version compatibility

## 📁 Project Structure

```
Trojan-Trap/
├── backend/                 # Express.js backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── uploads/            # File upload directory
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── config/         # API configuration
│   │   └── libs/           # Utility functions
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the deployment logs
3. Open an issue on GitHub
4. Check the browser console for errors

## 🔗 Links

- **Live Demo**: [https://trojan-trap-psi.vercel.app/](https://trojan-trap-psi.vercel.app/)
- **Backend**: [https://trojan-trap.onrender.com](https://trojan-trap.onrender.com)
- **GitHub**: [https://github.com/harshjatt007/Trojan-Trap](https://github.com/harshjatt007/Trojan-Trap)

