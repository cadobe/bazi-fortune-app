#!/bin/bash

# BaZi Fortune App - Quick Deploy Script
# This script deploys the backend with all necessary services

echo "🚀 BaZi Fortune App - Quick Deployment"
echo "====================================="

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker found - Using containerized deployment"

    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
        echo "⚠️  Please update .env with your actual configuration!"
    fi

    # Deploy with Docker
    echo "🏗️  Building and starting services..."
    docker-compose up -d --build

    echo "⏳ Waiting for services to start..."
    sleep 10

    # Health check
    if curl -f -s http://localhost:3000/health > /dev/null; then
        echo "✅ API is healthy!"
        echo "🌐 Available at: http://localhost:3000"
        echo "📊 Health check: http://localhost:3000/health"
    else
        echo "❌ API health check failed"
        echo "📋 Check logs: docker-compose logs api"
    fi

else
    echo "⚠️  Docker not found - Using local deployment"
    echo "📋 Prerequisites needed:"
    echo "   - MongoDB running on localhost:27017"
    echo "   - Redis running on localhost:6379"
    echo ""
    echo "🚀 Starting local server..."

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi

    # Start the server
    npm start
fi

echo ""
echo "🎉 Deployment completed!"
echo "📚 View full documentation in README.md"