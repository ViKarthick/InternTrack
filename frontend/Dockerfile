# --- InternTrack frontend (React, built and served via nginx) ---

# Stage 1: build the React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# CRA environment variables are embedded during the build.
ARG REACT_APP_INTERNSHIP_SCRIPT_URL
ARG REACT_APP_AUTH_SCRIPT_URL
ARG REACT_APP_UPLOAD_URL
ARG REACT_APP_VERIFY_URL

ENV REACT_APP_INTERNSHIP_SCRIPT_URL=$REACT_APP_INTERNSHIP_SCRIPT_URL
ENV REACT_APP_AUTH_SCRIPT_URL=$REACT_APP_AUTH_SCRIPT_URL
ENV REACT_APP_UPLOAD_URL=$REACT_APP_UPLOAD_URL
ENV REACT_APP_VERIFY_URL=$REACT_APP_VERIFY_URL

RUN npm run build

# Stage 2: serve the static build with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]