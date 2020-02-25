FROM nginx

ADD ./dist /www
ADD ./nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 8081
