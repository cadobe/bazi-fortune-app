#!/bin/bash

# BaZi Fortune App - Production Deployment Script

set -e

echo "🚀 Starting BaZi Fortune App deployment..."

# Configuration
APP_NAME="bazi-fortune-app"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    log_info "Dependencies check passed ✅"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warn "Please update the .env file with your actual configuration values."
            read -p "Press Enter to continue after updating .env file..."
        else
            log_error ".env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    mkdir -p logs uploads nginx/ssl
    chmod 755 logs uploads
    log_info "Directories created ✅"
}

# Build and start services
deploy_services() {
    log_info "Building and starting services..."

    # Stop existing services
    docker-compose down --remove-orphans 2>/dev/null || true

    # Build and start services
    docker-compose build --no-cache
    docker-compose up -d

    log_info "Services started ✅"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:3000/health > /dev/null; then
            log_info "API service is healthy ✅"
            break
        fi

        log_info "Attempt $attempt/$max_attempts - waiting for API service..."
        sleep 10
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "API service failed to start properly"
        docker-compose logs api
        exit 1
    fi
}

# Show deployment status
show_status() {
    log_info "Deployment completed successfully! 🎉"
    echo
    echo "Services Status:"
    docker-compose ps
    echo
    echo "API Health Check:"
    curl -s http://localhost:3000/health | jq . || echo "Health check response received"
    echo
    echo "Useful Commands:"
    echo "  View logs: docker-compose logs -f [service_name]"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  View status: docker-compose ps"
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment failed. Cleaning up..."
        docker-compose down --remove-orphans 2>/dev/null || true
    fi
}

# Main deployment process
main() {
    trap cleanup EXIT

    echo "🚀 BaZi Fortune App - Backend Deployment"
    echo "========================================"

    check_dependencies
    check_env_file
    create_directories
    deploy_services
    wait_for_services
    show_status

    log_info "Backend deployment completed successfully! ✨"
}

# Handle command line arguments
case "${1:-}" in
    "down")
        log_info "Stopping all services..."
        docker-compose down --remove-orphans
        ;;
    "logs")
        docker-compose logs -f "${2:-}"
        ;;
    "status")
        docker-compose ps
        ;;
    "restart")
        docker-compose restart "${2:-}"
        ;;
    *)
        main
        ;;
esac