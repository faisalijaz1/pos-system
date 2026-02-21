# Build stage
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.railway.conf /etc/nginx/conf.d/default.conf

# Debug: show files
RUN echo "=== Contents of /usr/share/nginx/html ===" && ls -la /usr/share/nginx/html/
RUN echo "=== nginx config ===" && cat /etc/nginx/conf.d/default.conf

# Use PORT env var (Railway sets this to 8080 typically)
EXPOSE ${PORT:-8080}

# No health check for now
CMD ["nginx", "-g", "daemon off;"]