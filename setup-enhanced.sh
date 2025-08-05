#!/bin/bash

# Enhanced Order Management Setup Script v2.0
# Professional-grade setup for competition-level development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[$1/8]${NC} ${GREEN}$2${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

clear
echo -e "${PURPLE}"
echo "========================================"
echo " ENHANCED ORDER MANAGEMENT SETUP v2.0"
echo "========================================"
echo -e "${NC}"
echo "Setting up a professional-grade order management system..."
echo

# Step 1: Create backup
print_step 1 "Creating backup..."
if [ -d "backup" ]; then
    rm -rf backup
fi
mkdir -p backup
[ -f "package.json" ] && cp package.json backup/ 2>/dev/null || true
[ -f "docker-compose.yml" ] && cp docker-compose.yml backup/ 2>/dev/null || true
print_success "Backup created"

# Step 2: Check Node.js version
print_step 2 "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//')
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
if [ "$MAJOR_VERSION" -lt 18 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Version 18+ recommended for optimal performance."
else
    print_success "Node.js version $NODE_VERSION detected"
fi

# Step 3: Install enhanced backend dependencies
print_step 3 "Installing enhanced backend dependencies..."
cd order-service

print_info "Installing core dependencies..."
npm install

print_info "Installing real-time dependencies..."
npm install socket.io cors helmet express-rate-limit

print_info "Installing monitoring dependencies..."
npm install winston morgan compression

print_info "Installing validation dependencies..."
npm install joi multer express-validator

print_info "Installing development dependencies..."
npm install --save-dev nodemon @types/cors @types/helmet @types/multer @types/compression

print_success "Backend dependencies installed"

# Step 4: Install enhanced frontend dependencies
print_step 4 "Installing enhanced frontend dependencies..."
cd ../order-ui

print_info "Installing core dependencies..."
npm install

print_info "Installing real-time dependencies..."
npm install socket.io-client

print_info "Installing UI/UX dependencies..."
npm install chart.js react-chartjs-2 react-bootstrap bootstrap

print_info "Installing utility dependencies..."
npm install lodash date-fns react-toastify

print_info "Installing development dependencies..."
npm install --save-dev @types/lodash

print_success "Frontend dependencies installed"

# Step 5: Create essential directories
print_step 5 "Creating project directories..."
cd ..
mkdir -p logs uploads exports temp .aws
print_success "Project directories created"

# Step 6: Setup environment files
print_step 6 "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOL'
# Enhanced Order Management Environment
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
UPLOAD_MAX_SIZE=10485760
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
CACHE_TTL=3600
WEBSOCKET_ENABLED=true
ANALYTICS_ENABLED=true

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
DYNAMODB_TABLE_NAME=orders
S3_BUCKET_NAME=order-management-invoices
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:order-notifications

# Frontend Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WEBSOCKET_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=2.0.0
REACT_APP_FEATURES=analytics,websocket,export,bulk
EOL
    print_success "Environment file created"
else
    print_info "Environment file already exists, skipping..."
fi

# Step 7: Create Docker configuration for enhanced setup
print_step 7 "Setting up Docker configuration..."
if [ ! -f "docker-compose.enhanced.yml" ]; then
    cat > docker-compose.enhanced.yml << 'EOL'
version: '3.8'

services:
  order-service:
    build:
      context: ./order-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - WEBSOCKET_ENABLED=true
      - ANALYTICS_ENABLED=true
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
      - ./exports:/app/exports
    networks:
      - order-network

  order-ui:
    build:
      context: ./order-ui
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001
      - REACT_APP_WEBSOCKET_URL=http://localhost:3001
      - REACT_APP_ENVIRONMENT=development
    volumes:
      - ./order-ui/src:/app/src
    networks:
      - order-network
    depends_on:
      - order-service

networks:
  order-network:
    driver: bridge
EOL
    print_success "Docker configuration created"
else
    print_info "Docker configuration already exists, skipping..."
fi

# Step 8: Display completion information
print_step 8 "Setup completed successfully!"
echo
echo -e "${PURPLE}"
echo "========================================"
echo " ENHANCED SETUP COMPLETED"
echo "========================================"
echo -e "${NC}"
echo
echo "Your professional-grade order management system is ready!"
echo
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Review the .env file and update AWS credentials"
echo "2. Start the development servers:"
echo "   - Backend:  cd order-service && npm run dev"
echo "   - Frontend: cd order-ui && npm start"
echo
echo -e "${GREEN}FEATURES ENABLED:${NC}"
echo "✅ Real-time WebSocket communication"
echo "✅ Advanced analytics dashboard"
echo "✅ Performance monitoring"
echo "✅ File upload with validation"
echo "✅ Bulk operations"
echo "✅ Data export functionality"
echo "✅ Modern UI with animations"
echo "✅ Comprehensive error handling"
echo "✅ Docker containerization"
echo "✅ Professional logging"
echo
echo -e "${CYAN}URLS:${NC}"
echo "- Frontend: http://localhost:3000"
echo "- Backend:  http://localhost:3001"
echo "- API Docs: http://localhost:3001/api-docs"
echo "- Health:   http://localhost:3001/health"
echo
echo -e "${BLUE}DEVELOPMENT COMMANDS:${NC}"
echo "npm run dev      | Start with hot reload"
echo "npm run build    | Build for production"
echo "npm run test     | Run comprehensive tests"
echo "npm run lint     | Check code quality"
echo
echo -e "${GREEN}Your system is now at PROFESSIONAL COMPETITION LEVEL!${NC}"
echo -e "${PURPLE}========================================${NC}"
echo

# Make scripts executable
chmod +x setup-enhanced.sh 2>/dev/null || true

print_success "Setup script completed! Your enhanced order management system is ready for development."
