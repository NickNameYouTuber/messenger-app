# Build stage
FROM node:alpine as builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy source files and build
COPY app.js .
COPY app-logic.js .
COPY webpack.config.js .
RUN npm run build

# Production stage
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy built files from builder stage
COPY --from=builder /app/dist/bundle.js /usr/share/nginx/html/
COPY world-time-city-website.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/nginx.conf

RUN rm -f /etc/nginx/conf.d/default.conf
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]