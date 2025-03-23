# Build stage
FROM node:16-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Fix Babel config before copying all files
COPY babel.config.js ./
RUN if grep -q "export default" babel.config.js; then \
      sed -i 's/export default/module.exports =/' babel.config.js; \
    fi

COPY . .
# Make sure imports include file extensions
RUN find src -type f -name "*.js" -exec sed -i 's/from ["\']\.\/App["\']/from ".\/App.js"/g' {} \;
RUN find src -type f -name "*.js" -exec sed -i 's/from ["\']\.\.\/App["\']/from "..\/App.js"/g' {} \;

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]