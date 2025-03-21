FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY world-time-city-website.html /usr/share/nginx/html/index.html
COPY world-time-city-tests.js /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]