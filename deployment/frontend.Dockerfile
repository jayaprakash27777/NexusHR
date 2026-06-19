# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (cached layer)
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY frontend/ .

# Build production bundle
RUN npm run build

# Production stage - nginx
FROM nginx:alpine AS runtime

# Custom nginx config
COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
