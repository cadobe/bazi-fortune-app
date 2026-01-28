#!/bin/bash

# BaZi Fortune App - Vercel Serverless Deployment
# This script deploys to Vercel with external databases

set -e

echo "▲ Deploying BaZi Fortune App to Vercel (Serverless)"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check Vercel CLI
check_vercel_cli() {
    log_step "Checking Vercel CLI..."

    if ! command -v vercel &> /dev/null; then
        log_warn "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi

    log_info "Vercel CLI ready ✅"
}

# Login to Vercel
vercel_login() {
    log_step "Checking Vercel authentication..."

    if ! vercel whoami &> /dev/null; then
        log_warn "Not logged in to Vercel. Please login:"
        vercel login
    fi

    log_info "Vercel authentication verified ✅"
}

# Setup serverless entry point
setup_serverless() {
    log_step "Setting up serverless configuration..."

    # Create serverless entry point if it doesn't exist
    if [ ! -f "api/index.js" ]; then
        mkdir -p api
        cat > api/index.js << 'EOF'
const app = require('../src/app');

module.exports = app;
EOF
        log_info "Created serverless entry point at api/index.js"
    fi

    # Ensure vercel.json exists with correct configuration
    if [ ! -f "vercel.json" ]; then
        log_error "vercel.json not found. Please ensure it exists."
        exit 1
    fi

    log_info "Serverless configuration ready ✅"
}

# Set environment variables
setup_environment() {
    log_step "Setting up environment variables..."

    # Generate JWT secret if not provided
    JWT_SECRET=${JWT_SECRET:-$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || openssl rand -hex 64)}

    # Set environment variables
    vercel env add NODE_ENV production production
    vercel env add JWT_SECRET "$JWT_SECRET" production
    vercel env add JWT_EXPIRE "7d" production

    # Database URLs (these need to be set manually)
    echo ""
    log_warn "⚠️  Database URLs need to be configured manually:"
    echo ""
    echo "Set these environment variables in Vercel dashboard or via CLI:"
    echo "vercel env add MONGODB_URI 'your_mongodb_atlas_connection_string' production"
    echo "vercel env add REDIS_URL 'your_upstash_redis_connection_string' production"

    if [ -n "$OPENAI_API_KEY" ]; then
        vercel env add OPENAI_API_KEY "$OPENAI_API_KEY" production
        log_info "OpenAI API key configured ✅"
    fi

    if [ -n "$FRONTEND_URL" ]; then
        vercel env add FRONTEND_URL "$FRONTEND_URL" production
    fi

    log_info "Environment variables configured ✅"
}

# Show database setup instructions
show_database_setup() {
    log_step "External Database Setup Required"
    echo ""
    echo "🍃 MongoDB Atlas (Recommended):"
    echo "1. Go to https://mongodb.com/atlas"
    echo "2. Create free cluster (512MB)"
    echo "3. Create database user"
    echo "4. Whitelist IP addresses (0.0.0.0/0 for serverless)"
    echo "5. Get connection string"
    echo ""
    echo "🔴 Upstash Redis (Recommended):"
    echo "1. Go to https://upstash.com"
    echo "2. Create free database (10K requests/day)"
    echo "3. Get connection string"
    echo ""
    echo "Alternative: Redis Labs (https://redis.com)"
    echo "• Free tier: 30MB database"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_step "Deploying to Vercel..."

    # Deploy to production
    vercel --prod --yes

    log_info "Deployment completed ✅"
}

# Get deployment URL and test
test_deployment() {
    log_step "Testing deployment..."

    # Get deployment URL
    VERCEL_URL=$(vercel ls --scope $(vercel whoami) | grep "$(basename $PWD)" | head -1 | awk '{print $2}' || echo "")

    if [ -n "$VERCEL_URL" ]; then
        echo "📍 Your API is live at: https://$VERCEL_URL"
        echo "🏥 Health check: https://$VERCEL_URL/health"

        sleep 10

        # Test health endpoint
        if curl -f -s "https://$VERCEL_URL/health" > /dev/null; then
            log_info "✅ Health check passed!"
        else
            log_warn "⚠️  Health check failed. Check Vercel dashboard for logs."
        fi
    else
        log_warn "Could not determine deployment URL. Check Vercel dashboard."
    fi
}

# Show serverless considerations
show_serverless_notes() {
    echo ""
    log_step "Serverless Considerations"
    echo ""
    echo "📝 Important notes for serverless deployment:"
    echo ""
    echo "⚡ Cold Starts:"
    echo "• First request may be slow (1-3 seconds)"
    echo "• Subsequent requests are fast"
    echo "• Consider warming functions if needed"
    echo ""
    echo "💾 Stateless:"
    echo "• No persistent storage between requests"
    echo "• Use external databases for all data"
    echo "• Session storage must be external (Redis/DB)"
    echo ""
    echo "⏱️  Limits:"
    echo "• 10-second timeout for Hobby plan"
    echo "• 60-second timeout for Pro plan"
    echo "• 50MB memory limit"
    echo ""
    echo "🔗 External Services:"
    echo "• All databases must be external"
    echo "• File uploads need external storage (AWS S3, etc.)"
    echo "• Caching relies on Redis/external cache"
}

# Main deployment function
main() {
    echo "▲ Vercel Serverless Deployment"
    echo "==============================="
    echo ""

    check_vercel_cli
    vercel_login
    setup_serverless
    setup_environment
    show_database_setup

    echo ""
    read -p "Have you set up MongoDB Atlas and Upstash Redis? (y/N): " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        deploy_to_vercel
        test_deployment
        show_serverless_notes

        echo ""
        echo "🎉 Vercel deployment completed!"
        echo ""
        echo "Next steps:"
        echo "1. Configure database connection strings"
        echo "2. Test all API endpoints"
        echo "3. Set up custom domain (if needed)"
        echo "4. Monitor function performance"
    else
        echo ""
        log_warn "Please set up external databases first, then run:"
        echo "vercel env add MONGODB_URI 'your_connection_string' production"
        echo "vercel env add REDIS_URL 'your_redis_url' production"
        echo "vercel --prod"
    fi
}

# Handle command line options
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "env")
        setup_environment
        ;;
    "test")
        test_deployment
        ;;
    "help")
        echo "Usage: ./deploy-vercel.sh [command]"
        echo "Commands:"
        echo "  deploy (default)  - Full deployment process"
        echo "  env               - Set up environment variables"
        echo "  test              - Test deployment"
        echo "  help              - Show this help"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use './deploy-vercel.sh help' for usage information"
        exit 1
        ;;
esac