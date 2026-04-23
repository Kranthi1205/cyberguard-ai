@echo off
echo 🛑 Stopping CyberGuard AI Containers...
docker-compose -f cyberguard/docker-compose.yml down
echo ✅ All containers stopped.
pause
