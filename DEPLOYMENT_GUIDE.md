# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying FinPoints to production environments. We cover deployment to Vercel, AWS, and self-hosted options.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Vercel Deployment](#vercel-deployment)
4. [AWS Deployment](#aws-deployment)
5. [Self-Hosted Deployment](#self-hosted-deployment)
6. [Database Setup](#database-setup)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`npm test`)
- [ ] No console errors in development
- [ ] Environment variables configured
- [ ] Database schema initialized
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Backup strategy defined
- [ ] SSL certificates ready
- [ ] Domain configured
- [ ] CDN setup (optional)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Monitoring tools setup

---

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following variables:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://finpoints.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/finpoints
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Session & Security
SESSION_SECRET=<64-character-hex-string>
ENCRYPTION_KEY=<64-character-hex-string>
SESSION_TIMEOUT=900000

# Rate Limiting
ENABLE_RATE_LIMITING=true
REDIS_URL=redis://host:6379 # Optional, for distributed rate limiting

# CORS
ALLOWED_ORIGINS=https://finpoints.com,https://www.finpoints.com

# Logging & Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://...@sentry.io/...

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@finpoints.com
SMTP_PASSWORD=<password>
```

### Generating Secure Keys

```bash
# Session secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption key (64 characters, 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Security Note**: Never commit `.env` files to version control. Use a secrets management service in production.

---

## Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Project

Create `vercel.json` in the project root:

```json
{
  "version": 2,
  "env": {
    "DATABASE_URL": "@database-url",
    "SESSION_SECRET": "@session-secret",
    "ENCRYPTION_KEY": "@encryption-key"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "regions": ["sin1"],
  "framework": "nextjs"
}
```

### Step 4: Add Environment Variables

```bash
# Add secrets to Vercel
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add ENCRYPTION_KEY
# ... add all other environment variables
```

### Step 5: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 6: Configure Custom Domain

```bash
vercel domains add finpoints.com
vercel domains add www.finpoints.com
```

### Database for Vercel

**Option A: Vercel Postgres**
```bash
vercel postgres create
```

**Option B: External PostgreSQL** (Recommended)
- Use AWS RDS, Supabase, or Neon
- Better performance and control
- Easier backups and scaling

---

## AWS Deployment

### Architecture

```
┌─────────────────┐
│   CloudFront    │ (CDN)
└────────┬────────┘
         │
┌────────▼────────┐
│   Route 53      │ (DNS)
└────────┬────────┘
         │
┌────────▼────────┐
│   ALB/ELB       │ (Load Balancer)
└────────┬────────┘
         │
┌────────▼────────┐
│  ECS/EC2        │ (Application)
└────────┬────────┘
         │
┌────────▼────────┐
│   RDS Postgres  │ (Database)
└─────────────────┘
```

### Step 1: Set Up RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier finpoints-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.9 \
  --master-username finpointsadmin \
  --master-user-password <secure-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name finpoints-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --storage-encrypted
```

### Step 2: Create ECR Repository

```bash
# Create repository for Docker images
aws ecr create-repository --repository-name finpoints
```

### Step 3: Build and Push Docker Image

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and push:

```bash
# Build image
docker build -t finpoints .

# Tag for ECR
docker tag finpoints:latest <account-id>.dkr.ecr.<region>.amazonaws.com/finpoints:latest

# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Push image
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/finpoints:latest
```

### Step 4: Create ECS Cluster and Service

Create `ecs-task-definition.json`:

```json
{
  "family": "finpoints",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "finpoints-app",
      "image": "<account-id>.dkr.ecr.<region>.amazonaws.com/finpoints:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:finpoints/database-url"
        },
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:finpoints/session-secret"
        },
        {
          "name": "ENCRYPTION_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:finpoints/encryption-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/finpoints",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Deploy:

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster finpoints-cluster \
  --service-name finpoints-service \
  --task-definition finpoints \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/finpoints,containerName=finpoints-app,containerPort=3000"
```

### Step 5: Configure CloudFront

```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Step 6: Set Up Route 53

```bash
# Create hosted zone
aws route53 create-hosted-zone --name finpoints.com

# Add A record for CloudFront
aws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch file://route53-change.json
```

---

## Self-Hosted Deployment

### Requirements

- Ubuntu 20.04 LTS or later
- 2+ CPU cores
- 4GB+ RAM
- 20GB+ SSD storage
- PostgreSQL 14+
- Node.js 18+
- Nginx
- SSL certificate (Let's Encrypt)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE finpoints;
CREATE USER finpoints WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE finpoints TO finpoints;
\q

# Initialize schema
psql -U finpoints -d finpoints -f scripts/init-db.sql
```

### Step 3: Application Setup

```bash
# Clone repository
git clone https://github.com/your-org/finpoints.git /var/www/finpoints
cd /var/www/finpoints

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Configure environment
cp .env.example .env.production
nano .env.production
# (Fill in production values)
```

### Step 4: Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'finpoints',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/finpoints',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/finpoints/error.log',
    out_file: '/var/log/finpoints/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

Start application:

```bash
# Create log directory
sudo mkdir -p /var/log/finpoints
sudo chown -R $USER:$USER /var/log/finpoints

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/finpoints`:

```nginx
upstream finpoints_upstream {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name finpoints.com www.finpoints.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name finpoints.com www.finpoints.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/finpoints.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finpoints.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Proxy to Node.js
    location / {
        proxy_pass http://finpoints_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://finpoints_upstream;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req zone=general burst=20 nodelay;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/finpoints /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d finpoints.com -d www.finpoints.com

# Auto-renewal (cron job)
sudo crontbot -e
# Add: 0 3 * * * certbot renew --quiet
```

---

## Database Setup

### Production Database Configuration

```sql
-- Create read-only user for reporting
CREATE USER finpoints_readonly WITH ENCRYPTED PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE finpoints TO finpoints_readonly;
GRANT USAGE ON SCHEMA public TO finpoints_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO finpoints_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO finpoints_readonly;

-- Create backup user
CREATE USER finpoints_backup WITH ENCRYPTED PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE finpoints TO finpoints_backup;
GRANT USAGE ON SCHEMA public TO finpoints_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO finpoints_backup;

-- Performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
SELECT pg_reload_conf();
```

### Backup Strategy

**Automated Daily Backups:**

Create `/usr/local/bin/backup-finpoints.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/finpoints"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="finpoints_backup_$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Run pg_dump
pg_dump -U finpoints finpoints | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "finpoints_backup_*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/$FILENAME" s3://finpoints-backups/database/
```

Make executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/backup-finpoints.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-finpoints.sh
```

---

## Post-Deployment

### Step 1: Verify Deployment

```bash
# Check application status
pm2 status  # (self-hosted)
# or
vercel ls  # (Vercel)

# Test endpoints
curl https://finpoints.com/api/auth/session
curl https://finpoints.com/api/banks
```

### Step 2: Configure Monitoring

**Sentry (Error Tracking):**

```bash
npm install @sentry/nextjs
```

Add to `sentry.client.config.js`:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Datadog (APM):**

```bash
npm install dd-trace
```

**CloudWatch (AWS):**

Already configured in ECS task definition.

### Step 3: Set Up Alerts

Configure alerts for:
- High error rates
- Slow API responses (> 2s)
- Database connection failures
- High memory usage
- SSL certificate expiration
- Disk space < 20%

---

## Monitoring & Maintenance

### Health Checks

Create `/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET() {
  try {
    // Check database connection
    await pool.query("SELECT 1");
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: "Database connection failed"
    }, { status: 503 });
  }
}
```

### Log Rotation

Configure logrotate (`/etc/logrotate.d/finpoints`):

```
/var/log/finpoints/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Regular Maintenance

**Weekly:**
- Review error logs
- Check disk space
- Verify backups

**Monthly:**
- Update dependencies (`npm update`)
- Security audit (`npm audit`)
- Database vacuum (`VACUUM ANALYZE;`)
- Review performance metrics

**Quarterly:**
- Security penetration testing
- Disaster recovery drill
- Capacity planning review

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common deployment issues and solutions.

---

## Rollback Procedure

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### AWS ECS

```bash
# Update service to previous task definition
aws ecs update-service \
  --cluster finpoints-cluster \
  --service finpoints-service \
  --task-definition finpoints:<previous-revision>
```

### Self-Hosted

```bash
# Stop application
pm2 stop finpoints

# Checkout previous version
git checkout <previous-commit>

# Rebuild
npm run build

# Start application
pm2 start finpoints
```

---

## Support

For deployment support:
- Email: devops@finpoints.com
- Slack: #deployment-support

---

**Last Updated:** January 2024
