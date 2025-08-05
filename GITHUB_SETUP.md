# 🚀 GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `real-time-order-management`
3. Make it **Public** or **Private** (your choice)
4. **Don't** initialize with README (we already have files)

## Step 2: Configure GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these **REQUIRED** secrets:

```
Name: AWS_ACCESS_KEY_ID
Value: AKIA... (your AWS access key)

Name: AWS_SECRET_ACCESS_KEY
Value: abc123... (your AWS secret key)

Name: AWS_REGION
Value: us-east-1 (or your preferred region)
```

### Additional Optional Secrets:
```
Name: DYNAMODB_TABLE_NAME
Value: orders

Name: S3_BUCKET_NAME
Value: order-management-invoices-your-unique-suffix

Name: SNS_TOPIC_ARN
Value: arn:aws:sns:us-east-1:YOUR-ACCOUNT:order-notifications
```

## Step 3: Push Code to GitHub

Run these commands in your terminal:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "🎉 Initial commit: Real-time Order Management System"

# Add remote origin (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/real-time-order-management.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: AWS Setup Requirements

### 4.1 Create S3 Bucket
```bash
aws s3 mb s3://order-management-invoices-your-unique-suffix --region us-east-1
```

### 4.2 Create DynamoDB Table
```bash
aws dynamodb create-table \
    --table-name orders \
    --attribute-definitions \
        AttributeName=orderId,AttributeType=S \
    --key-schema \
        AttributeName=orderId,KeyType=HASH \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region us-east-1
```

### 4.3 Create SNS Topic
```bash
aws sns create-topic --name order-notifications --region us-east-1
```

## Step 5: Verify Deployment

1. **Push code** to `main` branch
2. **Check Actions tab** in GitHub repository
3. **Monitor deployment** progress
4. **Access application** via AWS ECS/ECR endpoints

## 🔧 Local Development

### Backend (Port 3001)
```bash
cd order-service
npm install
npm run dev
```

### Frontend (Port 3000)
```bash
cd order-ui
npm install
npm start
```

## 📦 Project Structure

```
├── 📁 .github/workflows/     # CI/CD pipeline
├── 📁 order-service/         # Node.js backend
├── 📁 order-ui/             # React frontend
├── 📁 public/               # Static assets
├── 📄 docker-compose.yml    # Local development
├── 📄 README.md             # Documentation
└── 📄 .env                  # Environment variables
```

## 🚀 Features

✅ **Real-time Order Management**
✅ **AWS Integration** (DynamoDB, S3, SNS)
✅ **File Upload** with validation
✅ **Responsive Design** with animations
✅ **TypeScript** for type safety
✅ **CI/CD Pipeline** with GitHub Actions
✅ **Docker** containerization
✅ **Error Handling** and logging

## 🔐 Security Notes

- Never commit AWS credentials to code
- Use GitHub Secrets for sensitive data
- Enable MFA on AWS account
- Use IAM roles with minimal permissions
- Regularly rotate access keys

## 📞 Support

If deployment fails:
1. Check GitHub Actions logs
2. Verify AWS credentials
3. Ensure AWS resources exist
4. Check environment variables

---
**Ready to deploy!** 🎯
