# Use official nginx alpine as base image (lightweight)
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy all necessary frontend files
COPY world-time-city-website.html /usr/share/nginx/html/index.html
COPY app.js /usr/share/nginx/html/
COPY app-logic.js /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default nginx configuration if it exists
RUN rm -f /etc/nginx/conf.d/default.conf

# Ensure proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
