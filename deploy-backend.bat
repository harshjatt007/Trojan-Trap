@echo off
echo ========================================
echo Trojan Trap - Backend Deployment Script
echo ========================================
echo.

echo 1. Checking if backend directory exists...
if not exist "backend" (
    echo ERROR: Backend directory not found!
    pause
    exit /b 1
)

echo 2. Backend directory found. 
echo.
echo 3. Please follow these steps to deploy:
echo.
echo    a) Go to your Render dashboard
echo    b) Find your Trojan Trap backend service
echo    c) Go to the "Manual Deploy" section
echo    d) Click "Deploy latest commit"
echo.
echo    OR
echo.
echo    e) Push your changes to GitHub:
echo       git add .
echo       git commit -m "Fix CORS and upload issues"
echo       git push origin main
echo.
echo 4. After deployment, test the connection at:
echo    https://trojan-trap-psi.vercel.app/test
echo.
echo 5. The backend should now accept uploads from your Vercel frontend.
echo.

pause 