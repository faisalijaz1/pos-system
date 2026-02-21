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
RUN apk add --no-cache curl gettext   # <-- add gettext
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.railway.conf /etc/nginx/conf.d/default.conf.template

# Substitute PORT at runtime
CMD envsubst 8080 < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'