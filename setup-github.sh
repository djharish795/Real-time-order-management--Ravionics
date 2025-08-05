#!/bin/bash

# 🚀 GitHub Repository Setup and Deployment Script
# Run this script to set up your GitHub repository and deploy to AWS

set -e  # Exit on any error

echo "🎯 Real-time Order Management System - GitHub Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_warning "AWS CLI is not installed. Installing..."
    # Add AWS CLI installation based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        sudo installer -pkg AWSCLIV2.pkg -target /
        rm AWSCLIV2.pkg
    else
        print_error "Please install AWS CLI manually for your operating system"
        exit 1
    fi
fi

print_step "Step 1: Initialize Git Repository"
if [ ! -d ".git" ]; then
    git init
    print_success "Git repository initialized"
else
    print_success "Git repository already exists"
fi

print_step "Step 2: Check for GitHub remote"
if git remote get-url origin &> /dev/null; then
    REMOTE_URL=$(git remote get-url origin)
    print_success "GitHub remote already configured: $REMOTE_URL"
else
    print_warning "No GitHub remote configured"
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/real-time-order-management.git): " REPO_URL
    
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        print_success "GitHub remote added: $REPO_URL"
    else
        print_error "Repository URL is required"
        exit 1
    fi
fi

print_step "Step 3: Install Dependencies"

# Install backend dependencies
if [ -d "order-service" ]; then
    cd order-service
    if [ -f "package.json" ]; then
        print_step "Installing backend dependencies..."
        npm install
        print_success "Backend dependencies installed"
    fi
    cd ..
fi

# Install frontend dependencies
if [ -d "order-ui" ]; then
    cd order-ui
    if [ -f "package.json" ]; then
        print_step "Installing frontend dependencies..."
        npm install
        print_success "Frontend dependencies installed"
    fi
    cd ..
fi

print_step "Step 4: Build Project"

# Build backend
if [ -d "order-service" ]; then
    cd order-service
    if npm run build &> /dev/null; then
        print_success "Backend built successfully"
    else
        print_warning "Backend build failed or not configured"
    fi
    cd ..
fi

# Build frontend
if [ -d "order-ui" ]; then
    cd order-ui
    if npm run build &> /dev/null; then
        print_success "Frontend built successfully"
    else
        print_warning "Frontend build failed or not configured"
    fi
    cd ..
fi

print_step "Step 5: Commit and Push to GitHub"

# Add all files
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    # Commit changes
    COMMIT_MESSAGE="🚀 Deploy: Real-time Order Management System - $(date)"
    git commit -m "$COMMIT_MESSAGE"
    print_success "Changes committed: $COMMIT_MESSAGE"
    
    # Push to GitHub
    BRANCH_NAME=$(git branch --show-current)
    if [ -z "$BRANCH_NAME" ]; then
        BRANCH_NAME="main"
        git checkout -b main
    fi
    
    print_step "Pushing to GitHub..."
    if git push -u origin "$BRANCH_NAME"; then
        print_success "Code pushed to GitHub successfully!"
    else
        print_error "Failed to push to GitHub. Please check your credentials and repository access."
        exit 1
    fi
fi

print_step "Step 6: AWS Configuration Check"

# Check AWS credentials
if aws sts get-caller-identity &> /dev/null; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
    print_success "AWS credentials configured"
    echo -e "   Account: ${GREEN}$AWS_ACCOUNT${NC}"
    echo -e "   User: ${GREEN}$AWS_USER${NC}"
else
    print_warning "AWS credentials not configured"
    echo "Please run: aws configure"
    echo "And set up your AWS credentials"
fi

print_step "Step 7: GitHub Secrets Reminder"
echo ""
echo -e "${YELLOW}🔐 IMPORTANT: Configure these GitHub Secrets${NC}"
echo "================================================"
echo "Go to: GitHub Repository → Settings → Secrets and variables → Actions"
echo ""
echo "Required Secrets:"
echo "├── AWS_ACCESS_KEY_ID"
echo "├── AWS_SECRET_ACCESS_KEY"
echo "├── AWS_REGION (e.g., us-east-1)"
echo "├── DYNAMODB_TABLE_NAME (e.g., orders)"
echo "├── S3_BUCKET_NAME (e.g., order-management-invoices-unique)"
echo "└── SNS_TOPIC_ARN (optional)"
echo ""

print_step "Step 8: Create AWS Resources (Optional)"
read -p "Do you want to create AWS resources now? (y/N): " CREATE_AWS

if [[ $CREATE_AWS =~ ^[Yy]$ ]]; then
    print_step "Creating AWS resources..."
    
    # Create S3 bucket
    BUCKET_NAME="order-management-invoices-$(date +%s)"
    if aws s3 mb "s3://$BUCKET_NAME" --region us-east-1; then
        print_success "S3 bucket created: $BUCKET_NAME"
    else
        print_warning "Failed to create S3 bucket (may already exist)"
    fi
    
    # Create DynamoDB table
    if aws dynamodb create-table \
        --table-name orders \
        --attribute-definitions AttributeName=orderId,AttributeType=S \
        --key-schema AttributeName=orderId,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region us-east-1 &> /dev/null; then
        print_success "DynamoDB table 'orders' created"
    else
        print_warning "DynamoDB table 'orders' already exists or creation failed"
    fi
    
    # Create SNS topic
    if TOPIC_ARN=$(aws sns create-topic --name order-notifications --region us-east-1 --query TopicArn --output text); then
        print_success "SNS topic created: $TOPIC_ARN"
    else
        print_warning "Failed to create SNS topic (may already exist)"
    fi
fi

echo ""
print_success "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Configure GitHub Secrets (see above)"
echo "2. Push changes to trigger deployment"
echo "3. Monitor GitHub Actions for deployment status"
echo "4. Access your application once deployed"
echo ""
echo -e "${GREEN}Repository URL: $(git remote get-url origin)${NC}"
echo -e "${GREEN}GitHub Actions: $(git remote get-url origin | sed 's/\.git$//')/actions${NC}"
echo ""
print_success "Happy coding! 🚀"
