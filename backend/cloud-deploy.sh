#!/bin/bash

# BaZi Fortune App - Universal Cloud Deployment Selector
# This script helps you choose and deploy to the best cloud platform

set -e

echo "☁️  BaZi Fortune App - Cloud Deployment Selector"
echo "==============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Show platform comparison
show_platforms() {
    echo ""
    echo -e "${PURPLE}🏆 RECOMMENDED CLOUD PLATFORMS${NC}"
    echo "================================"
    echo ""
    echo -e "${GREEN}1. Railway${NC} (⭐⭐⭐⭐⭐ EASIEST)"
    echo "   • 🚀 Deploy: 5 minutes"
    echo "   • 💰 Cost: \$5/month (includes databases)"
    echo "   • 🛢️  MongoDB + Redis included"
    echo "   • ✅ Auto SSL, scaling, monitoring"
    echo "   • 🎯 Best for: Beginners, rapid prototyping"
    echo ""
    echo -e "${CYAN}2. Render${NC} (⭐⭐⭐⭐ RELIABLE)"
    echo "   • 🚀 Deploy: 10 minutes"
    echo "   • 💰 Cost: \$7/month + databases"
    echo "   • 🛢️  PostgreSQL, Redis available"
    echo "   • ✅ Great uptime, solid support"
    echo "   • 🎯 Best for: Production apps, teams"
    echo ""
    echo -e "${YELLOW}3. Vercel${NC} (⭐⭐⭐ SERVERLESS)"
    echo "   • 🚀 Deploy: 15 minutes"
    echo "   • 💰 Cost: Free + external DB costs"
    echo "   • 🛢️  External databases required"
    echo "   • ✅ Global CDN, instant scaling"
    echo "   • 🎯 Best for: High-traffic, global apps"
    echo ""
    echo -e "${BLUE}4. DigitalOcean${NC} (⭐⭐⭐ SCALABLE)"
    echo "   • 🚀 Deploy: 20 minutes"
    echo "   • 💰 Cost: \$12/month + \$30 databases"
    echo "   • 🛢️  Managed databases available"
    echo "   • ✅ Full control, predictable pricing"
    echo "   • 🎯 Best for: Growing businesses"
}

# Platform selection
select_platform() {
    echo ""
    echo -e "${PURPLE}Choose your deployment platform:${NC}"
    echo "1) Railway (Recommended - Easiest)"
    echo "2) Render (Great alternative)"
    echo "3) Vercel (Serverless)"
    echo "4) DigitalOcean (Scalable)"
    echo "5) Show detailed comparison"
    echo "6) Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice

    case $choice in
        1)
            deploy_railway
            ;;
        2)
            deploy_render
            ;;
        3)
            deploy_vercel
            ;;
        4)
            deploy_digitalocean
            ;;
        5)
            show_detailed_comparison
            select_platform
            ;;
        6)
            echo "Deployment cancelled."
            exit 0
            ;;
        *)
            log_error "Invalid choice. Please select 1-6."
            select_platform
            ;;
    esac
}

# Individual deployment functions
deploy_railway() {
    log_step "🚂 Deploying to Railway..."
    if [ -x "./deploy-railway.sh" ]; then
        ./deploy-railway.sh
    else
        log_error "Railway deployment script not found or not executable."
        log_info "Run: chmod +x ./deploy-railway.sh"
    fi
}

deploy_render() {
    log_step "🎨 Preparing Render deployment..."
    if [ -x "./deploy-render.sh" ]; then
        ./deploy-render.sh
    else
        log_error "Render deployment script not found or not executable."
        log_info "Run: chmod +x ./deploy-render.sh"
    fi
}

deploy_vercel() {
    log_step "▲ Deploying to Vercel..."
    if [ -x "./deploy-vercel.sh" ]; then
        ./deploy-vercel.sh
    else
        log_error "Vercel deployment script not found or not executable."
        log_info "Run: chmod +x ./deploy-vercel.sh"
    fi
}

deploy_digitalocean() {
    log_step "🌊 DigitalOcean deployment guide..."
    echo ""
    echo "DigitalOcean App Platform deployment:"
    echo "1. Push code to GitHub"
    echo "2. Go to https://cloud.digitalocean.com/apps"
    echo "3. Create New App"
    echo "4. Connect GitHub repository"
    echo "5. Use .do/app.yaml configuration"
    echo "6. Review and deploy"
    echo ""
    echo "For detailed instructions, see DEPLOYMENT.md"
}

# Show detailed comparison
show_detailed_comparison() {
    echo ""
    echo -e "${PURPLE}📊 DETAILED PLATFORM COMPARISON${NC}"
    echo "================================="
    echo ""
    printf "%-15s %-12s %-15s %-12s %-20s\n" "Platform" "Setup Time" "Monthly Cost" "Free Tier" "Best For"
    echo "--------------------------------------------------------------------------------"
    printf "%-15s %-12s %-15s %-12s %-20s\n" "Railway" "5 min" "\$5" "Trial only" "Beginners, Speed"
    printf "%-15s %-12s %-15s %-12s %-20s\n" "Render" "10 min" "\$7+" "Limited" "Production apps"
    printf "%-15s %-12s %-15s %-12s %-20s\n" "Vercel" "15 min" "Free+DB" "Generous" "Global, Serverless"
    printf "%-15s %-12s %-15s %-12s %-20s\n" "DigitalOcean" "20 min" "\$42+" "Credit" "Full control"
    printf "%-15s %-12s %-15s %-12s %-20s\n" "AWS" "30 min" "\$20+" "1 year free" "Enterprise"
    printf "%-15s %-12s %-15s %-12s %-20s\n" "Google Cloud" "25 min" "\$25+" "\$300 credit" "AI integration"
    echo ""
    echo "💡 Recommendation: Start with Railway for fastest deployment"
    echo "   You can always migrate later as your app grows!"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "server.js" ]; then
        log_error "Please run this script from the backend directory."
        exit 1
    fi

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi

    # Check git
    if ! command -v git &> /dev/null; then
        log_warn "Git is not installed. Some platforms require Git."
    fi

    log_info "Prerequisites checked ✅"
}

# Show environment variables needed
show_env_requirements() {
    echo ""
    log_step "🔐 Environment Variables Required"
    echo ""
    echo "Required variables (auto-generated if not set):"
    echo "• JWT_SECRET - Secure random key for authentication"
    echo ""
    echo "Optional variables (for full functionality):"
    echo "• OPENAI_API_KEY - For AI analysis features"
    echo "• FRONTEND_URL - Your frontend domain for CORS"
    echo ""
    echo "Database variables (platform-specific):"
    echo "• MONGODB_URI - MongoDB connection string"
    echo "• REDIS_URL - Redis connection string"
    echo ""
    if [ -z "$OPENAI_API_KEY" ]; then
        log_warn "💡 OPENAI_API_KEY not set. AI features will use fallback mode."
        echo "   Get your API key from: https://platform.openai.com/api-keys"
    fi
}

# Main function
main() {
    echo ""
    echo "🎯 This script will help you deploy the BaZi Fortune App backend"
    echo "   to the best cloud platform for your needs."
    echo ""

    check_prerequisites
    show_env_requirements
    show_platforms
    select_platform
}

# Handle command line arguments
case "${1:-}" in
    "railway")
        deploy_railway
        ;;
    "render")
        deploy_render
        ;;
    "vercel")
        deploy_vercel
        ;;
    "digitalocean"|"do")
        deploy_digitalocean
        ;;
    "compare")
        show_detailed_comparison
        ;;
    "help")
        echo "Usage: ./cloud-deploy.sh [platform]"
        echo "Platforms: railway, render, vercel, digitalocean"
        echo "Options: compare, help"
        echo ""
        echo "Running without arguments will show interactive menu."
        ;;
    *)
        main
        ;;
esac