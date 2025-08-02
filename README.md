# Trojan Trap

A malware scanning application that allows users to upload files for security analysis.

## Features

- File upload and scanning
- Malware detection using hash comparison
- Payment integration with Stripe
- Detailed scan reports
- Responsive design

## Project Structure

```
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── uploads/           # Directory for uploaded files
└── frontend/
    ├── src/               # Frontend source code
    ├── package.json       # Frontend dependencies
    └── vite.config.js      # Vite configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your Stripe keys:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   ```

4. Start the server:
   ```
   npm start
   ```
   or
   ```
   node server.js
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your Stripe keys:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   VITE_BACKEND_URL=http://localhost:3000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Build for production:
   ```
   npm run build
   ```

## Deployment

This project is configured for deployment with:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)

### Quick Deploy

1. **Fork/Clone** this repository to your GitHub account
2. **Deploy Backend** on Render:
   - Connect your GitHub repo
   - Set Root Directory to `backend`
   - Add environment variables (see [DEPLOYMENT.md](DEPLOYMENT.md))
3. **Deploy Frontend** on Vercel:
   - Import your GitHub repo
   - Set Root Directory to `frontend`
   - Add environment variables (see [DEPLOYMENT.md](DEPLOYMENT.md))

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Stripe Integration

This application uses Stripe for payment processing:

1. Sign up for a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add the keys to your `.env` files as shown in the setup instructions

For testing, you can use Stripe's test card numbers:
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

## Malware Data

The application uses malware hash databases for detection. You can include:
- `MalwareBazaar.zip` containing the full.csv file
- Or place `full.csv` directly in the backend directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.
   npm run build
   npm run dev
   VITE_BACKEND_URL=http://localhost:3000
   npm install
   cd frontend
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   npm install
   cd backend
    └── vite.config.js      # Vite configuration
## Project Structure

