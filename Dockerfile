FROM node:20-alpine
WORKDIR /app
COPY package.json server.js ./
COPY public ./public
RUN mkdir -p /data/movies /app/data
ENV PORT=3000 MOVIES_DIR=/data/movies DATA_DIR=/app/data
EXPOSE 3000
VOLUME ["/data/movies","/app/data"]
CMD ["node","server.js"]
