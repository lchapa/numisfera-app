# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen       8080; \
    server_name  localhost; \
    add_header Content-Security-Policy "default-src * '\''unsafe-inline'\'' '\''unsafe-eval'\'' data: blob:;" always; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page   500 502 503 504  /50x.html; \
    location = /50x.html { \
        root   /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
