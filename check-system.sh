#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "           ECOTRADE SYSTEM STATUS CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "1. Node.js: "
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    echo -e "${GREEN}✓ Installed ($VERSION)${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
fi

# Check npm
echo -n "2. npm: "
if command -v npm &> /dev/null; then
    VERSION=$(npm --version)
    echo -e "${GREEN}✓ Installed ($VERSION)${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
fi

# Check MongoDB
echo -n "3. MongoDB: "
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
fi

# Check if MongoDB is running
echo -n "4. MongoDB Running: "
if nc -z localhost 27017 2>/dev/null; then
    echo -e "${GREEN}✓ Yes${NC}"
else
    echo -e "${RED}✗ No${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "                   FILE STATUS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check server files
echo -n "5. Server .env: "
if [ -f "project/server/.env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
fi

echo -n "6. Frontend .env: "
if [ -f "project/ecotrade/.env" ]; then
    echo -e "${GREEN}✓ Exists${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
fi

echo -n "7. Server node_modules: "
if [ -d "project/server/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
fi

echo -n "8. Frontend node_modules: "
if [ -d "project/ecotrade/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "                   PORT STATUS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if ports are in use
echo -n "9. Port 5000 (Backend): "
if nc -z localhost 5000 2>/dev/null; then
    echo -e "${YELLOW}⚠ In use${NC}"
else
    echo -e "${GREEN}✓ Available${NC}"
fi

echo -n "10. Port 5173 (Frontend): "
if nc -z localhost 5173 2>/dev/null; then
    echo -e "${YELLOW}⚠ In use${NC}"
else
    echo -e "${GREEN}✓ Available${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "                   NEXT STEPS"
echo "═══════════════════════════════════════════════════════════"
echo ""

if ! command -v mongod &> /dev/null; then
    echo -e "${RED}[REQUIRED]${NC} Install MongoDB:"
    echo "  - macOS: brew install mongodb-community"
    echo "  - Windows: https://www.mongodb.com/try/download/community"
    echo "  - Linux: https://docs.mongodb.com/manual/administration/install-on-linux/"
    echo ""
fi

if ! nc -z localhost 27017 2>/dev/null; then
    echo -e "${RED}[REQUIRED]${NC} Start MongoDB:"
    echo "  - macOS: brew services start mongodb-community"
    echo "  - Windows: Check Services panel"
    echo "  - Linux: sudo systemctl start mongod"
    echo ""
fi

echo -e "${GREEN}[READY]${NC} Start the application:"
echo "  1. cd project/server && npm run dev"
echo "  2. cd project/ecotrade && npm run dev (in new terminal)"
echo "  3. Open http://localhost:5173"
echo ""
echo "═══════════════════════════════════════════════════════════"
