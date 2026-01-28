# Node.js Alpine image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeapp -u 1001

# Copy app source
COPY --chown=nodeapp:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown nodeapp:nodejs logs

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nodeapp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]