#!/bin/bash

# Deploy script untuk Dapur Ngebul Client ke Surge.sh
# Usage: ./deploy-surge.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CLIENT_DIR="dapur-ngebul-client"
DIST_DIR="$CLIENT_DIR/dist"
DOMAIN="dapur-ngebul-teguh.surge.sh"

echo -e "${GREEN}🚀 Starting deployment to Surge.sh...${NC}"

# Check if we're in the right directory
if [ ! -d "$CLIENT_DIR" ]; then
    echo -e "${RED}❌ Error: $CLIENT_DIR directory not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if surge is installed
if ! command -v surge &> /dev/null; then
    echo -e "${YELLOW}⚠️  Surge CLI not found. Installing...${NC}"
    npm install -g surge
fi

# Navigate to client directory
cd "$CLIENT_DIR"

echo -e "${GREEN}📦 Building application...${NC}"

# Build/Export the application
npm run export

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: dist directory not found after export!${NC}"
    exit 1
fi

# Navigate to dist directory
cd dist

echo -e "${GREEN}🌐 Deploying to Surge.sh ($DOMAIN)...${NC}"

# Deploy to Surge
surge . "$DOMAIN"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌍 Your app is live at: https://$DOMAIN${NC}"

# Return to root directory
cd ../..

echo -e "${GREEN}✨ Done!${NC}"

