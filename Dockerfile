FROM nginx

ADD ./dist /app
ADD ./nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 8001
