# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# VITE_API_URL: set at build time (e.g. Railway backend public URL). Default /api for same-origin.
# Set API base URL at build time
ARG VITE_API_URL=https://pos-system-production-5210.up.railway.app
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage — Nginx (no API proxy; frontend calls backend via VITE_API_URL)
FROM nginx:alpine
RUN apk add --no-cache curl && rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.railway.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
