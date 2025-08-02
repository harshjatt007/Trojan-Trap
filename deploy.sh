#!/bin/bash

echo "🚀 Trojan-Trap Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git and push to GitHub first."
    exit 1
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit and push your changes first."
    echo "Run: git add . && git commit -m 'Your commit message' && git push"
    exit 1
fi

echo "✅ Repository is ready for deployment"
echo ""

echo "📋 Deployment Checklist:"
echo "1. Backend (Render):"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set Root Directory: backend"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Add environment variables:"
echo "     - STRIPE_SECRET_KEY=your_stripe_secret_key"
echo "     - PORT=3000"
echo ""

echo "2. Frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Create new project"
echo "   - Import your GitHub repo"
echo "   - Set Root Directory: frontend"
echo "   - Framework: Vite"
echo "   - Add environment variables:"
echo "     - VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key"
echo "     - VITE_BACKEND_URL=https://your-backend-name.onrender.com"
echo ""

echo "3. Post-Deployment:"
echo "   - Update CORS settings in backend with your Vercel URL"
echo "   - Test the application"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""

echo "🔗 Useful Links:"
echo "- Render Dashboard: https://dashboard.render.com"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Stripe Dashboard: https://dashboard.stripe.com"
echo ""

echo "🎯 Ready to deploy! Follow the checklist above." 