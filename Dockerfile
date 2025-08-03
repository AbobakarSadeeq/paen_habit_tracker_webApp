# Multi-stage build for Angular app

# Stage 1: Build the Angular app
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx content first
RUN rm -rf /usr/share/nginx/html/*

# Copy built app contents to nginx (note the trailing slash)
COPY --from=build /app/dist/paen-habit-tracker-web-app/browser/ /usr/share/nginx/html/

# Fix permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
