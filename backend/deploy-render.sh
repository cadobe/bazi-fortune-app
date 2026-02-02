#!/bin/bash

# BaZi Fortune App - Render Deployment Script
# This script helps deploy to Render.com

set -e

echo "🎨 Deploying BaZi Fortune App to Render"
echo "======================================"

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

# Check if git repository exists
check_git() {
    log_step "Checking Git repository..."

    if [ ! -d ".git" ]; then
        log_warn "Git repository not found. Initializing..."
        git init
        git add .
        git commit -m "Initial commit for Render deployment"
    fi

    # Check if remote exists
    if ! git remote get-url origin &> /dev/null; then
        log_warn "No Git remote found."
        echo ""
        echo "Please set up a GitHub repository:"
        echo "1. Create a new repository on GitHub"
        echo "2. Run: git remote add origin https://github.com/yourusername/bazi-fortune-app.git"
        echo "3. Run: git push -u origin main"
        echo "4. Then run this script again"
        exit 1
    fi

    log_info "Git repository ready ✅"
}

# Push latest changes
push_changes() {
    log_step "Pushing latest changes to GitHub..."

    git add .
    git commit -m "Deploy to Render: $(date)" || log_info "No changes to commit"
    git push origin main

    log_info "Changes pushed ✅"
}

# Generate environment variables
generate_env_vars() {
    log_step "Generating environment variables..."

    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || openssl rand -hex 64)

    cat > .env.render << EOF
NODE_ENV=production
PORT=10000
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d
EOF

    if [ -n "$OPENAI_API_KEY" ]; then
        echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env.render
    fi

    if [ -n "$FRONTEND_URL" ]; then
        echo "FRONTEND_URL=$FRONTEND_URL" >> .env.render
    fi

    log_info "Environment variables generated ✅"
    echo "📝 Environment variables saved to .env.render"
}

# Show deployment instructions
show_instructions() {
    log_step "Render Deployment Instructions"
    echo ""
    echo "🌐 Go to https://render.com and follow these steps:"
    echo ""
    echo "1. Sign up/Login to Render"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Configure the service:"
    echo "   • Name: bazi-fortune-api"
    echo "   • Branch: main"
    echo "   • Root Directory: backend (if deploying from subdirectory)"
    echo "   • Runtime: Node"
    echo "   • Build Command: npm install"
    echo "   • Start Command: npm start"
    echo ""
    echo "5. Add Environment Variables from .env.render:"
    cat .env.render | sed 's/^/   • /'
    echo ""
    echo "6. Add Databases:"
    echo "   • Create PostgreSQL database (or use external MongoDB)"
    echo "   • Create Redis instance"
    echo ""
    echo "7. Update MONGODB_URI and REDIS_URL in environment variables"
    echo ""
    echo "Alternative: Use render.yaml for automatic configuration:"
    echo "   • Upload render.yaml to your repository"
    echo "   • Use 'Deploy from Repository' option"
    echo "   • Render will auto-configure everything"
}

# Show database setup
show_database_setup() {
    echo ""
    log_step "Database Setup Options"
    echo ""
    echo "Option 1: Render Databases (Recommended)"
    echo "• PostgreSQL: Free 1GB, then $7/month"
    echo "• Redis: $7/month for 25MB"
    echo "• Easy integration with environment variables"
    echo ""
    echo "Option 2: External Databases"
    echo "• MongoDB Atlas: Free 512MB"
    echo "• Upstash Redis: Free 10K requests/day"
    echo "• More setup required but potentially cheaper"
    echo ""
    echo "Environment variables needed:"
    echo "MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bazi-fortune"
    echo "REDIS_URL=redis://user:pass@host:port"
}

# Show post-deployment steps
show_post_deployment() {
    echo ""
    log_step "After Deployment"
    echo ""
    echo "✅ Verification steps:"
    echo "1. Check deployment logs in Render dashboard"
    echo "2. Test health endpoint: https://your-app.onrender.com/health"
    echo "3. Test API endpoint: https://your-app.onrender.com/api/test"
    echo ""
    echo "⚙️ Configuration:"
    echo "1. Set up custom domain (if needed)"
    echo "2. Configure CORS for your frontend domain"
    echo "3. Set up monitoring and alerts"
    echo "4. Enable auto-deploy on git push"
    echo ""
    echo "📊 Monitoring:"
    echo "• View logs in Render dashboard"
    echo "• Set up health check notifications"
    echo "• Monitor database performance"
}

# Main function
main() {
    echo "🎨 Render Deployment Helper"
    echo "==========================="
    echo ""

    check_git
    push_changes
    generate_env_vars
    show_instructions
    show_database_setup
    show_post_deployment

    echo ""
    echo "🎉 Ready for Render deployment!"
    echo "Follow the instructions above to complete the deployment."
}

# Handle command line options
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "push")
        check_git
        push_changes
        log_info "Changes pushed to GitHub ✅"
        ;;
    "env")
        generate_env_vars
        log_info "Environment variables generated ✅"
        ;;
    "help")
        echo "Usage: ./deploy-render.sh [command]"
        echo "Commands:"
        echo "  deploy (default)  - Show full deployment guide"
        echo "  push              - Push changes to GitHub"
        echo "  env               - Generate environment variables"
        echo "  help              - Show this help"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use './deploy-render.sh help' for usage information"
        exit 1
        ;;
esac