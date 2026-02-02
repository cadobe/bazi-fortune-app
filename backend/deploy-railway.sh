#!/bin/bash

# BaZi Fortune App - Railway Deployment Script
# This script will deploy your app to Railway with databases

set -e

echo "🚀 Deploying BaZi Fortune App to Railway"
echo "======================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    log_info "Railway CLI is ready ✅"
}

# Login to Railway
railway_login() {
    log_info "Checking Railway authentication..."
    if ! railway whoami &> /dev/null; then
        log_warn "Not logged in to Railway. Please login:"
        railway login
    fi
    log_info "Railway authentication verified ✅"
}

# Initialize project
init_project() {
    log_info "Initializing Railway project..."

    if [ ! -f "railway.json" ]; then
        log_error "railway.json not found. Please run this script from the backend directory."
        exit 1
    fi

    # Check if already connected to Railway
    if [ ! -f ".railway" ]; then
        railway init
    fi

    log_info "Project initialized ✅"
}

# Add databases
setup_databases() {
    log_info "Setting up databases..."

    # Add MongoDB
    log_info "Adding MongoDB..."
    railway add --plugin mongodb || log_warn "MongoDB might already exist"

    # Add Redis
    log_info "Adding Redis..."
    railway add --plugin redis || log_warn "Redis might already exist"

    log_info "Databases configured ✅"
}

# Set environment variables
set_environment() {
    log_info "Setting environment variables..."

    # Generate JWT secret if not provided
    JWT_SECRET=${JWT_SECRET:-$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || openssl rand -hex 64)}

    # Set required variables
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set JWT_EXPIRE=7d

    # Optional variables
    if [ -n "$OPENAI_API_KEY" ]; then
        railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
        log_info "OpenAI API key configured ✅"
    else
        log_warn "OPENAI_API_KEY not set. AI features will use fallback mode."
    fi

    if [ -n "$FRONTEND_URL" ]; then
        railway variables set FRONTEND_URL="$FRONTEND_URL"
    fi

    log_info "Environment variables configured ✅"
}

# Deploy application
deploy_app() {
    log_info "Deploying application..."

    # Deploy to Railway
    railway up --detach

    log_info "Deployment initiated ✅"
}

# Wait for deployment and get URL
get_deployment_info() {
    log_info "Waiting for deployment to complete..."

    # Wait a bit for deployment
    sleep 30

    # Get the deployment URL
    RAILWAY_URL=$(railway domain 2>/dev/null || echo "Not available yet")

    if [ "$RAILWAY_URL" != "Not available yet" ]; then
        log_info "🎉 Deployment successful!"
        echo "📍 Your API is live at: https://$RAILWAY_URL"
        echo "🏥 Health check: https://$RAILWAY_URL/health"
        echo "🧪 Test endpoint: https://$RAILWAY_URL/api/test"
    else
        log_warn "Deployment URL not ready yet. Check Railway dashboard."
    fi
}

# Test deployment
test_deployment() {
    if [ -n "$RAILWAY_URL" ] && [ "$RAILWAY_URL" != "Not available yet" ]; then
        log_info "Testing deployment..."

        # Wait a bit more for services to start
        sleep 30

        if curl -f -s "https://$RAILWAY_URL/health" > /dev/null; then
            log_info "✅ Health check passed!"
            curl -s "https://$RAILWAY_URL/health" | head -3
        else
            log_warn "⚠️  Health check failed. The app might still be starting up."
            log_info "Check deployment status: railway logs"
        fi
    fi
}

# Main deployment process
main() {
    echo "🚂 Railway Deployment for BaZi Fortune App"
    echo "==========================================="

    check_railway_cli
    railway_login
    init_project
    setup_databases
    set_environment
    deploy_app
    get_deployment_info
    test_deployment

    echo ""
    echo "🎊 Railway deployment completed!"
    echo ""
    echo "Useful commands:"
    echo "  railway logs          - View application logs"
    echo "  railway variables     - Manage environment variables"
    echo "  railway status        - Check deployment status"
    echo "  railway shell         - Access production shell"
    echo "  railway link          - Link to different project"
    echo ""
    echo "Next steps:"
    echo "1. Update your frontend to use the new API URL"
    echo "2. Test all API endpoints"
    echo "3. Configure custom domain (if needed)"
    echo "4. Set up monitoring and alerts"
}

# Handle command line options
case "${1:-deploy}" in
    "logs")
        railway logs -f
        ;;
    "status")
        railway status
        ;;
    "vars")
        railway variables
        ;;
    "deploy")
        main
        ;;
    "help")
        echo "Usage: ./deploy-railway.sh [command]"
        echo "Commands:"
        echo "  deploy (default)  - Deploy the application"
        echo "  logs              - View logs"
        echo "  status            - Check status"
        echo "  vars              - View environment variables"
        echo "  help              - Show this help"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use './deploy-railway.sh help' for usage information"
        exit 1
        ;;
esac