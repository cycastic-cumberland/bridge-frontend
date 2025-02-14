FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

ARG VITE_BACKEND_ORIGIN

RUN echo "${VITE_BACKEND_ORIGIN}" > /.env
RUN npm run build

FROM nginx:1.25.3-alpine-slim

COPY conf/default.conf /etc/nginx/conf.d

COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

