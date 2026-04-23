@echo off
echo 🛡️  Starting CyberGuard AI Containers...
docker-compose -f cyberguard/docker-compose.yml up --build -d
echo 📡 Frontend: http://localhost:3000/health
echo 📡 Backend: http://localhost:5000/api/health
pause
